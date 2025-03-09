import os
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import TimeoutError as ConnectionTimeoutError
from retell import Retell
from custom_types import ConfigResponse, ResponseRequiredRequest, ResponseResponse
from letta_client import CreateBlock, Letta, MessageCreate, AsyncLetta

agent_id = "agent-d5bbe3d9-6f4a-496c-a455-9b6ef4b82b5d"

load_dotenv(override=True)
app = FastAPI()
origins = ["http://localhost:3000", "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

retell = Retell(api_key=os.environ["RETELL_API_KEY"])


# WebSocket server for exchanging messages with the Retell server.
@app.websocket("/llm-websocket/{call_id}")
async def websocket_handler(websocket: WebSocket, call_id: str):
    try:
        await websocket.accept()
        client = Client()
        await client.reset()

        # Send configuration to the Retell server
        config = ConfigResponse(
            response_type="config",
            config={
                "auto_reconnect": True,
                "call_details": True,
            },
            response_id=1,
        )
        await websocket.send_json(config.__dict__)
        response_id = 0

        async def handle_message(request_json):
            nonlocal response_id
            if request_json["interaction_type"] == "call_details":
                stream = client.message(
                    "(The user has called in and you should greet them.)",
                    0,
                )
                async for event in stream:
                    await websocket.send_json(event.__dict__)
                return
            if request_json["interaction_type"] == "ping_pong":
                pong_response = {
                    "response_type": "ping_pong",
                    "timestamp": request_json["timestamp"],
                }
                print("Sending ping pong response:", pong_response)
                await websocket.send_json(pong_response)
                return
            if request_json.get("interaction_type") == "update_only":
                print("Update only interaction received, ignoring.")
                return
            if request_json["interaction_type"] in [
                "response_required",
                "reminder_required",
            ]:
                response_id = request_json["response_id"]
                transcript = request_json.get("transcript", [])
                print("Transcript:", transcript)
                print("response_id:", response_id)

                request_obj = ResponseRequiredRequest(
                    interaction_type=request_json["interaction_type"],
                    response_id=response_id,
                    transcript=transcript,
                )

                if request_obj.interaction_type == "reminder_required":
                    stream = client.message(
                        "(Now the user has not responded in a while, you would say:)",
                        response_id,
                    )
                    async for event in stream:
                        await websocket.send_json(event.__dict__)
                    return
                else:
                    # Get the last message spoken by the user
                    last_user_message = None
                    for utterance in reversed(transcript):
                        if utterance["role"] == "user":
                            last_user_message = utterance["content"]
                            break

                    if last_user_message is not None:
                        print("Last user message:", last_user_message)
                        # Process the user's message
                        stream = client.message(last_user_message, response_id)
                        async for event in stream:
                            await websocket.send_json(event.__dict__)
                        return
                    else:
                        # Handle case where no user message was found
                        print("No user message found in transcript")
                        response = ResponseResponse(
                            response_type="response",
                            response_id=response_id,
                            content="I'm sorry, I didn't catch that. Could you please repeat?",
                            content_complete=True,
                        )
                        await websocket.send_json(response.__dict__)
                        return

        async for data in websocket.iter_json():
            asyncio.create_task(handle_message(data))

    except WebSocketDisconnect:
        print(f"LLM WebSocket disconnected for {call_id}")
    except ConnectionTimeoutError as e:
        print(f"Connection timeout error for {call_id}: {e}")
    except Exception as e:
        print(f"Error in LLM WebSocket: {e} for call_id: {call_id}")
        await websocket.close(1011, "Server error")
    finally:
        print(f"LLM WebSocket connection closed for {call_id}")


class Client:
    def __init__(self):
        self.client = AsyncLetta(
            base_url="http://localhost:8283",
        )

    async def reset(self):
        await self.client.agents.reset_messages(agent_id=agent_id)

    async def message(self, query: str, response_id: int):
        stream = self.client.agents.messages.create_stream(
            agent_id=agent_id,
            messages=[
                MessageCreate(
                    role="user",
                    content=query
                    + "(Remember, always respond back to the user after making a tool call. Do this by making a send_message tool call.)",
                ),
            ],
            stream_tokens=True,
        )

        try:
            num_to_skip = 12
            characters = 0
            accumulated_text = ""
            async for chunk in stream:
                if chunk.message_type == "assistant_message":
                    # Handle initial skipping
                    if characters < num_to_skip:
                        if len(chunk.content) <= num_to_skip - characters:
                            characters += len(chunk.content)
                            continue
                        else:
                            content = chunk.content[(num_to_skip - characters) :]
                            characters = num_to_skip
                    else:
                        content = chunk.content

                    # Accumulate text
                    accumulated_text += content

                    # Check if we have punctuation to output
                    punctuation_indices = [
                        accumulated_text.find(p)
                        for p in [".", "!", "?"]
                        if p in accumulated_text
                    ]

                    if punctuation_indices:
                        # Find the earliest punctuation
                        end_idx = min(punctuation_indices) + 1
                        output_text = accumulated_text[:end_idx]

                        # Check if output contains a comma
                        if '","' in output_text:
                            comma_idx = output_text.find('","')
                            output_text = output_text[:comma_idx]
                            print(output_text, end="", flush=True)
                            yield ResponseResponse(
                                response_id=response_id,
                                content=output_text,
                                content_complete=True,
                                end_call=False,
                            )
                            break

                        # Output up to punctuation
                        print(output_text, end="", flush=True)
                        accumulated_text = accumulated_text[end_idx:]
                        yield ResponseResponse(
                            response_id=response_id,
                            content=output_text,
                            content_complete=False,
                            end_call=False,
                        )

        except Exception as e:
            # Log the error if needed, or ignore if cleanup isn't critical
            print("Error during stream cleanup:", e)

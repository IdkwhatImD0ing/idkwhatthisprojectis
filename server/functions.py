search = {
    "name": "search",
    "description": "Uses the Perplexity API to generate a concise answer for a given query.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query string to be processed by the Perplexity API.",
            },
            "request_heartbeat": {
                "type": "boolean",
                "description": "Request an immediate heartbeat after function execution. Set to `True` if you want to send a follow-up message or run a follow-up function.",
            },
        },
        "required": ["query", "request_heartbeat"],
    },
}

create = {
    "name": "create_application",
    "description": "Create a new application in the table via Supabase's REST API and return the id.",
    "parameters": {
        "type": "object",
        "properties": {
            "request_heartbeat": {
                "type": "boolean",
                "description": "Request an immediate heartbeat after function execution. Set to `True` if you want to send a follow-up message or run a follow-up function.",
            }
        },
        "required": ["request_heartbeat"],
    },
}


update = {
    "name": "update_application",
    "description": "Update an existing application in the 'applications' table via Supabase's REST API; each field (except id) is optional.",
    "parameters": {
        "type": "object",
        "properties": {
            "id": {
                "type": "integer",
                "description": "Primary key of the application to update.",
            },
            "name": {"type": "string", "description": "Full legal name."},
            "dob": {
                "type": "string",
                "description": "Date of birth in 'YYYY-MM-DD' format.",
            },
            "ssn": {
                "type": "string",
                "description": "Social Security Number formatted as 'XXX-XX-XXXX'.",
            },
            "resstreet": {
                "type": "string",
                "description": "Residential street address.",
            },
            "rescity": {"type": "string", "description": "Residential city."},
            "resstate": {
                "type": "string",
                "description": "Residential state (2-letter US code or full name).",
            },
            "reszip": {
                "type": "string",
                "description": "Residential ZIP or postal code.",
            },
            "rescountry": {"type": "string", "description": "Residential country."},
            "mailstreet": {"type": "string", "description": "Mailing street address."},
            "mailcity": {"type": "string", "description": "Mailing city."},
            "mailstate": {"type": "string", "description": "Mailing state."},
            "mailzip": {"type": "string", "description": "Mailing ZIP or postal code."},
            "mailcountry": {"type": "string", "description": "Mailing country."},
            "phone": {
                "type": "string",
                "description": "Phone number (e.g., '+1-XXX-XXX-XXXX').",
            },
            "email": {"type": "string", "description": "Email address."},
            "employer": {"type": "string", "description": "Employer or business name."},
            "income": {"type": "number", "description": "Annual gross income."},
            "otherincome": {
                "type": "number",
                "description": "Other income (if applicable).",
            },
            "bankdetails": {
                "type": "string",
                "description": "Details of current bank(s) and account types.",
            },
            "creditscore": {
                "type": "integer",
                "description": "Credit score (300-850).",
            },
            "creditlimit": {"type": "number", "description": "Desired credit limit."},
            "duedate": {
                "type": "string",
                "description": "Payment due date preference in 'MM/DD' format.",
            },
            "finalname": {
                "type": "string",
                "description": "Applicant's full name for final signature.",
            },
            "finaldate": {
                "type": "string",
                "description": "Date for final signature in 'YYYY-MM-DD' format.",
            },
            "finalsignature": {
                "type": "string",
                "description": "Electronic signature.",
            },
            "request_heartbeat": {
                "type": "boolean",
                "description": "Request an immediate heartbeat after function execution. Set to `True` if you want to send a follow-up message or run a follow-up function.",
            },
        },
        "required": ["id", "request_heartbeat"],
    },
}

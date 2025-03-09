import {NextResponse} from 'next/server'
import {exec} from 'child_process'
import {writeFile, mkdir} from 'fs/promises'
import {join} from 'path'
import {promisify} from 'util'
import {randomUUID} from 'crypto'
import {promises as fs} from 'fs'

const execPromise = promisify(exec)

export async function POST(request) {
  try {
    const data = await request.json()

    // Replace placeholders in the LaTeX string with actual values
    const file = await fs.readFile(
      join(process.cwd(), 'src/app/api/pdf/template.tex'),
      'utf-8',
    )
    let filledLatex = file
    // Iterate through all properties in the data object
    Object.keys(data).forEach((key) => {
      // Create a regex pattern to find the placeholder with the actual key name
      const placeholder = new RegExp('\\\\\\$' + key, 'g')

      // Replace the placeholder with the actual value
      filledLatex = filledLatex.replace(placeholder, data[key] || '')
    })

    // Create a unique ID for this PDF generation
    const uuid = randomUUID()
    const tempDir = join(process.cwd(), 'tmp', uuid)

    // Create the temporary directory
    await mkdir(tempDir, {recursive: true})

    // Write the LaTeX content to a file
    const texFilePath = join(tempDir, 'application.tex')
    await writeFile(texFilePath, filledLatex)

    // Compile the LaTeX file to PDF
    await execPromise(
      `cd ${tempDir} && pdflatex -interaction=nonstopmode application.tex`,
    )

    // Read the generated PDF file
    const pdfFilePath = join(tempDir, 'application.pdf')
    const pdfBuffer = await import('fs/promises').then((fs) =>
      fs.readFile(pdfFilePath),
    )

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="application.pdf"',
      },
    })
  } catch (error) {
    console.error('Error processing PDF request:', error)
    return NextResponse.json(
      {error: 'Failed to process request'},
      {status: 500},
    )
  }
}

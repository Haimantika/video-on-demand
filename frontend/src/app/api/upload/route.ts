import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Map of MIME types to file extensions
const mimeToExt: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogg",
}

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  try {
    await mkdir(uploadDir, { recursive: true })
    console.log(`Upload directory created/verified: ${uploadDir}`)
    return uploadDir
  } catch (error) {
    console.error("Error creating upload directory:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log("Upload request received")

    // Read form data directly without cloning
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("Error reading form data:", error)
      return NextResponse.json(
        { error: "Failed to read form data: " + (error instanceof Error ? error.message : String(error)) },
        { status: 400 },
      )
    }

    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`File received: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/ogg"]
    if (!validTypes.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`)
      return NextResponse.json(
        { error: "Invalid file type. Only MP4, WebM, and OGG videos are supported." },
        { status: 400 },
      )
    }

    // Generate a unique filename with proper extension
    const timestamp = Date.now()
    const fileExt = mimeToExt[file.type] || "mp4" // Default to mp4 if unknown
    const safeFileName = file.name
      .replace(/\.[^/.]+$/, "") // Remove original extension
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, "") // Remove special characters

    const filename = `${timestamp}-${safeFileName}.${fileExt}`

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir()
    const filePath = path.join(uploadDir, filename)

    console.log(`Saving file to: ${filePath}`)

    // Convert file to buffer and save to filesystem
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Generate public URL for the file
    const fileUrl = `/uploads/${filename}`

    console.log(`File saved successfully. Public URL: ${fileUrl}`)

    return NextResponse.json({
      url: fileUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}


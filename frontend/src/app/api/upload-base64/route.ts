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
    console.log("Base64 upload request received")

    // Parse JSON payload
    const { filename, contentType, data } = await request.json()

    if (!filename || !contentType || !data) {
      return NextResponse.json({ error: "Missing required fields: filename, contentType, or data" }, { status: 400 })
    }

    console.log(`File info received: ${filename}, type: ${contentType}`)

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/ogg"]
    if (!validTypes.includes(contentType)) {
      console.error(`Invalid file type: ${contentType}`)
      return NextResponse.json(
        { error: "Invalid file type. Only MP4, WebM, and OGG videos are supported." },
        { status: 400 },
      )
    }

    // Extract base64 data - remove the data URL prefix
    const base64Data = data.split(";base64,").pop()
    if (!base64Data) {
      return NextResponse.json({ error: "Invalid base64 data format" }, { status: 400 })
    }

    // Generate a unique filename with proper extension
    const timestamp = Date.now()
    const fileExt = mimeToExt[contentType] || "mp4" // Default to mp4 if unknown
    const safeFileName = filename
      .replace(/\.[^/.]+$/, "") // Remove original extension
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, "") // Remove special characters

    const newFilename = `${timestamp}-${safeFileName}.${fileExt}`

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir()
    const filePath = path.join(uploadDir, newFilename)

    console.log(`Saving file to: ${filePath}`)

    // Convert base64 to buffer and save to filesystem
    const buffer = Buffer.from(base64Data, "base64")
    await writeFile(filePath, buffer)

    // Generate public URL for the file
    const fileUrl = `/uploads/${newFilename}`

    console.log(`File saved successfully. Public URL: ${fileUrl}`)

    return NextResponse.json({
      url: fileUrl,
      filename: newFilename,
      type: contentType,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}


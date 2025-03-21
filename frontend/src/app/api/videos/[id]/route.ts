import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import fs from "fs/promises"
import path from "path"
import * as React from "react"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as unknown as Promise<{ id: string }>)
  const id = unwrappedParams.id
  
  try {
    const video = await db.getVideoById(id)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch video" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as unknown as Promise<{ id: string }>)
  const id = unwrappedParams.id
  
  try {
    // Get video details first
    const video = await db.getVideoById(id)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Delete from database
    const deleted = await db.deleteVideo(id)

    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
    }

    // If it's a local file, delete it from filesystem
    if (video.videoUrl.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", video.videoUrl)

        // Check if file exists before attempting to delete
        await fs.access(filePath)
        await fs.unlink(filePath)
        console.log(`Deleted file: ${filePath}`)
      } catch (fileError) {
        // Log but don't fail if file deletion fails
        console.error("Error deleting file:", fileError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete video" },
      { status: 500 },
    )
  }
}

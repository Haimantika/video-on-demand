import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import path from "path"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle GET requests for video files
  if (
    request.method === "GET" &&
    pathname.startsWith("/uploads/") &&
    (pathname.endsWith(".mp4") || pathname.endsWith(".webm") || pathname.endsWith(".ogg"))
  ) {
    // Set the correct content type based on file extension
    const ext = path.extname(pathname).toLowerCase()
    let contentType = "video/mp4" // Default

    if (ext === ".webm") {
      contentType = "video/webm"
    } else if (ext === ".ogg") {
      contentType = "video/ogg"
    }

    // Create a new response with the correct content type
    const response = NextResponse.next()
    response.headers.set("Content-Type", contentType)

    return response
  }

  return NextResponse.next()
}

// Only apply middleware to /uploads path, not to API routes
export const config = {
  matcher: "/uploads/:path*",
}


"use client"

import { useEffect, useRef, useState } from "react"

interface VideoPlayerProps {
  videoUrl: string
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [isYouTube, setIsYouTube] = useState(false)
  const [isVimeo, setIsVimeo] = useState(false)
  const [embedUrl, setEmbedUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log("Video URL:", videoUrl)

    // Reset states
    setIsYouTube(false)
    setIsVimeo(false)
    setEmbedUrl("")
    setError(null)

    // Check if the URL is from YouTube
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      setIsYouTube(true)

      // Extract video ID and create embed URL
      let videoId = ""
      if (videoUrl.includes("youtube.com/watch?v=")) {
        videoId = new URL(videoUrl).searchParams.get("v") || ""
      } else if (videoUrl.includes("youtu.be/")) {
        videoId = videoUrl.split("youtu.be/")[1].split("?")[0]
      } else if (videoUrl.includes("youtube.com/embed/")) {
        videoId = videoUrl.split("youtube.com/embed/")[1].split("?")[0]
      } else if (videoUrl.includes("youtube.com/live/")) {
        videoId = videoUrl.split("youtube.com/live/")[1].split("?")[0]
      }

      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}`)
      }
    }
    // Check if the URL is from Vimeo
    else if (videoUrl.includes("vimeo.com")) {
      setIsVimeo(true)

      // Extract video ID and create embed URL
      let videoId = ""
      if (videoUrl.includes("vimeo.com/")) {
        videoId = videoUrl.split("vimeo.com/")[1].split("?")[0]
      }

      if (videoId) {
        setEmbedUrl(`https://player.vimeo.com/video/${videoId}`)
      }
    }
  }, [videoUrl])

  // Handle video error
  const handleVideoError = () => {
    setError("Unable to play this video. Please check the file format or URL.")
    console.error("Video error for URL:", videoUrl)
  }

  if ((isYouTube || isVimeo) && embedUrl) {
    return (
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    )
  }

  return (
    <div className="aspect-video w-full bg-black relative">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        preload="metadata"
        playsInline
        onError={handleVideoError}
      >
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
          <div>
            <p className="mb-2">{error}</p>
            <p className="text-sm">URL: {videoUrl}</p>
          </div>
        </div>
      )}
    </div>
  )
}


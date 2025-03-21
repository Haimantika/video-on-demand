"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import VideoPlayer from "@/components/video-player"
import { toast } from "sonner"
import * as React from "react" // Make sure to import React

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  dateAdded: string
}

export default function VideoPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as unknown as Promise<{ id: string }>)
  const videoId = unwrappedParams.id
  
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setIsLoading(true)

        // For the demo, we'll just load from localStorage
        const storedVideos = JSON.parse(localStorage.getItem("videos") || "[]")
        const foundVideo = storedVideos.find((v: Video) => v.id === videoId)

        if (!foundVideo) {
          toast("Video Not Found", {
            description: "The requested video could not be found.",
          })
          router.push("/library")
          return
        }

        setVideo(foundVideo)
      } catch (error) {
        console.error("Error fetching video:", error)
        toast.error("Error", {
          description: "Failed to load video. Please try again.",
        })
        router.push("/library")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideo()
  }, [videoId, router])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <p>Loading video...</p>
      </div>
    )
  }

  if (!video) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Library
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
        <p className="text-sm text-muted-foreground">Added on {new Date(video.dateAdded).toLocaleDateString()}</p>
      </div>

      <div className="mb-6 rounded-lg overflow-hidden">
        <VideoPlayer videoUrl={video.videoUrl} />
      </div>

      {video.description && (
        <div className="prose max-w-none dark:prose-invert">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p>{video.description}</p>
        </div>
      )}
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  dateAdded: string
}

export default function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)

  const fetchVideos = async () => {
    try {
      setIsLoading(true)

      // For the demo, we'll just load from localStorage
      const storedVideos = JSON.parse(localStorage.getItem("videos") || "[]")
      setVideos(storedVideos)
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast.error("Error", {
        description: "Failed to load videos. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDeleteVideo = async (id: string) => {
    try {
      // For the demo, we'll just remove from localStorage
      const storedVideos = JSON.parse(localStorage.getItem("videos") || "[]")
      const updatedVideos = storedVideos.filter((video: Video) => video.id !== id)
      localStorage.setItem("videos", JSON.stringify(updatedVideos))

      // Remove from local state
      setVideos(videos.filter((video) => video.id !== id))

      toast.error("Video Deleted", {
        description: "The video has been removed from your library..",
      })
    } catch (error) {
      console.error("Error deleting video:", error)

        toast.error("Error", {
            description: "There was a problem uploading your video.",
          })
    } finally {
      setVideoToDelete(null)
    }
  }

  // Filter videos based on search term
  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Video Library</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search videos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading videos...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden transition-all hover:shadow-md group">
              <Link href={`/video/${video.id}`}>
                <div className="aspect-video relative">
                  <Image
                    src={video.thumbnailUrl || "/placeholder.svg?height=200&width=350"}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="font-semibold line-clamp-1">{video.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
                </CardContent>
              </Link>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{new Date(video.dateAdded).toLocaleDateString()}</span>

                <AlertDialog
                  open={videoToDelete === video.id}
                  onOpenChange={(open) => {
                    if (!open) setVideoToDelete(null)
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault()
                        setVideoToDelete(video.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this video? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteVideo(video.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="mb-4 text-muted-foreground">
            {searchTerm ? "No videos match your search" : "Your library is empty"}
          </p>
          {!searchTerm && (
            <Link href="/add-video" className="text-primary hover:underline">
              Add your first video
            </Link>
          )}
        </div>
      )}
    </div>
  )
}


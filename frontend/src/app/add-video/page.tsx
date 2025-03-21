"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Upload, LinkIcon, Play } from "lucide-react"

// Map of MIME types to file extensions
const mimeToExt: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogg",
}

export default function AddVideoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("")
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [previewMode, setPreviewMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadedFileName(file.name)
    setPreviewMode(false)

    try {
      // Validate file type
      const validTypes = ["video/mp4", "video/webm", "video/ogg"]
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Only MP4, WebM, and OGG videos are supported.")
      }

      // Generate a unique filename with proper extension
      const timestamp = Date.now()
      const fileExt = mimeToExt[file.type] || "mp4" // Default to mp4 if unknown
      const safeFileName = file.name
        .replace(/\.[^/.]+$/, "") // Remove original extension
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-zA-Z0-9-_]/g, "") // Remove special characters

      const filename = `${timestamp}-${safeFileName}.${fileExt}`

      // Create a URL for the file
      const fileUrl = `/uploads/${filename}`

      // Create a Blob URL for the file (for preview)
      const blobUrl = URL.createObjectURL(file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 300)

      // Save the file locally (in this demo)
      // In a real app, you would upload to the server
      // For this demo, we'll just simulate a successful upload
      setTimeout(() => {
        clearInterval(progressInterval)
        setUploadProgress(100)
        setUploadedVideoUrl(blobUrl) // Use the blob URL for preview

        toast("Upload Complete", {
            description: "Your video has been uploaded successfully.",
          })

        setIsUploading(false)
      }, 2000)
    } catch (error) {
      console.error("Upload error:", error)
      toast("Upload Failed", {
        description: "There was a problem uploading your video.",
      })
      setIsUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const videoUrl = formData.get("videoUrl") as string
    const thumbnailUrl = (formData.get("thumbnailUrl") as string) || `/placeholder.svg?height=200&width=350`

    // Determine which video URL to use based on active tab
    let finalVideoUrl = ""

    if (activeTab === "upload") {
      // For the demo, we'll use the blob URL
      // In a real app, you would use the server URL
      finalVideoUrl = uploadedVideoUrl
    } else {
      finalVideoUrl = videoUrl
    }

    if (!finalVideoUrl) {
        toast.error("Error", {
            description: "There was a problem uploading your video.",
          })
      
      setIsSubmitting(false)
      return
    }

    // Create a new video object
    const newVideo = {
      id: Date.now().toString(),
      title,
      description,
      videoUrl: finalVideoUrl,
      thumbnailUrl,
      dateAdded: new Date().toISOString(),
    }

    try {
      // For the demo, we'll just simulate saving to the database
      // In a real app, you would send this to the server

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save to localStorage for demo purposes
      const existingVideos = JSON.parse(localStorage.getItem("videos") || "[]")
      const updatedVideos = [...existingVideos, newVideo]
      localStorage.setItem("videos", JSON.stringify(updatedVideos))

      toast("Video Added", {
        description: "Your video has been added to the library.",
      })

      // Redirect to the library page
      setTimeout(() => {
        router.push("/library")
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Error adding video:", error)
      toast.error("Error", {
        description: "There was a problem adding your video.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePreview = () => {
    if (uploadedVideoUrl) {
      setPreviewMode(!previewMode)
    } else {
      toast.error("No Video", {
        description: "Please upload a video first to preview it.",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Add New Video</CardTitle>
          <CardDescription>Upload a video file or enter a URL to add to your library.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Enter video title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Enter video description" rows={3} />
            </div>

            <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="url">Video URL</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoFile">Video File</Label>
                  <div className="grid gap-2">
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />

                    {previewMode && uploadedVideoUrl ? (
                      <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                        <video src={uploadedVideoUrl} controls className="w-full h-full" />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={togglePreview}
                        >
                          Close Preview
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-24 flex flex-col items-center justify-center gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-6 w-6" />
                        <span>{uploadedFileName || "Click to select video file"}</span>
                      </Button>
                    )}

                    {isUploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">
                          Uploading... {Math.round(uploadProgress)}%
                        </p>
                      </div>
                    )}

                    {uploadedVideoUrl && !previewMode && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-green-600 dark:text-green-400">Video uploaded successfully!</p>
                        <Button type="button" variant="outline" size="sm" onClick={togglePreview}>
                          <Play className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Supported formats: MP4, WebM, OGG</p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <Input id="videoUrl" name="videoUrl" placeholder="https://example.com/video.mp4" type="url" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a direct video file URL (.mp4, .webm) or YouTube/Vimeo embed URL
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://example.com/thumbnail.jpg" type="url" />
              <p className="text-xs text-muted-foreground">If left empty, a placeholder image will be used</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Video"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


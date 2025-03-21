import fs from "fs/promises"
import path from "path"

// Define the video type
export interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  dateAdded: string
}

// Path to our JSON database file
const DB_PATH = path.join(process.cwd(), "data", "videos.json")

// Ensure the data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.mkdir(dataDir, { recursive: true })
    console.log(`Data directory created/verified: ${dataDir}`)
    return dataDir
  } catch (error) {
    console.error("Error creating data directory:", error)
    throw error
  }
}

// Read the database file
const readDb = async (): Promise<Video[]> => {
  try {
    await ensureDataDir()

    try {
      const data = await fs.readFile(DB_PATH, "utf8")
      return JSON.parse(data)
    } catch (error) {
      // If file doesn't exist or is invalid, return empty array
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        console.log("Database file not found, creating new one")
        await fs.writeFile(DB_PATH, JSON.stringify([]))
        return []
      }

      console.error("Error reading database file:", error)
      return []
    }
  } catch (error) {
    console.error("Database read error:", error)
    throw new Error(`Failed to read database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Write to the database file
const writeDb = async (videos: Video[]): Promise<void> => {
  try {
    await ensureDataDir()
    await fs.writeFile(DB_PATH, JSON.stringify(videos, null, 2))
  } catch (error) {
    console.error("Database write error:", error)
    throw new Error(`Failed to write to database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Database operations
export const db = {
  getVideos: async (): Promise<Video[]> => {
    try {
      const videos = await readDb()
      // Sort by date added, newest first
      return videos.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    } catch (error) {
      console.error("Error getting videos:", error)
      throw new Error(`Failed to get videos: ${error instanceof Error ? error.message : String(error)}`)
    }
  },

  getVideoById: async (id: string): Promise<Video | undefined> => {
    try {
      const videos = await readDb()
      return videos.find((video) => video.id === id)
    } catch (error) {
      console.error(`Error getting video ${id}:`, error)
      throw new Error(`Failed to get video: ${error instanceof Error ? error.message : String(error)}`)
    }
  },

  addVideo: async (video: Video): Promise<Video> => {
    try {
      const videos = await readDb()
      videos.push(video)
      await writeDb(videos)
      return video
    } catch (error) {
      console.error("Error adding video:", error)
      throw new Error(`Failed to add video: ${error instanceof Error ? error.message : String(error)}`)
    }
  },

  deleteVideo: async (id: string): Promise<boolean> => {
    try {
      const videos = await readDb()
      const filteredVideos = videos.filter((video) => video.id !== id)

      if (filteredVideos.length === videos.length) {
        return false // No video was deleted
      }

      await writeDb(filteredVideos)
      return true
    } catch (error) {
      console.error(`Error deleting video ${id}:`, error)
      throw new Error(`Failed to delete video: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
}


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Video on Demand Library</h1>
        <p className="max-w-[700px] text-muted-foreground">
          Store and access your favorite videos in one place. Add new videos to your library and watch them anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/library">Browse Library</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/add-video">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Video
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}



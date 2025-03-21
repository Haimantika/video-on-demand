import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Film, PlusCircle } from "lucide-react"

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full border-b bg-background z-10">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Film className="h-5 w-5" />
          <span>VideoLibrary</span>
        </Link>
        <nav className="flex gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/library">Library</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/add-video">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Video
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

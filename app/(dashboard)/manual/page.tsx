import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarkdownViewer } from "@/components/markdown-viewer"

function getManualContent() {
  try {
    const filePath = path.join(process.cwd(), "docs", "navibook_manual_en.md")
    return fs.readFileSync(filePath, "utf8")
  } catch {
    return "# Manual Not Found\n\nMake sure docs/navibook_manual_en.md exists inside the project."
  }
}

export const metadata = {
  title: "NaviBook User Manual - Complete Guide & Quick Start (EN)",
}

export default function ManualEnPage() {
  const content = getManualContent()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 md:px-8 -mx-8 md:-mx-8 z-40">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">NaviBook User Manual</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Complete documentation • English Version
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/manual-es">📖 En Español</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-lg border p-6 md:p-8">
          <MarkdownViewer content={content} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>NaviBook Day-Charter • Version 1.0 • December 2025</p>
        </div>
      </div>
    </main>
  )
}

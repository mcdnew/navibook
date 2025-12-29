import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function getManualContent() {
  try {
    const filePath = path.join(process.cwd(), "docs", "navibook_manual_en.md")
    return fs.readFileSync(filePath, "utf8")
  } catch {
    return "Manual file not found. Make sure docs/navibook_manual_en.md exists inside the project."
  }
}

export const metadata = {
  title: "NaviBook User Manual - Complete Guide & Quick Start (EN)",
}

export default function TestManualEnPage() {
  const content = getManualContent()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">NaviBook User Manual - English</h1>
            <p className="text-muted-foreground text-sm">
              Complete user documentation with Quick Start guide (15 min) and comprehensive manual. Read-only view of <code>navibook_manual_en.md</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/test-manual-es">Ver manual en español</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 md:p-6 text-sm whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {content}
        </div>
      </div>
    </main>
  )
}

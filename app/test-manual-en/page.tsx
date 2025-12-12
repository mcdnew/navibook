import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function getManualContent() {
  try {
    const filePath = path.join(process.cwd(), "..", "test_version_manual_navibook.md")
    return fs.readFileSync(filePath, "utf8")
  } catch {
    return "Manual file not found. Make sure test_version_manual_navibook.md exists at the project root."
  }
}

export const metadata = {
  title: "NaviBook Testing Manual (EN)",
}

export default function TestManualEnPage() {
  const content = getManualContent()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Testing Manual (EN)</h1>
            <p className="text-muted-foreground text-sm">
              Read-only HTML view of <code>test_version_manual_navibook.md</code>. Update the markdown file to change this page.
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


import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function getManualContentEs() {
  try {
    const filePath = path.join(process.cwd(), "docs", "navibook_manual_es.md")
    return fs.readFileSync(filePath, "utf8")
  } catch {
    return "No se ha encontrado el archivo de manual en español. Asegúrate de que docs/navibook_manual_es.md existe dentro del proyecto."
  }
}

export const metadata = {
  title: "Manual del Usuario NaviBook - Guía Completa e Inicio Rápido (ES)",
}

export default function TestManualEsPage() {
  const content = getManualContentEs()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manual del Usuario NaviBook - Español</h1>
            <p className="text-muted-foreground text-sm">
              Documentación completa del usuario con guía de inicio rápido (15 min) y manual completo. Vista de solo lectura de <code>navibook_manual_es.md</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/test-manual-en">View manual in English</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Ir al Dashboard</Link>
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

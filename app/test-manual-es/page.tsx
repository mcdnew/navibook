import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function getManualContentEs() {
  try {
    const filePath = path.join(process.cwd(), "..", "test_version_manual_navibook_es.md")
    return fs.readFileSync(filePath, "utf8")
  } catch {
    return "No se ha encontrado el archivo de manual en español. Asegúrate de que test_version_manual_navibook_es.md existe en la raíz del proyecto."
  }
}

export const metadata = {
  title: "NaviBook Manual de Pruebas (ES)",
}

export default function TestManualEsPage() {
  const content = getManualContentEs()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manual de Pruebas (ES)</h1>
            <p className="text-muted-foreground text-sm">
              Vista HTML de solo lectura de <code>test_version_manual_navibook_es.md</code>. Actualiza el archivo markdown para cambiar esta página.
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


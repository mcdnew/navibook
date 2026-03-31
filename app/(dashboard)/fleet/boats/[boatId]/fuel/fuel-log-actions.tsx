'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FuelLogActions({ boatId }: { boatId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [form, setForm] = useState({
    liters: '',
    totalCost: '',
    engineHoursAtEntry: '',
    logDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const handleSubmit = async () => {
    if (!form.liters || !form.totalCost || !form.logDate) {
      setError('Liters, total cost, and date are required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/fleet/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boatId,
          liters: parseFloat(form.liters),
          totalCost: parseFloat(form.totalCost),
          engineHoursAtEntry: form.engineHoursAtEntry ? parseFloat(form.engineHoursAtEntry) : undefined,
          logDate: form.logDate,
          notes: form.notes || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to save fuel log')
      }
      setOpen(false)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" /> Log Fill
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Log Fuel Fill</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="liters">Liters *</Label>
                <Input id="liters" type="number" min="0" step="0.1" value={form.liters}
                  onChange={(e) => setForm((f) => ({ ...f, liters: e.target.value }))} placeholder="0.0" />
              </div>
              <div>
                <Label htmlFor="totalCost">Total Cost (€) *</Label>
                <Input id="totalCost" type="number" min="0" step="0.01" value={form.totalCost}
                  onChange={(e) => setForm((f) => ({ ...f, totalCost: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="logDate">Date *</Label>
                <Input id="logDate" type="date" value={form.logDate}
                  onChange={(e) => setForm((f) => ({ ...f, logDate: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="engineHours">Engine Hours</Label>
                <Input id="engineHours" type="number" min="0" step="0.1" value={form.engineHoursAtEntry}
                  onChange={(e) => setForm((f) => ({ ...f, engineHoursAtEntry: e.target.value }))} placeholder="optional" />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !form.liters || !form.totalCost}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

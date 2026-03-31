'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle } from 'lucide-react'

export default function FleetModuleToggle({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/fleet/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fleet_module_enabled: !enabled }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to update setting')
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
        {enabled ? (
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
        <div>
          <p className="font-medium text-sm">
            Fleet Operations Module is currently{' '}
            <span className={enabled ? 'text-green-600' : 'text-muted-foreground'}>
              {enabled ? 'enabled' : 'disabled'}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabled
              ? 'Your team can access maintenance, fuel logs, expenses and P&L reporting.'
              : 'Enable to unlock fleet operations features. Your existing data is not affected.'}
          </p>
        </div>
      </div>

      <Button
        onClick={toggle}
        disabled={loading}
        variant={enabled ? 'outline' : 'default'}
        className={enabled ? 'border-destructive text-destructive hover:bg-destructive/10' : ''}
      >
        {loading ? 'Saving…' : enabled ? 'Disable Fleet Module' : 'Enable Fleet Module'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

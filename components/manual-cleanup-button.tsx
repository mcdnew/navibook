'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ManualCleanupButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCleanup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cron/cleanup-holds', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Cleanup Complete', {
          description: data.message || `Cleaned up ${data.count} expired hold(s)`,
        })
      } else {
        toast.error('Cleanup Failed', {
          description: data.error || 'Failed to clean up expired holds',
        })
      }
    } catch (error) {
      toast.error('Cleanup Error', {
        description: 'An error occurred while cleaning up expired holds',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCleanup}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      {isLoading ? 'Cleaning...' : 'Clean Up Expired Holds'}
    </Button>
  )
}

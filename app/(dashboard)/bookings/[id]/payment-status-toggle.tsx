'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, X, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentStatusToggleProps {
  bookingId: string
  depositPaid: boolean
  depositAmount: number
  onStatusChange?: (newStatus: boolean) => void
}

export default function PaymentStatusToggle({
  bookingId,
  depositPaid,
  depositAmount,
  onStatusChange,
}: PaymentStatusToggleProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: boolean) => {
    if (newStatus === depositPaid) return

    setLoading(true)
    try {
      const response = await fetch('/api/bookings/payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          depositPaid: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment status')
      }

      toast.success('Payment Status Updated', {
        description: `Deposit marked as ${newStatus ? 'paid' : 'unpaid'}`,
      })

      // Notify parent component immediately for instant UI update
      if (onStatusChange) {
        onStatusChange(newStatus)
      }

      router.refresh()
    } catch (error: any) {
      toast.error('Update Failed', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${
            depositPaid
              ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700'
              : 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700'
          }`}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : depositPaid ? (
            <Check className="w-3 h-3" />
          ) : (
            <X className="w-3 h-3" />
          )}
          {depositPaid ? 'Paid' : 'Unpaid'}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleStatusChange(true)}
          className="cursor-pointer"
          disabled={depositPaid}
        >
          <Check className="w-4 h-4 mr-2 text-green-600" />
          Mark as Paid
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(false)}
          className="cursor-pointer"
          disabled={!depositPaid}
        >
          <X className="w-4 h-4 mr-2 text-orange-600" />
          Mark as Unpaid
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

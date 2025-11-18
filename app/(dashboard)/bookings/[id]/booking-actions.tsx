'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, UserCheck, UserX, Loader2, Edit, Link2 } from 'lucide-react'
import EditBookingDialog from './edit-booking-dialog'

interface BookingActionsProps {
  booking: any
  userRole: string
}

export default function BookingActions({ booking, userRole }: BookingActionsProps) {
  const router = useRouter()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [depositPaid, setDepositPaid] = useState(booking.deposit_paid)
  const [cancellationReason, setCancellationReason] = useState('')

  // Determine which actions are available
  const canConfirm = booking.status === 'pending_hold'
  const canComplete = booking.status === 'confirmed' && new Date(booking.booking_date) < new Date()
  const canMarkNoShow = booking.status === 'confirmed' && new Date(booking.booking_date) < new Date()
  const canCancel = booking.status === 'pending_hold' || booking.status === 'confirmed'
  const canEdit = booking.status !== 'completed' && booking.status !== 'cancelled'

  // Handle Confirm Booking
  const handleConfirm = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          depositPaid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking')
      }

      toast.success('Booking Confirmed!', {
        description: 'The booking has been successfully confirmed.',
      })

      setConfirmDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error('Confirmation Failed', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle Mark as Completed
  const handleComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookings/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as completed')
      }

      toast.success('Booking Completed!', {
        description: 'The booking has been marked as completed.',
      })

      router.refresh()
    } catch (error: any) {
      toast.error('Action Failed', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle Mark as No-Show
  const handleNoShow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookings/no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as no-show')
      }

      toast.success('Marked as No-Show', {
        description: 'The booking has been marked as no-show.',
      })

      router.refresh()
    } catch (error: any) {
      toast.error('Action Failed', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle Cancel Booking
  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Cancellation Reason Required', {
        description: 'Please provide a reason for cancellation.',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          reason: cancellationReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }

      toast.success('Booking Cancelled', {
        description: 'The booking has been cancelled and boat availability has been released.',
      })

      setCancelDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error('Cancellation Failed', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle Generate Portal Link
  const handleGeneratePortalLink = async () => {
    if (!booking.customer_email) {
      toast.error('No Customer Email', {
        description: 'This booking does not have a customer email address.',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/portal/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate portal link')
      }

      // Copy link to clipboard
      await navigator.clipboard.writeText(data.portalUrl)

      toast.success('Portal Link Generated!', {
        description: 'The customer portal link has been copied to your clipboard.',
      })

      // Optionally open the link in a new tab for preview
      window.open(data.portalUrl, '_blank')
    } catch (error: any) {
      toast.error('Link Generation Failed', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Portal link is always available if booking has customer email
  const canGeneratePortalLink = !!booking.customer_email

  // Don't show action bar if no actions available
  if (!canConfirm && !canComplete && !canMarkNoShow && !canCancel && !canEdit && !canGeneratePortalLink) {
    return null
  }

  return (
    <>
      <div className="bg-card border rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {canConfirm && (
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Booking
            </Button>
          )}

          {canComplete && (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4 mr-2" />
              )}
              Mark as Completed
            </Button>
          )}

          {canMarkNoShow && (
            <Button
              onClick={handleNoShow}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserX className="w-4 h-4 mr-2" />
              )}
              Mark as No-Show
            </Button>
          )}

          {canEdit && (
            <Button
              onClick={() => setEditDialogOpen(true)}
              variant="outline"
              className="border-blue-500 text-blue-600 dark:text-blue-400"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Booking
            </Button>
          )}

          {canGeneratePortalLink && (
            <Button
              onClick={handleGeneratePortalLink}
              disabled={loading}
              variant="outline"
              className="border-purple-500 text-purple-600 dark:text-purple-400"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              Customer Portal Link
            </Button>
          )}

          {canCancel && (
            <Button
              onClick={() => setCancelDialogOpen(true)}
              variant="outline"
              className="border-red-400 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          )}
        </div>
      </div>

      {/* Confirm Booking Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this booking? This will release the hold and finalize the reservation.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deposit"
                checked={depositPaid}
                onCheckedChange={(checked) => setDepositPaid(checked as boolean)}
              />
              <Label htmlFor="deposit" className="cursor-pointer">
                Mark deposit as paid ({booking.deposit_amount > 0 ? `€${booking.deposit_amount.toFixed(2)}` : 'No deposit required'})
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              This action will cancel the booking and release the boat availability. Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block">
              Cancellation Reason *
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={loading}
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading || !cancellationReason.trim()}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        booking={booking}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  )
}

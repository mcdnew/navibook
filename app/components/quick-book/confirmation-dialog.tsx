'use client'

import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

type ConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string | null
  holdUntil: Date | null
  timeRemaining: number
  formatTimeRemaining: (ms: number) => string
  confirmImmediately: boolean
  onCreateAnother: () => void
  onViewDashboard: () => void
  // Additional booking details needed for display
  date: Date
  startTime: string
  duration: string
  selectedBoatName: string | undefined
  customerName: string
  totalPrice: number
  commission: number
  calculateEndTime: (start: string, dur: string) => string
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  bookingId,
  timeRemaining,
  formatTimeRemaining,
  confirmImmediately,
  onCreateAnother,
  onViewDashboard,
  date,
  startTime,
  duration,
  selectedBoatName,
  customerName,
  totalPrice,
  commission,
  calculateEndTime,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-6 h-6" />
            Booking Created Successfully!
          </DialogTitle>
          <DialogDescription>
            {confirmImmediately
              ? 'Your booking has been confirmed and is now active.'
              : 'Your booking has been created with a 15-minute hold.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Hold Timer (only show if not confirmed immediately) */}
          {!confirmImmediately && timeRemaining > 0 ? (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold text-orange-900 dark:text-orange-100">Time Remaining:</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                  This booking will be automatically released if not confirmed within 15 minutes.
                </p>
              </CardContent>
            </Card>
          ) : !confirmImmediately ? (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-900 dark:text-red-100">Hold Expired</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  The 15-minute hold has expired. Please create a new booking.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Confirmed Status */}
          {confirmImmediately && (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-900 dark:text-green-100 text-lg">Booking Confirmed</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  This booking has been confirmed and is now active.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-mono font-semibold">{bookingId?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold">{format(date, 'PPP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-semibold">
                  {startTime} - {calculateEndTime(startTime, duration)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Boat:</span>
                <span className="font-semibold">
                  {selectedBoatName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-semibold">{customerName}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-lg">€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Your Commission:</span>
                <span className="font-semibold">€{commission.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={onViewDashboard}
              className="w-full"
            >
              View in Dashboard
            </Button>
            <Button
              onClick={onCreateAnother}
              variant="outline"
              className="w-full"
            >
              Create Another Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

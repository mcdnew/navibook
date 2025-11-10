'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EditBookingDialogProps {
  booking: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditBookingDialog({
  booking,
  open,
  onOpenChange,
}: EditBookingDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  // Form state
  const [customerName, setCustomerName] = useState(booking.customer_name)
  const [customerPhone, setCustomerPhone] = useState(booking.customer_phone)
  const [customerEmail, setCustomerEmail] = useState(booking.customer_email || '')
  const [passengers, setPassengers] = useState(booking.passengers.toString())
  const [packageType, setPackageType] = useState(booking.package_type)
  const [depositAmount, setDepositAmount] = useState(booking.deposit_amount.toString())
  const [notes, setNotes] = useState(booking.notes || '')
  const [totalPrice, setTotalPrice] = useState(booking.total_price)
  const [loadingPrice, setLoadingPrice] = useState(false)

  // Fetch pricing when package type changes
  useEffect(() => {
    async function fetchPricing() {
      if (!booking.boat_id || !booking.duration) return

      setLoadingPrice(true)
      try {
        const { data: pricingData } = await supabase
          .from('pricing')
          .select('price')
          .eq('boat_id', booking.boat_id)
          .eq('duration', booking.duration)
          .eq('package_type', packageType)
          .single()

        if (pricingData) {
          setTotalPrice(pricingData.price)
        }
      } catch (error) {
        console.error('Error fetching pricing:', error)
      } finally {
        setLoadingPrice(false)
      }
    }

    fetchPricing()
  }, [packageType, booking.boat_id, booking.duration, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!customerName.trim()) {
      toast.error('Customer name is required')
      return
    }

    if (!customerPhone.trim()) {
      toast.error('Customer phone is required')
      return
    }

    const passengersNum = parseInt(passengers)
    if (isNaN(passengersNum) || passengersNum < 1) {
      toast.error('Valid passenger count is required')
      return
    }

    // Check if passengers exceed boat capacity
    if (passengersNum > booking.boats?.capacity) {
      toast.error(`This boat can only accommodate ${booking.boats?.capacity} passengers`)
      return
    }

    const depositNum = parseFloat(depositAmount)
    if (isNaN(depositNum) || depositNum < 0) {
      toast.error('Valid deposit amount is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/bookings/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || null,
          passengers: passengersNum,
          packageType,
          totalPrice,
          depositAmount: depositNum,
          notes: notes.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking')
      }

      toast.success('Booking Updated!', {
        description: 'The booking has been successfully updated.',
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error('Update Failed', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    return (
      customerName !== booking.customer_name ||
      customerPhone !== booking.customer_phone ||
      customerEmail !== (booking.customer_email || '') ||
      passengers !== booking.passengers.toString() ||
      packageType !== booking.package_type ||
      totalPrice !== booking.total_price ||
      depositAmount !== booking.deposit_amount.toString() ||
      notes !== (booking.notes || '')
    )
  }

  // Determine if booking can be edited
  const canEdit = booking.status !== 'completed' && booking.status !== 'cancelled'

  if (!canEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Edit Booking</DialogTitle>
            <DialogDescription>
              This booking cannot be edited because it is {booking.status}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Update booking details. Changes will be logged in the booking history.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning for date/time changes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Note about date/time changes:</p>
              <p className="mt-1">
                To change the booking date, time, or boat, please cancel this booking and create a new one to ensure availability.
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Customer Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+30 69..."
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="passengers">Number of Passengers *</Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  max={booking.boats?.capacity || 100}
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max capacity: {booking.boats?.capacity} passengers
                </p>
              </div>
            </div>
          </div>

          {/* Package & Pricing */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Package & Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packageType">Package Type</Label>
                <Select value={packageType} onValueChange={setPackageType} disabled={loading}>
                  <SelectTrigger id="packageType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="charter_only">Charter Only</SelectItem>
                    <SelectItem value="charter_drinks">Charter + Drinks</SelectItem>
                    <SelectItem value="charter_food">Charter + Food</SelectItem>
                    <SelectItem value="charter_full">Full Package</SelectItem>
                  </SelectContent>
                </Select>
                {loadingPrice ? (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating price...
                  </p>
                ) : totalPrice !== booking.total_price ? (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Price updated to €{totalPrice.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Price will update automatically
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="depositAmount">Deposit Amount (€)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              totalPrice !== booking.total_price
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50'
            }`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Original Price:</span>
                <span className={totalPrice !== booking.total_price ? 'line-through text-muted-foreground' : 'font-semibold'}>
                  €{booking.total_price.toFixed(2)}
                </span>
              </div>
              {totalPrice !== booking.total_price && (
                <div className="flex justify-between text-sm font-semibold text-blue-600">
                  <span>New Price:</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <Label htmlFor="notes">Special Requests / Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              className="min-h-[80px]"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasChanges()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

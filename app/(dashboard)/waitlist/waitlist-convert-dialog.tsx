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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface WaitlistConvertDialogProps {
  entry: any
  boats: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DURATIONS = ['2h', '3h', '4h', '8h'] as const
const PACKAGES = [
  { value: 'charter_only', label: 'Charter Only' },
  { value: 'charter_drinks', label: 'Charter + Drinks' },
  { value: 'charter_food', label: 'Charter + Food' },
  { value: 'charter_full', label: 'Full Package' },
] as const

type AvailableBoat = {
  boat_id: string
  boat_name: string
  boat_type: string
  capacity: number
  image_url?: string
}

type Pricing = {
  id: string
  boat_id: string
  duration: string
  package_type: string
  price: number
}

export default function WaitlistConvertDialog({
  entry,
  boats,
  open,
  onOpenChange,
}: WaitlistConvertDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form data pre-filled from waitlist entry
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [duration, setDuration] = useState<string>('4h')
  const [passengers, setPassengers] = useState('')
  const [packageType, setPackageType] = useState<string>('charter_only')
  const [selectedBoat, setSelectedBoat] = useState('')
  const [depositAmount, setDepositAmount] = useState('0')
  const [notes, setNotes] = useState('')

  // Availability
  const [availableBoats, setAvailableBoats] = useState<AvailableBoat[]>([])
  const [loadingBoats, setLoadingBoats] = useState(false)
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [totalPrice, setTotalPrice] = useState<number>(0)

  // Load user data
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, first_name, last_name, commission_percentage, company_id')
          .eq('id', authUser.id)
          .single()

        if (userData) {
          setUser(userData)
        }
      }
    }

    loadUser()
  }, [supabase])

  // Pre-fill form when dialog opens
  useEffect(() => {
    if (entry && open) {
      setBookingDate(entry.preferred_date || '')
      setPassengers(entry.passengers?.toString() || '2')
      setNotes(entry.notes || '')
      setSelectedBoat(entry.boat_id || '')
    }
  }, [entry, open])

  // Calculate end time
  const calculateEndTime = (start: string, dur: string): string => {
    const [hours, minutes] = start.split(':').map(Number)
    const durationHours = parseInt(dur.replace('h', ''))
    const endHours = (hours + durationHours) % 24
    return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  // Check availability when date, time, or duration changes
  useEffect(() => {
    async function checkAvailability() {
      if (!user || !bookingDate || !startTime) return

      setLoadingBoats(true)

      try {
        const endTime = calculateEndTime(startTime, duration)

        const { data, error: availError } = await supabase.rpc('get_available_boats', {
          p_company_id: user.company_id,
          p_booking_date: bookingDate,
          p_start_time: startTime,
          p_end_time: endTime,
          p_min_capacity: 1,
        })

        if (availError) {
          console.error('Availability check error:', availError)
          setAvailableBoats([])
        } else {
          setAvailableBoats(data || [])

          // Reset boat selection if previously selected boat is no longer available
          if (selectedBoat && !data?.some((b: AvailableBoat) => b.boat_id === selectedBoat)) {
            setSelectedBoat('')
          }

          // Load pricing for available boats
          const boatIds = (data || []).map((b: AvailableBoat) => b.boat_id)

          if (boatIds.length > 0) {
            const { data: pricingData } = await supabase
              .from('pricing')
              .select('*')
              .in('boat_id', boatIds)
              .eq('duration', duration)

            setPricing(pricingData || [])
          }
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoadingBoats(false)
      }
    }

    checkAvailability()
  }, [bookingDate, startTime, duration, user, supabase, selectedBoat])

  // Calculate price when boat or package changes
  useEffect(() => {
    if (!selectedBoat) {
      setTotalPrice(0)
      return
    }

    const boatPricing = pricing.find(
      (p) => p.boat_id === selectedBoat && p.package_type === packageType
    )

    if (boatPricing) {
      setTotalPrice(boatPricing.price)
    }
  }, [selectedBoat, packageType, pricing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBoat || !bookingDate || !user) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const endTime = calculateEndTime(startTime, duration)

      // Create booking directly as confirmed
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          company_id: user.company_id,
          boat_id: selectedBoat,
          agent_id: user.id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration: duration,
          customer_name: entry.customer_name,
          customer_phone: entry.customer_phone,
          customer_email: entry.customer_email || null,
          passengers: parseInt(passengers),
          package_type: packageType,
          total_price: totalPrice,
          deposit_amount: parseFloat(depositAmount) || 0,
          notes: notes || null,
          status: 'confirmed',
          deposit_paid: parseFloat(depositAmount) > 0,
        })
        .select('id')
        .single()

      if (bookingError) throw bookingError

      // Update waitlist entry to converted status and link booking
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({
          status: 'converted',
          booking_id: bookingData.id,
        })
        .eq('id', entry.id)

      if (updateError) {
        console.error('Failed to update waitlist status:', updateError)
        // Don't fail the whole operation, just warn
        toast.warning('Booking created but waitlist status not updated', {
          description: 'Please manually update the waitlist entry',
        })
      }

      toast.success('Converted to Booking!', {
        description: `${entry.customer_name}'s waitlist entry has been converted to a confirmed booking`,
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      console.error('Convert error:', error)
      toast.error('Error', {
        description: error.message || 'Failed to convert to booking',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert to Booking</DialogTitle>
          <DialogDescription>
            Create a confirmed booking from waitlist entry for {entry?.customer_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info (read-only) */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold">{entry?.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold">{entry?.customer_phone}</span>
              </div>
              {entry?.customer_email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold">{entry?.customer_email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bookingDate">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bookingDate"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>

            <div>
              <Label htmlFor="startTime">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((dur) => (
                    <SelectItem key={dur} value={dur}>
                      {dur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="passengers">Passengers</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Available Boats */}
          <div>
            <Label>
              Select Boat <span className="text-red-500">*</span>
            </Label>
            {loadingBoats ? (
              <p className="text-sm text-muted-foreground py-4">Checking availability...</p>
            ) : availableBoats.length === 0 ? (
              <Card className="border-orange-200 bg-orange-50 mt-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">No boats available</p>
                      <p className="text-sm text-orange-700">
                        Try a different date or time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 mt-2">
                {availableBoats.map((boat) => {
                  const boatPrice = pricing.find(
                    (p) => p.boat_id === boat.boat_id && p.package_type === packageType
                  )
                  const passengersNum = parseInt(passengers) || 0
                  const meetsCapacity = boat.capacity >= passengersNum

                  return (
                    <div
                      key={boat.boat_id}
                      onClick={() => setSelectedBoat(boat.boat_id)}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBoat === boat.boat_id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : !meetsCapacity
                          ? 'border-orange-200 bg-orange-50 hover:border-orange-300'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="boat"
                          value={boat.boat_id}
                          checked={selectedBoat === boat.boat_id}
                          onChange={() => setSelectedBoat(boat.boat_id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-semibold">{boat.boat_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {boat.boat_type} • {boat.capacity} pax
                            {!meetsCapacity && (
                              <span className="text-orange-600 ml-1">
                                (Too small for {passengersNum} passengers)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{boatPrice?.price || 0}</p>
                        <p className="text-xs text-muted-foreground">{duration}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Package */}
          {selectedBoat && (
            <div>
              <Label htmlFor="package">Package</Label>
              <Select value={packageType} onValueChange={setPackageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGES.map((pkg) => (
                    <SelectItem key={pkg.value} value={pkg.value}>
                      {pkg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Deposit */}
          {selectedBoat && (
            <div>
              <Label htmlFor="deposit">Deposit Amount (€)</Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Converted from waitlist, customer contacted on..."
              rows={3}
            />
          </div>

          {/* Price Summary */}
          {selectedBoat && totalPrice > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-2xl font-bold text-blue-600">€{totalPrice.toFixed(2)}</p>
                  </div>
                  {parseFloat(depositAmount) > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Deposit</p>
                      <p className="text-lg font-semibold">€{depositAmount}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
              disabled={loading || !selectedBoat || availableBoats.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Converting...' : 'Convert to Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

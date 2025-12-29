'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import BookingWeatherCard from '@/app/components/weather/booking-weather-card'
import SailorSelect from '@/app/components/booking/sailor-select'
import { calculateAllBookingCosts } from '@/lib/booking/cost-calculator'

type Boat = {
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

type User = {
  id: string
  first_name: string
  last_name: string
  commission_percentage: number
  company_id: string
  role: string
}

type SelectedSailor = {
  sailorId: string
  hourlyRate: number
  fee: number
}

const DURATIONS = ['2h', '3h', '4h', '8h'] as const
const PACKAGES = [
  { value: 'charter_only', label: 'Charter Only' },
  { value: 'charter_drinks', label: 'Charter + Drinks' },
  { value: 'charter_food', label: 'Charter + Food' },
  { value: 'charter_full', label: 'Full Package' },
] as const

export default function QuickBookPage() {
  const router = useRouter()
  const supabase = createClient()

  // User state
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [date, setDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState<string>('4h')
  const [startTime, setStartTime] = useState<string>('10:00')
  const [passengers, setPassengers] = useState<string>('2')
  const [packageType, setPackageType] = useState<string>('charter_only')

  // Customer details
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [depositAmount, setDepositAmount] = useState<string>('0')

  // Available boats
  const [availableBoats, setAvailableBoats] = useState<Boat[]>([])
  const [selectedBoat, setSelectedBoat] = useState<string>('')
  const [pricing, setPricing] = useState<Pricing[]>([])
  const [loadingBoats, setLoadingBoats] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Captains
  const [captains, setCaptains] = useState<any[]>([])
  const [selectedCaptain, setSelectedCaptain] = useState<string>('none')
  const [captainFee, setCaptainFee] = useState<number>(0)

  // Sailors
  const [selectedSailors, setSelectedSailors] = useState<SelectedSailor[]>([])

  // Check if user can assign crew (admin/manager/office_staff only)
  const canAssignCrew = user?.role && ['admin', 'manager', 'office_staff'].includes(user.role)

  // Calculated values
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [commission, setCommission] = useState<number>(0)

  // NEW: Booking category and internal booking options (admin/manager only)
  const [bookingCategory, setBookingCategory] = useState<string>('commercial')
  const [discountPercentage, setDiscountPercentage] = useState<string>('0')
  const [isBareBoat, setIsBareBoat] = useState<boolean>(false)
  const [fuelCost, setFuelCost] = useState<number>(0)
  const [packageAddonCost, setPackageAddonCost] = useState<number>(0)

  // NEW: Cancellation policies and instructor tracking
  const [cancellationPolicies, setCancellationPolicies] = useState<any[]>([])
  const [selectedCancellationPolicy, setSelectedCancellationPolicy] = useState<string>('')
  const [instructors, setInstructors] = useState<any[]>([])
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')

  // Check if user can create internal bookings (admin/manager/office_staff only)
  const canCreateInternalBookings = user?.role && ['admin', 'manager', 'office_staff'].includes(user.role)

  // UI state
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [holdUntil, setHoldUntil] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Booking confirmation option
  const [confirmImmediately, setConfirmImmediately] = useState(false)

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    boat?: string
    customerName?: string
    customerPhone?: string
  }>({})

  // Weather data
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loadingWeather, setLoadingWeather] = useState(false)

  // Handle bare boat selection - disable captain/sailors
  useEffect(() => {
    if (isBareBoat || bookingCategory === 'bare_boat') {
      setSelectedCaptain('none')
      setSelectedSailors([])
      setCaptainFee(0)
    }
  }, [isBareBoat, bookingCategory])

  // Auto-clear discount when booking category changes back to commercial
  useEffect(() => {
    if (bookingCategory === 'commercial') {
      setDiscountPercentage('0')
    }
  }, [bookingCategory])

  // Load cancellation policies and instructors when user is loaded
  useEffect(() => {
    if (!user) return

    async function loadPoliciesAndInstructors() {
      const currentUser = user!
      // Load cancellation policies
      const { data: policies } = await supabase
        .from('cancellation_policies')
        .select('id, policy_name, refund_before_7_days, refund_before_3_days, refund_before_1_day')
        .eq('company_id', currentUser.company_id)
        .eq('is_active', true)

      if (policies && policies.length > 0) {
        setCancellationPolicies(policies)
        // Set first policy as default
        setSelectedCancellationPolicy(policies[0].id)
      }

      // Load instructors (captains with instructor role)
      const { data: instructorList } = await supabase
        .from('users')
        .select('id, first_name, last_name, hourly_rate')
        .eq('company_id', currentUser.company_id)
        .in('role', ['captain', 'instructor'])
        .eq('is_active', true)

      if (instructorList) {
        setInstructors(instructorList)
      }
    }

    loadPoliciesAndInstructors()
  }, [user])

  // Load user data
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, first_name, last_name, commission_percentage, company_id, role')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData)
      }
      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  // Load captains
  useEffect(() => {
    async function loadCaptains() {
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, hourly_rate')
        .eq('company_id', user.company_id)
        .eq('role', 'captain')
        .order('first_name')

      if (!error && data) {
        setCaptains(data)
      }
    }

    loadCaptains()
  }, [user, supabase])

  // Calculate end time based on duration
  const calculateEndTime = (start: string, dur: string): string => {
    const [hours, minutes] = start.split(':').map(Number)
    const durationHours = parseInt(dur.replace('h', ''))
    const endHours = (hours + durationHours) % 24
    return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  // Check availability when date, time, or duration changes
  useEffect(() => {
    async function checkAvailability() {
      if (!user) return

      setLoadingBoats(true)
      setError(null)

      try {
        const endTime = calculateEndTime(startTime, duration)

        // Call the database function to get available boats
        // Note: We pass p_min_capacity as 1 to show ALL boats, not just those matching passenger count
        const { data, error: availError } = await supabase
          .rpc('get_available_boats', {
            p_company_id: user.company_id,
            p_booking_date: format(date, 'yyyy-MM-dd'),
            p_start_time: startTime,
            p_end_time: endTime,
            p_min_capacity: 1 // Always 1 to show all available boats
          })

        if (availError) {
          console.error('Availability check error:', availError)
          setError('Failed to check availability')
          setAvailableBoats([])
        } else {
          console.log('Available boats loaded:', data)
          setAvailableBoats(data || [])

          // Reset boat selection if previously selected boat is no longer available
          if (selectedBoat && !data?.some((b: Boat) => b.boat_id === selectedBoat)) {
            console.log('Previously selected boat no longer available, clearing selection')
            setSelectedBoat('')
          }

          // Load pricing for available boats
          const boatIds = (data || []).map((b: Boat) => b.boat_id)
          console.log('Loading pricing for boat IDs:', boatIds)

          if (boatIds.length > 0) {
            const { data: pricingData } = await supabase
              .from('pricing')
              .select('*')
              .in('boat_id', boatIds)
              .eq('duration', duration)

            console.log('Pricing data loaded:', pricingData)
            setPricing(pricingData || [])
          }
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load boats')
      } finally {
        setLoadingBoats(false)
      }
    }

    checkAvailability()
  }, [date, startTime, duration, user, supabase, refreshTrigger])

  // Fetch weather data when date or start time changes
  useEffect(() => {
    async function fetchWeather() {
      if (!user) return

      setLoadingWeather(true)
      try {
        const dateStr = format(date, 'yyyy-MM-dd')
        const response = await fetch(`/api/weather/forecast?days=7`)

        if (!response.ok) {
          setWeatherData(null)
          return
        }

        const data = await response.json()
        const forecasts = data.forecasts || []

        // Find forecasts for the selected date
        const relevantForecasts = forecasts.filter((f: any) => f.date === dateStr)

        if (relevantForecasts.length === 0) {
          setWeatherData(null)
          return
        }

        // Get forecast closest to the selected start time
        const [startHour] = startTime.split(':').map(Number)
        const closestForecast = relevantForecasts.reduce((prev: any, curr: any) => {
          const prevHour = parseInt(curr.time.split(':')[0])
          const currHour = parseInt(curr.time.split(':')[0])

          const prevDiff = Math.abs(prevHour - startHour)
          const currDiff = Math.abs(currHour - startHour)

          return currDiff < prevDiff ? curr : prev
        })

        setWeatherData(closestForecast)
      } catch (error) {
        console.error('Error fetching weather:', error)
        setWeatherData(null)
      } finally {
        setLoadingWeather(false)
      }
    }

    fetchWeather()
  }, [date, startTime, user])

  // Calculate price and commission when boat or package changes
  useEffect(() => {
    if (!selectedBoat || !user) {
      setTotalPrice(0)
      setCommission(0)
      return
    }

    const boatPricing = pricing.find(
      p => p.boat_id === selectedBoat && p.package_type === packageType
    )

    if (boatPricing) {
      const price = boatPricing.price
      setTotalPrice(price)

      // Calculate commission
      const comm = (price * user.commission_percentage) / 100
      setCommission(comm)
    }
  }, [selectedBoat, packageType, pricing, user])

  // Calculate captain fee when captain or duration changes
  useEffect(() => {
    if (!selectedCaptain || selectedCaptain === 'none') {
      setCaptainFee(0)
      return
    }

    const captain = captains.find(c => c.id === selectedCaptain)
    if (captain && captain.hourly_rate) {
      const durationHours = parseInt(duration.replace('h', ''))
      const fee = captain.hourly_rate * durationHours
      setCaptainFee(fee)
    } else {
      setCaptainFee(0)
    }
  }, [selectedCaptain, duration, captains])

  // Countdown timer for hold period
  useEffect(() => {
    if (!holdUntil) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(holdUntil).getTime()
      const remaining = Math.max(0, end - now)

      setTimeRemaining(remaining)

      if (remaining === 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [holdUntil])

  // Real-time subscription for bookings changes
  useEffect(() => {
    if (!user) return

    // Subscribe to bookings table changes
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `company_id=eq.${user.company_id}`
        },
        (payload) => {
          console.log('Booking change detected:', payload)

          // Show toast notification for new bookings from other agents
          if (payload.eventType === 'INSERT' && payload.new.agent_id !== user.id) {
            const newBooking = payload.new as any
            toast.info('New Booking Created', {
              description: `${newBooking.customer_name} - ${newBooking.booking_date}`,
            })

            // Trigger availability refresh
            setRefreshTrigger(prev => prev + 1)
          }

          // Show notification when a booking is cancelled or updated
          if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as any
            if (updatedBooking.status === 'cancelled') {
              toast.info('Booking Cancelled', {
                description: 'A boat may now be available.',
              })
              // Trigger availability refresh
              setRefreshTrigger(prev => prev + 1)
            } else if (updatedBooking.status === 'confirmed') {
              toast.success('Booking Confirmed', {
                description: `${updatedBooking.customer_name}'s booking confirmed`,
              })
            }
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // Format time remaining as MM:SS
  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // Handle booking creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setFieldErrors({})
    setError(null)
    setSuccess(null)

    // Validate all required fields
    const errors: typeof fieldErrors = {}

    if (!selectedBoat || selectedBoat.length === 0) {
      errors.boat = 'Please select a boat from the available options'
      toast.error('Missing Required Field', {
        description: 'Please select a boat to continue',
      })
    } else {
      // Warn if boat capacity is less than passenger count (but still allow booking)
      const selectedBoatData = availableBoats.find(b => b.boat_id === selectedBoat)
      const passengersNum = parseInt(passengers) || 0
      if (selectedBoatData && selectedBoatData.capacity < passengersNum) {
        toast.warning('Capacity Warning', {
          description: `This boat has ${selectedBoatData.capacity} seats but you entered ${passengersNum} passengers. Are you sure?`,
        })
        // Don't block the booking, just warn
      }
    }

    if (!customerName || customerName.trim().length === 0) {
      errors.customerName = 'Customer name is required'
    }

    if (!customerPhone || customerPhone.trim().length === 0) {
      errors.customerPhone = 'Customer phone is required'
    }

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)

      // Show specific error message
      const errorMessages = Object.values(errors).join(', ')
      toast.error('Please Fix the Following Errors', {
        description: errorMessages,
      })

      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }

      return
    }

    if (!user) {
      toast.error('Session Error', {
        description: 'Please refresh the page and try again',
      })
      return
    }

    setSubmitting(true)

    try {
      const endTime = calculateEndTime(startTime, duration)

      // Calculate fuel cost and package add-on cost
      const bookingCosts = await calculateAllBookingCosts(
        selectedBoat,
        user.company_id,
        duration,
        packageType,
        parseInt(passengers)
      )

      // Prepare booking data
      const bookingData = {
        p_company_id: user.company_id,
        p_boat_id: selectedBoat,
        p_agent_id: user.id,
        p_captain_id: selectedCaptain && selectedCaptain !== 'none' ? selectedCaptain : null,
        p_booking_date: format(date, 'yyyy-MM-dd'),
        p_start_time: startTime,
        p_duration: duration,
        p_customer_name: customerName,
        p_customer_phone: customerPhone,
        p_customer_email: customerEmail || null,
        p_passengers: parseInt(passengers),
        p_package_type: packageType,
        p_total_price: totalPrice,
        p_captain_fee: captainFee,
        p_deposit_amount: parseFloat(depositAmount) || 0,
        p_notes: notes || null,
        p_booking_category: bookingCategory,
        p_discount_percentage: parseFloat(discountPercentage) || 0,
        p_is_bare_boat: isBareBoat || bookingCategory === 'bare_boat',
        p_fuel_cost: bookingCosts.fuel_cost,
        p_package_addon_cost: bookingCosts.package_addon_cost,
        p_cancellation_policy_id: selectedCancellationPolicy || null,
        p_instructor_id: bookingCategory === 'sailing_school' && selectedInstructor ? selectedInstructor : null
      }

      // Validate boat ID is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(selectedBoat)) {
        throw new Error('Invalid boat selection. Please select a boat again.')
      }

      let bookingIdResult: string

      if (confirmImmediately) {
        // Create booking directly as confirmed
        const { data: insertData, error: insertError } = await supabase
          .from('bookings')
          .insert({
            company_id: user.company_id,
            boat_id: selectedBoat,
            agent_id: user.id,
            captain_id: selectedCaptain && selectedCaptain !== 'none' ? selectedCaptain : null,
            booking_date: format(date, 'yyyy-MM-dd'),
            start_time: startTime,
            end_time: endTime,
            duration: duration,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail || null,
            passengers: parseInt(passengers),
            package_type: packageType,
            total_price: totalPrice,
            captain_fee: captainFee,
            deposit_amount: parseFloat(depositAmount) || 0,
            notes: notes || null,
            booking_category: bookingCategory,
            discount_percentage: parseFloat(discountPercentage) || 0,
            is_bare_boat: isBareBoat || bookingCategory === 'bare_boat',
            fuel_cost: bookingCosts.fuel_cost,
            package_addon_cost: bookingCosts.package_addon_cost,
            cancellation_policy_id: selectedCancellationPolicy || null,
            instructor_id: bookingCategory === 'sailing_school' && selectedInstructor ? selectedInstructor : null,
            status: 'confirmed',
            deposit_paid: parseFloat(depositAmount) > 0
          })
          .select('id')
          .single()

        if (insertError) throw insertError
        bookingIdResult = insertData.id

        toast.success('Booking Confirmed!', {
          description: 'The booking has been confirmed immediately.',
        })
      } else {
        // Create booking with hold
        const { data, error: bookingError } = await supabase
          .rpc('create_booking_with_hold', bookingData)

        if (bookingError) throw bookingError
        bookingIdResult = data

        // Set hold time (15 minutes from now)
        const holdTime = new Date(Date.now() + 15 * 60 * 1000)
        setHoldUntil(holdTime)

        toast.success('Booking created successfully!', {
          description: 'You have 15 minutes to confirm this booking.',
        })
      }

      // Set booking ID and show confirmation dialog
      setBookingId(bookingIdResult)
      setShowConfirmation(true)

      // Assign sailors if any selected
      if (selectedSailors.length > 0 && bookingIdResult) {
        try {
          const response = await fetch('/api/bookings/sailors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: bookingIdResult,
              sailors: selectedSailors,
            }),
          })

          if (!response.ok) {
            console.error('Failed to assign sailors')
          }
        } catch (sailorError) {
          console.error('Error assigning sailors:', sailorError)
        }
      }

    } catch (err: any) {
      console.error('Booking error:', err)

      // Specific error handling with user-friendly messages
      if (err.message?.includes('invalid input syntax for type uuid')) {
        setFieldErrors({ boat: 'Invalid boat selection. Please select a boat again.' })
        toast.error('Boat Selection Error', {
          description: 'There was an issue with the boat you selected. Please choose a boat again.',
        })
        setSelectedBoat('') // Reset boat selection
      } else if (err.message?.includes('overlaps') || err.message?.includes('no_overlap')) {
        setFieldErrors({ boat: 'This boat is already booked for this time' })
        toast.error('Time Slot Unavailable', {
          description: 'This boat is already booked for the selected time. Please choose a different time slot or another boat.',
        })
      } else if (err.message?.includes('capacity')) {
        toast.error('Too Many Passengers', {
          description: `This boat can only accommodate fewer passengers. Please reduce the number or choose a larger boat.`,
        })
      } else if (err.message?.includes('network') || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        toast.error('Connection Problem', {
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
        })
      } else if (err.message?.includes('permission') || err.message?.includes('denied')) {
        toast.error('Permission Denied', {
          description: 'You do not have permission to create bookings. Please contact your administrator.',
        })
      } else {
        // Generic error with more helpful message
        const errorMessage = err.message || 'Unknown error'
        toast.error('Booking Could Not Be Created', {
          description: `Something went wrong: ${errorMessage}. Please try again or contact support if the problem persists.`,
        })
      }

      setError(err.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quick Book</h1>
            <p className="text-sm text-muted-foreground">
              Create a new booking
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <p className="text-sm text-green-600 dark:text-green-200">{success}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>When?</CardTitle>
              <CardDescription>Select date, time, and duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </div>

              {/* Time & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
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
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <Label htmlFor="passengers">Number of Passengers</Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  max="50"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Type Selector - Admin/Manager/Office Staff Only */}
          {canCreateInternalBookings && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Type</CardTitle>
                <CardDescription>Select the booking category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={bookingCategory} onValueChange={setBookingCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="club_activity">Club Activity</SelectItem>
                    <SelectItem value="sailing_school">Sailing School</SelectItem>
                    <SelectItem value="private_class">Private Class</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="owner_use">Owner Use</SelectItem>
                    <SelectItem value="bare_boat">Bare Boat</SelectItem>
                  </SelectContent>
                </Select>

                {/* Discount input for non-commercial bookings */}
                {bookingCategory !== 'commercial' && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      placeholder="0"
                    />
                    {totalPrice > 0 && parseFloat(discountPercentage) > 0 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Warning: Revenue will be reduced by €{(totalPrice * parseFloat(discountPercentage) / 100).toFixed(2)} ({discountPercentage}%)
                      </p>
                    )}
                  </div>
                )}

                {/* Show note when bare boat is selected */}
                {bookingCategory === 'bare_boat' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                    Bare boat mode: Captain and crew selection disabled
                  </p>
                )}

                {/* Instructor selection for sailing school bookings */}
                {bookingCategory === 'sailing_school' && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="instructor">Instructor *</Label>
                    <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.first_name} {instructor.last_name} (€{instructor.hourly_rate?.toFixed(2)}/h)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {instructors.length === 0 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        No instructors available. Please add instructors first.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Weather Recommendation */}
          <BookingWeatherCard
            date={format(date, 'yyyy-MM-dd')}
            startTime={startTime}
            loading={loadingWeather}
            weatherData={weatherData}
          />

          {/* Available Boats */}
          <Card id="boat" className={fieldErrors.boat ? 'border-red-500 border-2' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Choose Your Boat {fieldErrors.boat && '*'}</span>
                {fieldErrors.boat && (
                  <span className="text-sm font-normal text-red-600">Required</span>
                )}
              </CardTitle>
              <CardDescription>
                {loadingBoats
                  ? 'Checking availability...'
                  : `${availableBoats.length} boats available for this time slot. Select any boat you prefer.`}
              </CardDescription>
              {fieldErrors.boat && (
                <p className="text-sm text-red-600 font-semibold mt-2">
                  {fieldErrors.boat}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {loadingBoats ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : availableBoats.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No boats available for selected time slot. Try different time or date.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableBoats.map((boat) => {
                    const boatPrice = pricing.find(
                      p => p.boat_id === boat.boat_id && p.package_type === packageType
                    )

                    // Check if boat meets passenger requirements
                    const passengersNum = parseInt(passengers) || 0
                    const meetsCapacity = boat.capacity >= passengersNum
                    const isRecommended = boat.capacity >= passengersNum && boat.capacity <= passengersNum + 2

                    console.log('Rendering boat:', boat.boat_id, boat.boat_name, 'Selected:', selectedBoat, 'Capacity:', boat.capacity, 'Passengers:', passengersNum)

                    return (
                      <div
                        key={boat.boat_id}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('🔵 DIV CLICKED:', boat.boat_name, boat.boat_id)
                          console.log('🔵 Current selectedBoat:', selectedBoat)
                          console.log('🔵 Same boat?', selectedBoat === boat.boat_id)
                          console.log('🔵 Setting selectedBoat to:', boat.boat_id)
                          setSelectedBoat(boat.boat_id)
                          console.log('🔵 State update called')
                          // Clear error when user selects a boat
                          if (fieldErrors.boat) {
                            setFieldErrors(prev => ({ ...prev, boat: undefined }))
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedBoat(boat.boat_id)
                          }
                        }}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md min-h-[88px] ${
                          selectedBoat === boat.boat_id
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-700'
                            : !meetsCapacity
                            ? 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 hover:border-orange-300 dark:hover:border-orange-600'
                            : fieldErrors.boat
                            ? 'border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        style={{ position: 'relative', zIndex: 1 }}
                      >
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          <input
                            type="radio"
                            name="boat"
                            value={boat.boat_id}
                            checked={selectedBoat === boat.boat_id}
                            onChange={() => {
                              // Handled by div onClick
                            }}
                            className="w-4 h-4 pointer-events-none mt-0.5 sm:mt-0 flex-shrink-0"
                            readOnly
                            tabIndex={-1}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-semibold break-words">{boat.boat_name}</p>
                              {isRecommended && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Recommended
                                </span>
                              )}
                              {!meetsCapacity && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Too Small
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize break-words">
                              {boat.boat_type} • {boat.capacity} pax
                            </p>
                            {!meetsCapacity && (
                              <p className="text-xs text-orange-600 mt-1 break-words">
                                Needs {passengersNum - boat.capacity} more {passengersNum - boat.capacity === 1 ? 'seat' : 'seats'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 flex-shrink-0 sm:text-right">
                          <p className="font-bold text-base sm:text-lg">
                            €{boatPrice?.price || 0}
                          </p>
                          <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0">
                            <p className="text-xs text-muted-foreground">
                              {duration}
                            </p>
                            {passengersNum > 0 && (
                              <p className={`text-xs ${
                                meetsCapacity ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {meetsCapacity ? '✓' : '✗'} {passengersNum} pax
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Captain Selection - Only for admin/manager/office_staff */}
          {selectedBoat && captains.length > 0 && canAssignCrew && !isBareBoat && bookingCategory !== 'bare_boat' && (
            <Card>
              <CardHeader>
                <CardTitle>Captain</CardTitle>
                <CardDescription>Select a captain (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
                  <SelectTrigger>
                    <SelectValue placeholder="No captain selected" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No captain</SelectItem>
                    {captains.map((captain) => (
                      <SelectItem key={captain.id} value={captain.id}>
                        {captain.first_name} {captain.last_name}
                        {captain.hourly_rate > 0 && ` - €${captain.hourly_rate}/h`}
                        {captain.hourly_rate === 0 && ' (Owner - No Charge)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCaptain && selectedCaptain !== 'none' && captainFee > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Captain cost: €{captainFee.toFixed(2)} ({parseInt(duration.replace('h', ''))}h × €
                    {captains.find(c => c.id === selectedCaptain)?.hourly_rate}/h)
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sailor Selection - Only for admin/manager/office_staff */}
          {selectedBoat && canAssignCrew && !isBareBoat && bookingCategory !== 'bare_boat' && (
            <Card>
              <CardHeader>
                <CardTitle>Sailors</CardTitle>
                <CardDescription>Assign sailors to this booking (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <SailorSelect
                  durationHours={parseInt(duration.replace('h', ''))}
                  selectedSailors={selectedSailors}
                  onSailorsChange={setSelectedSailors}
                />
              </CardContent>
            </Card>
          )}

          {/* Package Selection */}
          {selectedBoat && (
            <Card>
              <CardHeader>
                <CardTitle>Package</CardTitle>
                <CardDescription>Choose what&apos;s included</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Customer Details */}
          {selectedBoat && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>Who is this booking for?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className={fieldErrors.customerName ? 'text-red-600' : ''}>
                    Full Name *
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value)
                      // Clear error when user starts typing
                      if (fieldErrors.customerName) {
                        setFieldErrors(prev => ({ ...prev, customerName: undefined }))
                      }
                    }}
                    placeholder="John Doe"
                    required
                    className={fieldErrors.customerName ? 'border-red-500 border-2' : ''}
                  />
                  {fieldErrors.customerName && (
                    <p className="text-sm text-red-600 font-semibold">
                      {fieldErrors.customerName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className={fieldErrors.customerPhone ? 'text-red-600' : ''}>
                    Phone *
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value)
                      // Clear error when user starts typing
                      if (fieldErrors.customerPhone) {
                        setFieldErrors(prev => ({ ...prev, customerPhone: undefined }))
                      }
                    }}
                    placeholder="+34 600 000 000"
                    required
                    className={fieldErrors.customerPhone ? 'border-red-500 border-2' : ''}
                  />
                  {fieldErrors.customerPhone && (
                    <p className="text-sm text-red-600 font-semibold">
                      {fieldErrors.customerPhone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email (optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requests (optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Birthday celebration, dietary requirements, etc."
                  />
                </div>

                <div className="space-y-2">
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
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {selectedBoat && totalPrice > 0 && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span className="font-semibold">{format(date, 'PPP')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time:</span>
                  <span className="font-semibold">
                    {startTime} - {calculateEndTime(startTime, duration)} ({duration})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Passengers:</span>
                  <span className="font-semibold">{passengers}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t dark:border-blue-800 pt-2 mt-2">
                  <span>Total Price:</span>
                  <span className="text-blue-600 dark:text-blue-300">€{totalPrice.toFixed(2)}</span>
                </div>
                {fuelCost > 0 && (
                  <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                    <span>Fuel Cost:</span>
                    <span className="font-semibold">€{fuelCost.toFixed(2)}</span>
                  </div>
                )}
                {packageAddonCost > 0 && (
                  <div className="flex justify-between text-sm text-purple-600 dark:text-purple-400">
                    <span>Package Add-on Cost:</span>
                    <span className="font-semibold">€{packageAddonCost.toFixed(2)}</span>
                  </div>
                )}
                {(fuelCost > 0 || packageAddonCost > 0) && (
                  <div className="flex justify-between text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <span>Total Operational Costs:</span>
                    <span>€{(fuelCost + packageAddonCost).toFixed(2)}</span>
                  </div>
                )}
                {captainFee > 0 && (
                  <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                    <span>Captain Cost:</span>
                    <span className="font-semibold">€{captainFee.toFixed(2)}</span>
                  </div>
                )}
                {canCreateInternalBookings && (fuelCost > 0 || packageAddonCost > 0 || captainFee > 0) && (
                  <div className="flex justify-between text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-2 rounded border border-green-200 dark:border-green-800">
                    <span>Net Profit (after costs):</span>
                    <span>€{(totalPrice - fuelCost - packageAddonCost - captainFee).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Your Commission ({user?.commission_percentage}%):</span>
                  <span className="font-semibold">€{commission.toFixed(2)}</span>
                </div>
                {parseFloat(depositAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Deposit:</span>
                    <span className="font-semibold">€{depositAmount}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Booking Confirmation Option */}
          {selectedBoat && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
              <CardHeader>
                <CardTitle className="text-base">Confirmation Option</CardTitle>
                <CardDescription>Choose how to process this booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => setConfirmImmediately(false)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    !confirmImmediately
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="confirmOption"
                      checked={!confirmImmediately}
                      onChange={() => setConfirmImmediately(false)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Hold for 15 Minutes</p>
                      <p className="text-sm text-muted-foreground">
                        Reserve the boat with a temporary hold. You can confirm later.
                      </p>
                    </div>
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </div>

                <div
                  onClick={() => setConfirmImmediately(true)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    confirmImmediately
                      ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950 ring-2 ring-green-200 dark:ring-green-700'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="confirmOption"
                      checked={confirmImmediately}
                      onChange={() => setConfirmImmediately(true)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Confirm Immediately</p>
                      <p className="text-sm text-muted-foreground">
                        Finalize the booking right away. No hold period.
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {selectedBoat && (
            <Button
              type="submit"
              className={`w-full h-12 text-lg ${
                confirmImmediately
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
              disabled={submitting || !customerName || !customerPhone}
            >
              {submitting
                ? 'Creating Booking...'
                : confirmImmediately
                ? '✓ Confirm Booking Now'
                : '⏱ Hold Booking (15 min)'}
            </Button>
          )}
        </form>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                Booking Created Successfully!
              </DialogTitle>
              <DialogDescription>
                Your booking has been created with a 15-minute hold.
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
                      {availableBoats.find(b => b.boat_id === selectedBoat)?.boat_name}
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
                  onClick={() => {
                    router.push('/dashboard')
                  }}
                  className="w-full"
                >
                  View in Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setShowConfirmation(false)
                    setBookingId(null)
                    setHoldUntil(null)
                    // Reset form
                    setSelectedBoat('')
                    setSelectedCaptain('none')
                    setCustomerName('')
                    setCustomerPhone('')
                    setCustomerEmail('')
                    setNotes('')
                    setDepositAmount('0')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Create Another Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

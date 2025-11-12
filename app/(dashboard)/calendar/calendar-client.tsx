'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns'
import { enUS } from 'date-fns/locale'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Ship, User, Clock } from 'lucide-react'

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Create drag-and-drop calendar
const DragAndDropCalendar = withDragAndDrop(Calendar)

type Booking = {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  customer_name: string
  customer_phone: string
  passengers: number
  status: string
  boat_id: string
  boats: {
    id: string
    name: string
    boat_type: string
  }
  total_price: number
}

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: Booking
}

type Boat = {
  id: string
  name: string
}

interface CalendarClientProps {
  bookings: Booking[]
  boats: Boat[]
}

// Status colors
const STATUS_COLORS = {
  confirmed: { bg: '#10b981', text: '#ffffff' },
  pending_hold: { bg: '#f59e0b', text: '#ffffff' },
  completed: { bg: '#6366f1', text: '#ffffff' },
  cancelled: { bg: '#ef4444', text: '#ffffff' },
  no_show: { bg: '#9ca3af', text: '#ffffff' },
}

// Generate boat colors
const BOAT_COLORS = [
  { bg: '#3b82f6', text: '#ffffff' },
  { bg: '#8b5cf6', text: '#ffffff' },
  { bg: '#ec4899', text: '#ffffff' },
  { bg: '#14b8a6', text: '#ffffff' },
  { bg: '#f97316', text: '#ffffff' },
  { bg: '#84cc16', text: '#ffffff' },
]

export default function CalendarClient({ bookings, boats }: CalendarClientProps) {
  const router = useRouter()
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [selectedBoat, setSelectedBoat] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [colorBy, setColorBy] = useState<'boat' | 'status'>('boat')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Local bookings state for optimistic updates
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update local bookings when server data changes
  useEffect(() => {
    setLocalBookings(bookings)
  }, [bookings])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  // Create boat color map
  const boatColorMap = useMemo(() => {
    const map: Record<string, { bg: string; text: string }> = {}
    boats.forEach((boat, index) => {
      map[boat.id] = BOAT_COLORS[index % BOAT_COLORS.length]
    })
    return map
  }, [boats])

  // Transform bookings to calendar events - using localBookings for instant updates
  const events: CalendarEvent[] = useMemo(() => {
    let filtered = localBookings

    // Filter by boat
    if (selectedBoat !== 'all') {
      filtered = filtered.filter((b) => b.boat_id === selectedBoat)
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === selectedStatus)
    }

    return filtered.map((booking) => {
      const startDate = new Date(`${booking.booking_date}T${booking.start_time}`)
      const endDate = new Date(`${booking.booking_date}T${booking.end_time}`)

      // Format times for display
      const startTime = format(startDate, 'HH:mm')
      const endTime = format(endDate, 'HH:mm')

      return {
        id: booking.id,
        title: `${startTime}-${endTime} | ${booking.boats.name} - ${booking.customer_name}`,
        start: startDate,
        end: endDate,
        resource: booking,
      }
    })
  }, [localBookings, selectedBoat, selectedStatus])

  // Event style getter
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const booking = event.resource
      let colors

      if (colorBy === 'boat') {
        colors = boatColorMap[booking.boat_id] || BOAT_COLORS[0]
      } else {
        colors = STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed
      }

      return {
        style: {
          backgroundColor: colors.bg,
          color: colors.text,
          border: 'none',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
      }
    },
    [colorBy, boatColorMap]
  )

  // Handle event drop (drag and drop) with optimistic updates
  const onEventDrop = useCallback(
    async ({ event, start, end }: any) => {
      const booking = event.resource as Booking

      // Format the new date and times
      const newDate = format(start, 'yyyy-MM-dd')
      const newStartTime = format(start, 'HH:mm:ss')
      const newEndTime = format(end, 'HH:mm:ss')

      // Optimistic update - immediately update local state
      setLocalBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                booking_date: newDate,
                start_time: newStartTime,
                end_time: newEndTime,
              }
            : b
        )
      )

      try {
        // Call API to reschedule in background
        const response = await fetch('/api/bookings/reschedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            newDate,
            newStartTime,
            newEndTime,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reschedule booking')
        }

        toast.success('Booking rescheduled successfully')

        // Debounced refresh - refresh server data after a delay
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
        refreshTimeoutRef.current = setTimeout(() => {
          router.refresh()
        }, 1000)
      } catch (error: any) {
        console.error('Reschedule error:', error)
        toast.error(error.message || 'Failed to reschedule booking')

        // Revert optimistic update on error
        setLocalBookings(bookings)
      }
    },
    [router, bookings]
  )

  // Handle event resize with optimistic updates
  const onEventResize = useCallback(
    async ({ event, start, end }: any) => {
      const booking = event.resource as Booking

      const newDate = format(start, 'yyyy-MM-dd')
      const newStartTime = format(start, 'HH:mm:ss')
      const newEndTime = format(end, 'HH:mm:ss')

      // Optimistic update - immediately update local state
      setLocalBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                booking_date: newDate,
                start_time: newStartTime,
                end_time: newEndTime,
              }
            : b
        )
      )

      try {
        // Call API to reschedule in background
        const response = await fetch('/api/bookings/reschedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            newDate,
            newStartTime,
            newEndTime,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reschedule booking')
        }

        toast.success('Booking time updated successfully')

        // Debounced refresh - refresh server data after a delay
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
        refreshTimeoutRef.current = setTimeout(() => {
          router.refresh()
        }, 1000)
      } catch (error: any) {
        console.error('Resize error:', error)
        toast.error(error.message || 'Failed to update booking time')

        // Revert optimistic update on error
        setLocalBookings(bookings)
      }
    },
    [router, bookings]
  )

  // Handle event click
  const onSelectEvent = useCallback((event: object, e: React.SyntheticEvent) => {
    setSelectedEvent(event as CalendarEvent)
    setDialogOpen(true)
  }, [])

  // Navigate to booking details
  const viewBookingDetails = () => {
    if (selectedEvent) {
      router.push(`/bookings/${selectedEvent.id}`)
    }
  }

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'pending_hold':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'no_show':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* View Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">View</label>
                <Select value={view} onValueChange={(v) => setView(v as View)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="agenda">Agenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Boat Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Boat</label>
                <Select value={selectedBoat} onValueChange={setSelectedBoat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Boats</SelectItem>
                    {boats.map((boat) => (
                      <SelectItem key={boat.id} value={boat.id}>
                        {boat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending_hold">Pending Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Color By</label>
                <Select value={colorBy} onValueChange={(v) => setColorBy(v as 'boat' | 'status')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boat">Boat</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedBoat !== 'all' || selectedStatus !== 'all') && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedBoat !== 'all' && (
                  <Badge variant="secondary">
                    Boat: {boats.find((b) => b.id === selectedBoat)?.name}
                  </Badge>
                )}
                {selectedStatus !== 'all' && (
                  <Badge variant="secondary">Status: {selectedStatus.replace('_', ' ')}</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBoat('all')
                    setSelectedStatus('all')
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Legend ({colorBy === 'boat' ? 'by Boat' : 'by Status'}):</p>
              <div className="flex flex-wrap gap-2">
                {colorBy === 'boat' ? (
                  boats.map((boat) => {
                    const colors = boatColorMap[boat.id]
                    return (
                      <div key={boat.id} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: colors.bg }}
                        />
                        <span className="text-sm">{boat.name}</span>
                      </div>
                    )
                  })
                ) : (
                  Object.entries(STATUS_COLORS).map(([status, colors]) => (
                    <div key={status} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colors.bg }}
                      />
                      <span className="text-sm">{status.replace('_', ' ')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardContent className="pt-6">
            <div style={{ height: '700px' }}>
              <DragAndDropCalendar
                localizer={localizer}
                events={events}
                view={view}
                date={date}
                onView={setView}
                onNavigate={setDate}
                onSelectEvent={onSelectEvent}
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                eventPropGetter={eventStyleGetter}
                resizable
                draggableAccessor={() => true}
                step={30}
                timeslots={2}
                min={new Date(2024, 0, 1, 6, 0, 0)}
                max={new Date(2024, 0, 1, 22, 0, 0)}
                showMultiDayTimes
                defaultDate={new Date()}
                popup
                views={['day', 'week', 'month', 'agenda']}
                formats={{
                  timeGutterFormat: 'HH:mm',
                  eventTimeRangeFormat: ({ start, end }: any) =>
                    `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
                  agendaTimeFormat: 'HH:mm',
                  agendaTimeRangeFormat: ({ start, end }: any) =>
                    `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>Quick view of booking information</DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedEvent.resource.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Boat</p>
                    <p className="font-medium flex items-center gap-2">
                      <Ship className="w-4 h-4" />
                      {selectedEvent.resource.boats.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(selectedEvent.start, 'PPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passengers</p>
                    <p className="font-medium">{selectedEvent.resource.passengers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusBadgeClass(selectedEvent.resource.status)}>
                      {selectedEvent.resource.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={viewBookingDetails} className="flex-1">
                    View Full Details
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Instructions */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Tip:</strong> Drag and drop events to reschedule bookings. You can also resize events to change their duration.
              Click on any event to see quick details or view the full booking page.
            </p>
          </CardContent>
        </Card>
      </div>
  )
}

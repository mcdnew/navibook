'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Anchor, Calendar, Clock, AlertCircle, Sparkles, TrendingUp } from 'lucide-react'
import { format, isPast, addHours } from 'date-fns'
import Link from 'next/link'

interface Booking {
  id: string
  customer_name: string
  customer_phone: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  hold_until: string | null
  boats?: {
    name: string
  }
}

export default function DashboardBookingsTabs() {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [latestCreated, setLatestCreated] = useState<Booking[]>([])
  const [todaysCharters, setTodaysCharters] = useState<Booking[]>([])
  const [urgentActions, setUrgentActions] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      // Fetch upcoming bookings (next 10 future bookings)
      const { data: upcoming } = await supabase
        .from('bookings')
        .select('*, boats(name)')
        .gte('booking_date', today)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true})
        .limit(10)

      setUpcomingBookings(upcoming || [])

      // Fetch latest created bookings (last 10 created regardless of booking date)
      const { data: latest } = await supabase
        .from('bookings')
        .select('*, boats(name)')
        .order('created_at', { ascending: false })
        .limit(10)

      setLatestCreated(latest || [])

      // Fetch today's charters
      const { data: todaysData } = await supabase
        .from('bookings')
        .select('*, boats(name)')
        .eq('booking_date', today)
        .in('status', ['confirmed', 'pending_hold'])
        .order('start_time', { ascending: true })

      setTodaysCharters(todaysData || [])

      // Fetch urgent actions
      // 1. Pending holds expiring soon (within 2 hours)
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      const { data: expiringHolds } = await supabase
        .from('bookings')
        .select('*, boats(name)')
        .eq('status', 'pending_hold')
        .not('hold_until', 'is', null)
        .lte('hold_until', twoHoursFromNow)
        .order('hold_until', { ascending: true })

      // 2. Unconfirmed bookings within 24 hours
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { data: unconfirmed } = await supabase
        .from('bookings')
        .select('*, boats(name)')
        .eq('status', 'pending_hold')
        .gte('booking_date', today)
        .lte('booking_date', tomorrow)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true })

      // Combine and deduplicate urgent items
      const urgentMap = new Map()
      ;[...(expiringHolds || []), ...(unconfirmed || [])].forEach(booking => {
        urgentMap.set(booking.id, booking)
      })

      setUrgentActions(Array.from(urgentMap.values()))
      setLoading(false)
    }

    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending_hold: 'bg-orange-100 text-orange-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-gray-100 text-gray-700',
    }
    return variants[status] || 'bg-gray-100 text-gray-700'
  }

  const getUrgencyType = (booking: Booking): { type: string; message: string } => {
    if (booking.status === 'pending_hold' && booking.hold_until) {
      const holdExpiry = new Date(booking.hold_until)
      const now = new Date()
      const hoursUntilExpiry = (holdExpiry.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilExpiry <= 0) {
        return { type: 'expired', message: 'Hold expired' }
      } else if (hoursUntilExpiry < 1) {
        return { type: 'critical', message: `Hold expires in ${Math.round(hoursUntilExpiry * 60)} minutes` }
      } else if (hoursUntilExpiry < 2) {
        return { type: 'warning', message: `Hold expires in ${Math.round(hoursUntilExpiry)} hour(s)` }
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    if (booking.booking_date === today && booking.status === 'pending_hold') {
      return { type: 'critical', message: 'Charter today - not confirmed!' }
    } else if (booking.booking_date === tomorrow && booking.status === 'pending_hold') {
      return { type: 'warning', message: 'Charter tomorrow - not confirmed' }
    }

    return { type: 'info', message: 'Needs attention' }
  }

  const BookingCard = ({ booking, showUrgency = false }: { booking: Booking; showUrgency?: boolean }) => {
    const urgency = showUrgency ? getUrgencyType(booking) : null

    return (
      <Link href={`/bookings/${booking.id}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-colors gap-3 cursor-pointer">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{booking.customer_name}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(booking.booking_date), 'MMM d, yyyy')} at {booking.start_time}
                </p>
                {booking.boats?.name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {booking.boats.name}
                  </p>
                )}
              </div>
              <Badge className={getStatusBadge(booking.status)}>
                {booking.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            {urgency && (
              <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                urgency.type === 'critical' ? 'text-red-600' :
                urgency.type === 'warning' ? 'text-orange-600' :
                urgency.type === 'expired' ? 'text-gray-600' :
                'text-blue-600'
              }`}>
                <AlertCircle className="w-3.5 h-3.5" />
                {urgency.message}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )

  if (loading) {
    return (
      <Card className="maritime-card">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading bookings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="maritime-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Anchor className="w-5 h-5 text-primary" />
          Bookings Overview
        </CardTitle>
        <CardDescription>Multiple views of your bookings for better insights</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
            <TabsTrigger value="upcoming" className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">Next</span>
              {upcomingBookings.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {upcomingBookings.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="latest" className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Latest Created</span>
              <span className="sm:hidden">New</span>
              {latestCreated.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {latestCreated.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="today" className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Today</span>
              <span className="sm:hidden">Today</span>
              {todaysCharters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {todaysCharters.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="urgent" className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Urgent</span>
              <span className="sm:hidden">Alert</span>
              {urgentActions.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {urgentActions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <EmptyState icon={Calendar} message="No upcoming bookings" />
            )}
          </TabsContent>

          <TabsContent value="latest" className="space-y-3">
            {latestCreated.length > 0 ? (
              <>
                <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Most recently created bookings (by creation date, not charter date)
                </div>
                {latestCreated.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </>
            ) : (
              <EmptyState icon={Sparkles} message="No bookings created yet" />
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-3">
            {todaysCharters.length > 0 ? (
              <>
                <div className="text-xs text-blue-600 font-medium mb-3 flex items-center gap-1.5 bg-blue-50 p-2 rounded">
                  <Clock className="w-3.5 h-3.5" />
                  Charters happening today
                </div>
                {todaysCharters.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </>
            ) : (
              <EmptyState icon={Clock} message="No charters scheduled for today" />
            )}
          </TabsContent>

          <TabsContent value="urgent" className="space-y-3">
            {urgentActions.length > 0 ? (
              <>
                <div className="text-xs text-red-600 font-medium mb-3 flex items-center gap-1.5 bg-red-50 p-2 rounded">
                  <AlertCircle className="w-3.5 h-3.5" />
                  These bookings require immediate attention
                </div>
                {urgentActions.map(booking => (
                  <BookingCard key={booking.id} booking={booking} showUrgency />
                ))}
              </>
            ) : (
              <EmptyState icon={AlertCircle} message="No urgent actions required" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Eye, Search, Anchor, Ship, Calendar as CalendarIcon, Users, X, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  customer_name: string
  customer_phone: string
  booking_date: string
  start_time: string
  end_time: string
  passengers: number
  total_price: number
  status: string
  boat_id: string
  boats?: {
    name: string
  }
}

interface BookingsListClientProps {
  bookings: Booking[]
  boats: Array<{ id: string; name: string }>
}

export default function BookingsListClient({
  bookings,
  boats,
}: BookingsListClientProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [boatFilter, setBoatFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  // Count bookings by status
  const statusCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending_hold: bookings.filter((b) => b.status === 'pending_hold').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      no_show: bookings.filter((b) => b.status === 'no_show').length,
    }
  }, [bookings])

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let result = [...bookings]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((booking) => booking.status === statusFilter)
    }

    // Boat filter
    if (boatFilter !== 'all') {
      result = result.filter((booking) => booking.boat_id === boatFilter)
    }

    // Date filter
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    const monthFromNow = new Date(today)
    monthFromNow.setMonth(monthFromNow.getMonth() + 1)

    if (dateFilter === 'today') {
      result = result.filter((booking) => {
        const bookingDate = new Date(booking.booking_date)
        return bookingDate >= today && bookingDate < tomorrow
      })
    } else if (dateFilter === 'week') {
      result = result.filter((booking) => {
        const bookingDate = new Date(booking.booking_date)
        return bookingDate >= today && bookingDate < weekFromNow
      })
    } else if (dateFilter === 'month') {
      result = result.filter((booking) => {
        const bookingDate = new Date(booking.booking_date)
        return bookingDate >= today && bookingDate < monthFromNow
      })
    } else if (dateFilter === 'past') {
      result = result.filter((booking) => {
        const bookingDate = new Date(booking.booking_date)
        return bookingDate < today
      })
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.customer_name.toLowerCase().includes(query) ||
          booking.customer_phone.includes(query) ||
          booking.boats?.name.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'date-desc') {
      result.sort((a, b) => {
        const dateCompare = new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
        if (dateCompare !== 0) return dateCompare
        return b.start_time.localeCompare(a.start_time)
      })
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => {
        const dateCompare = new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
        if (dateCompare !== 0) return dateCompare
        return a.start_time.localeCompare(b.start_time)
      })
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.total_price - a.total_price)
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.total_price - b.total_price)
    } else if (sortBy === 'customer') {
      result.sort((a, b) => a.customer_name.localeCompare(b.customer_name))
    }

    return result
  }, [bookings, statusFilter, searchQuery, boatFilter, dateFilter, sortBy])

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <div className="overflow-x-auto hide-scrollbar">
          <TabsList className="inline-flex w-full md:grid md:grid-cols-6 min-w-max md:min-w-0">
            <TabsTrigger value="all" className="flex-shrink-0">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending_hold" className="flex-shrink-0">
              Pending ({statusCounts.pending_hold})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex-shrink-0">
              Confirmed ({statusCounts.confirmed})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-shrink-0">
              Completed ({statusCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-shrink-0">
              Cancelled ({statusCounts.cancelled})
            </TabsTrigger>
            <TabsTrigger value="no_show" className="flex-shrink-0">
              No-Show ({statusCounts.no_show})
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Filters Bar */}
      <Card className="maritime-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mobile-stack">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customer or boat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="past">Past Bookings</SelectItem>
              </SelectContent>
            </Select>

            {/* Boat Filter */}
            <Select value={boatFilter} onValueChange={setBoatFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Boats" />
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

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="customer">Customer Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || boatFilter !== 'all' || dateFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium inline-flex items-center gap-1">
                  Search: &quot;{searchQuery}&quot;
                </span>
              )}
              {boatFilter !== 'all' && (
                <span className="bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full font-medium inline-flex items-center gap-1">
                  <Ship className="w-3 h-3" />
                  {boats.find((b) => b.id === boatFilter)?.name}
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="bg-accent/10 text-accent-foreground px-3 py-1 rounded-full font-medium inline-flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {dateFilter}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setBoatFilter('all')
                  setDateFilter('all')
                }}
                className="gap-1"
              >
                <X className="w-3 h-3" />
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="maritime-card hover:border-primary/50 transition-all"
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-foreground text-lg">{booking.customer_name}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Ship className="w-3.5 h-3.5" />
                        {booking.boats?.name}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {format(new Date(booking.booking_date), 'MMM d, yyyy')} at {booking.start_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {booking.passengers} passengers
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-semibold text-primary">€{booking.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                        booking.status === 'confirmed'
                          ? 'bg-secondary/20 text-secondary-foreground'
                          : booking.status === 'pending_hold'
                          ? 'bg-accent/20 text-accent-foreground'
                          : booking.status === 'completed'
                          ? 'bg-primary/20 text-primary'
                          : booking.status === 'cancelled'
                          ? 'bg-destructive/20 text-destructive'
                          : booking.status === 'no_show'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <Link href={`/bookings/${booking.id}`}>
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="maritime-card">
          <CardContent className="py-16">
            <div className="text-center">
              <Anchor className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-6 text-lg">
                No bookings found matching your filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setBoatFilter('all')
                  setDateFilter('all')
                  setStatusFilter('all')
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

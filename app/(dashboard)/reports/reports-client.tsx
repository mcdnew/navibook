'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar as CalendarIcon,
  Download,
  Ship,
  Package,
  Award,
} from 'lucide-react'

type Booking = {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  duration: string
  total_price: number
  status: string
  package_type: string
  agent_id: string
  boat_id: string
  agents: { first_name: string; last_name: string; commission_percentage: number }
  boats: { name: string; boat_type: string }
}

type ReportsClientProps = {
  bookings: Booking[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const PRESET_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
]

export default function ReportsClient({ bookings }: ReportsClientProps) {
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30))
  const [dateTo, setDateTo] = useState<Date>(new Date())

  const applyPresetRange = (preset: string) => {
    const today = new Date()
    switch (preset) {
      case 'today':
        setDateFrom(today)
        setDateTo(today)
        break
      case 'yesterday':
        const yesterday = subDays(today, 1)
        setDateFrom(yesterday)
        setDateTo(yesterday)
        break
      case 'last7':
        setDateFrom(subDays(today, 7))
        setDateTo(today)
        break
      case 'last30':
        setDateFrom(subDays(today, 30))
        setDateTo(today)
        break
      case 'thisMonth':
        setDateFrom(startOfMonth(today))
        setDateTo(endOfMonth(today))
        break
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1)
        setDateFrom(startOfMonth(lastMonth))
        setDateTo(endOfMonth(lastMonth))
        break
      case 'thisYear':
        setDateFrom(new Date(today.getFullYear(), 0, 1))
        setDateTo(today)
        break
    }
  }

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const bookingDate = new Date(b.booking_date)
      return bookingDate >= dateFrom && bookingDate <= dateTo
    })
  }, [bookings, dateFrom, dateTo])

  // Revenue calculations
  const revenueData = useMemo(() => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.total_price, 0)
    const avgBookingValue = confirmed.length > 0 ? totalRevenue / confirmed.length : 0

    return { totalRevenue, avgBookingValue, confirmedCount: confirmed.length }
  }, [filteredBookings])

  // Daily revenue chart data
  const dailyRevenueData = useMemo(() => {
    const dailyMap = new Map<string, number>()
    filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const date = b.booking_date
        dailyMap.set(date, (dailyMap.get(date) || 0) + b.total_price)
      })

    return Array.from(dailyMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredBookings])

  // Booking statistics by boat
  const boatStats = useMemo(() => {
    const boatMap = new Map<string, { name: string; count: number; revenue: number }>()
    filteredBookings.forEach(b => {
      const key = b.boat_id
      const existing = boatMap.get(key) || { name: b.boats.name, count: 0, revenue: 0 }
      existing.count++
      if (b.status === 'confirmed' || b.status === 'completed') {
        existing.revenue += b.total_price
      }
      boatMap.set(key, existing)
    })

    return Array.from(boatMap.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings])

  // Booking statistics by agent
  const agentStats = useMemo(() => {
    const agentMap = new Map<string, { name: string; count: number; revenue: number; commission: number }>()
    filteredBookings.forEach(b => {
      const key = b.agent_id
      const name = `${b.agents.first_name} ${b.agents.last_name}`
      const existing = agentMap.get(key) || { name, count: 0, revenue: 0, commission: 0 }
      existing.count++
      if (b.status === 'confirmed' || b.status === 'completed') {
        existing.revenue += b.total_price
        existing.commission += (b.total_price * b.agents.commission_percentage) / 100
      }
      agentMap.set(key, existing)
    })

    return Array.from(agentMap.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings])

  // Booking statistics by package
  const packageStats = useMemo(() => {
    const packageMap = new Map<string, { count: number; revenue: number }>()
    filteredBookings.forEach(b => {
      const existing = packageMap.get(b.package_type) || { count: 0, revenue: 0 }
      existing.count++
      if (b.status === 'confirmed' || b.status === 'completed') {
        existing.revenue += b.total_price
      }
      packageMap.set(b.package_type, existing)
    })

    return Array.from(packageMap.entries()).map(([type, stats]) => ({
      name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      ...stats
    }))
  }, [filteredBookings])

  // Occupancy rate calculations
  const occupancyData = useMemo(() => {
    const boatDaysMap = new Map<string, { name: string; bookedDays: Set<string>; totalDays: number }>()

    filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const key = b.boat_id
        const existing = boatDaysMap.get(key) || {
          name: b.boats.name,
          bookedDays: new Set<string>(),
          totalDays: 0
        }
        existing.bookedDays.add(b.booking_date)
        boatDaysMap.set(key, existing)
      })

    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return Array.from(boatDaysMap.values()).map(boat => ({
      name: boat.name,
      occupancyRate: (boat.bookedDays.size / daysDiff) * 100,
      bookedDays: boat.bookedDays.size,
      totalDays: daysDiff,
    })).sort((a, b) => b.occupancyRate - a.occupancyRate)
  }, [filteredBookings, dateFrom, dateTo])

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const statusMap = new Map<string, number>()
    filteredBookings.forEach(b => {
      statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1)
    })

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
    }))
  }, [filteredBookings])

  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      // Export to CSV
      const headers = ['Date', 'Customer', 'Boat', 'Agent', 'Package', 'Status', 'Revenue']
      const rows = filteredBookings.map(b => [
        b.booking_date,
        '', // customer name not in this data
        b.boats.name,
        `${b.agents.first_name} ${b.agents.last_name}`,
        b.package_type,
        b.status,
        b.total_price.toFixed(2),
      ])

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`
      a.click()
    } else {
      // PDF export would require a library like jsPDF
      alert('PDF export coming soon!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select a date range or choose a preset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_RANGES.map(range => (
              <Button
                key={range.value}
                variant="outline"
                size="sm"
                onClick={() => applyPresetRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(dateFrom, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFrom} onSelect={(date) => date && setDateFrom(date)} />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(dateTo, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateTo} onSelect={(date) => date && setDateTo(date)} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} bookings from {format(dateFrom, 'PP')} to {format(dateTo, 'PP')}
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{revenueData.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {revenueData.confirmedCount} confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Booking Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{revenueData.avgBookingValue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              per confirmed booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredBookings.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              all statuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              €{agentStats.reduce((sum, a) => sum + a.commission, 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              pending payout
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue Trend</CardTitle>
          <CardDescription>Revenue from confirmed and completed bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (€)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution of booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={entry => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Package Type Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Package</CardTitle>
            <CardDescription>Performance of different packages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={packageStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Boat Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5" />
            Boat Performance
          </CardTitle>
          <CardDescription>Revenue and booking count by boat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {boatStats.map((boat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold">{boat.name}</p>
                  <p className="text-sm text-muted-foreground">{boat.count} bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">€{boat.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance & Commission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Agent Performance & Commission
          </CardTitle>
          <CardDescription>Bookings, revenue, and commission by agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agentStats.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.count} bookings</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold">€{agent.revenue.toFixed(2)}</p>
                  <p className="text-sm text-green-600 font-medium">
                    Commission: €{agent.commission.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Occupancy Rates</CardTitle>
          <CardDescription>Percentage of days each boat was booked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {occupancyData.map((boat, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{boat.name}</span>
                  <span className="text-muted-foreground">
                    {boat.occupancyRate.toFixed(1)}% ({boat.bookedDays}/{boat.totalDays} days)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(boat.occupancyRate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

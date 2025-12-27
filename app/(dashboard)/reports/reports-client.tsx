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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'

type Booking = {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  duration: string
  total_price: number
  captain_fee: number
  sailor_fee: number
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

  // Revenue and cost calculations
  const revenueData = useMemo(() => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.total_price, 0)
    const avgBookingValue = confirmed.length > 0 ? totalRevenue / confirmed.length : 0

    // Cost breakdown
    const totalCaptainCosts = confirmed.reduce((sum, b) => sum + (b.captain_fee || 0), 0)
    const totalSailorCosts = confirmed.reduce((sum, b) => sum + (b.sailor_fee || 0), 0)
    const totalCommissions = confirmed.reduce((sum, b) => {
      if (!b.agents || !b.agent_id) return sum
      return sum + (b.total_price * b.agents.commission_percentage) / 100
    }, 0)
    const totalCosts = totalCaptainCosts + totalSailorCosts + totalCommissions

    // Profit analysis
    const netProfit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      avgBookingValue,
      confirmedCount: confirmed.length,
      totalCaptainCosts,
      totalSailorCosts,
      totalCommissions,
      totalCosts,
      netProfit,
      profitMargin
    }
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

  // Daily profit trend
  const dailyProfitData = useMemo(() => {
    const dailyMap = new Map<string, { date: string; profit: number; margin: number }>()

    filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const date = b.booking_date
        const existing = dailyMap.get(date) || { date, profit: 0, margin: 0 }

        const captainCost = b.captain_fee || 0
        const commission = b.agents ? (b.total_price * b.agents.commission_percentage) / 100 : 0
        const profit = b.total_price - captainCost - commission

        existing.profit += profit

        dailyMap.set(date, existing)
      })

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredBookings])

  // Booking statistics by boat
  const boatStats = useMemo(() => {
    const boatMap = new Map<string, {
      name: string
      count: number
      revenue: number
      captainCosts: number
      sailorCosts: number
      commissions: number
      netProfit: number
    }>()

    filteredBookings.forEach(b => {
      // Skip bookings without boat data
      if (!b.boats || !b.boat_id) return

      const key = b.boat_id
      const existing = boatMap.get(key) || {
        name: b.boats.name,
        count: 0,
        revenue: 0,
        captainCosts: 0,
        sailorCosts: 0,
        commissions: 0,
        netProfit: 0
      }

      existing.count++

      if (b.status === 'confirmed' || b.status === 'completed') {
        const captainCost = b.captain_fee || 0
        const sailorCost = b.sailor_fee || 0
        const commissionPercent = b.agents?.commission_percentage || 0
        const commission = b.total_price * (commissionPercent / 100)
        const totalCosts = captainCost + sailorCost + commission
        const netProfit = b.total_price - totalCosts

        existing.revenue += b.total_price
        existing.captainCosts += captainCost
        existing.sailorCosts += sailorCost
        existing.commissions += commission
        existing.netProfit += netProfit
      }

      boatMap.set(key, existing)
    })

    return Array.from(boatMap.values()).sort((a, b) => b.netProfit - a.netProfit)
  }, [filteredBookings])

  // Booking statistics by agent
  const agentStats = useMemo(() => {
    const agentMap = new Map<string, { name: string; count: number; revenue: number; commission: number }>()
    filteredBookings.forEach(b => {
      // Skip bookings without agent data
      if (!b.agents || !b.agent_id) return

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
        // Skip bookings without boat data
        if (!b.boats || !b.boat_id) return

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

  // Cost composition for pie chart
  const costComposition = useMemo(() => {
    const data = []
    if (revenueData.totalCaptainCosts > 0) {
      data.push({ name: 'Captain Costs', value: revenueData.totalCaptainCosts, color: '#FF8042' })
    }
    if (revenueData.totalSailorCosts > 0) {
      data.push({ name: 'Sailor Costs', value: revenueData.totalSailorCosts, color: '#8B5CF6' })
    }
    if (revenueData.totalCommissions > 0) {
      data.push({ name: 'Agent Commissions', value: revenueData.totalCommissions, color: '#00C49F' })
    }
    if (revenueData.netProfit > 0) {
      data.push({ name: 'Net Profit', value: revenueData.netProfit, color: '#0088FE' })
    }
    return data
  }, [revenueData])

  // Revenue vs Costs trend
  const revenueCostsTrend = useMemo(() => {
    const dailyMap = new Map<string, { date: string; revenue: number; costs: number; profit: number }>()

    filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const date = b.booking_date
        const existing = dailyMap.get(date) || { date, revenue: 0, costs: 0, profit: 0 }

        existing.revenue += b.total_price

        const captainCost = b.captain_fee || 0
        const sailorCost = b.sailor_fee || 0
        const commission = b.agents ? (b.total_price * b.agents.commission_percentage) / 100 : 0
        existing.costs += captainCost + sailorCost + commission
        existing.profit += b.total_price - captainCost - sailorCost - commission

        dailyMap.set(date, existing)
      })

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredBookings])

  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      // Comprehensive CSV export with all cost details
      const headers = [
        'Date', 'Boat', 'Agent', 'Agent Commission %', 'Package', 'Status',
        'Revenue', 'Captain Cost', 'Sailor Cost', 'Commission Cost', 'Total Costs', 'Net Profit', 'Profit Margin %'
      ]

      const rows = filteredBookings.map(b => {
        const captainCost = b.captain_fee || 0
        const sailorCost = b.sailor_fee || 0
        const commissionPercent = b.agents?.commission_percentage || 0
        const commissionCost = b.total_price * (commissionPercent / 100)
        const totalCosts = captainCost + sailorCost + commissionCost
        const netProfit = b.total_price - totalCosts
        const profitMargin = b.total_price > 0 ? (netProfit / b.total_price) * 100 : 0

        return [
          b.booking_date,
          b.boats?.name || 'N/A',
          b.agents ? `${b.agents.first_name} ${b.agents.last_name}` : 'N/A',
          commissionPercent.toFixed(0) + '%',
          b.package_type,
          b.status,
          b.total_price.toFixed(2),
          captainCost.toFixed(2),
          sailorCost.toFixed(2),
          commissionCost.toFixed(2),
          totalCosts.toFixed(2),
          netProfit.toFixed(2),
          profitMargin.toFixed(1) + '%',
        ]
      })

      // Add summary row
      rows.push([])
      rows.push(['SUMMARY', '', '', '', '', '', '', '', '', '', '', '', ''])
      rows.push([
        'Total Revenue',
        '',
        '',
        '',
        '',
        '',
        revenueData.totalRevenue.toFixed(2),
        revenueData.totalCaptainCosts.toFixed(2),
        revenueData.totalSailorCosts.toFixed(2),
        revenueData.totalCommissions.toFixed(2),
        revenueData.totalCosts.toFixed(2),
        revenueData.netProfit.toFixed(2),
        revenueData.profitMargin.toFixed(1) + '%'
      ])

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `business-report-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.csv`
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ship className="w-4 h-4" />
              Captain Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              €{revenueData.totalCaptainCosts.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              operational costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Sailor Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              €{revenueData.totalSailorCosts.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              crew costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              €{revenueData.totalCosts.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              crew + commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              €{revenueData.netProfit.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              after all costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {revenueData.profitMargin.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              of total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics - Tabbed Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Analytics</CardTitle>
          <CardDescription>Visual insights into revenue, costs, and profitability trends</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <LineChartIcon className="w-4 h-4" />
                Revenue Evolution
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Revenue vs Costs
              </TabsTrigger>
              <TabsTrigger value="profit" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Profit Trend
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Cost Breakdown
              </TabsTrigger>
            </TabsList>

            {/* Revenue Evolution Tab */}
            <TabsContent value="revenue" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Track daily revenue trends from confirmed and completed bookings
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyRevenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0088FE"
                    strokeWidth={3}
                    dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Daily Revenue (€)"
                    fill="url(#revenueGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Revenue vs Costs Tab */}
            <TabsContent value="comparison" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Compare daily revenue against operational costs and net profit
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueCostsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip
                    formatter={(value) => `€${Number(value).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0088FE" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costs" fill="#FF8042" name="Total Costs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#00C49F" name="Net Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Profit Trend Tab */}
            <TabsContent value="profit" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Monitor net profit trends after deducting all operational costs
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyProfitData}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Net Profit']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#00C49F"
                    strokeWidth={3}
                    dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Daily Net Profit (€)"
                    fill="url(#profitGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Cost Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Visualize how revenue is distributed between costs and profit
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={costComposition}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry) => `${entry.name}: €${entry.value.toFixed(0)} (${((entry.value / revenueData.totalRevenue) * 100).toFixed(1)}%)`}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `€${Number(value).toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
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
          <CardDescription>Revenue, costs, and profitability by boat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold">Boat</th>
                  <th className="text-right py-2 px-2 font-semibold">Bookings</th>
                  <th className="text-right py-2 px-2 font-semibold">Revenue</th>
                  <th className="text-right py-2 px-2 font-semibold">Captain</th>
                  <th className="text-right py-2 px-2 font-semibold">Sailor</th>
                  <th className="text-right py-2 px-2 font-semibold">Commission</th>
                  <th className="text-right py-2 px-2 font-semibold">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {boatStats.map((boat, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{boat.name}</td>
                    <td className="text-right py-2 px-2 text-muted-foreground">{boat.count}</td>
                    <td className="text-right py-2 px-2">€{boat.revenue.toFixed(2)}</td>
                    <td className="text-right py-2 px-2 text-orange-600">€{boat.captainCosts.toFixed(2)}</td>
                    <td className="text-right py-2 px-2 text-purple-600">€{boat.sailorCosts.toFixed(2)}</td>
                    <td className="text-right py-2 px-2 text-blue-600">€{boat.commissions.toFixed(2)}</td>
                    <td className="text-right py-2 px-2 font-bold text-green-600">€{boat.netProfit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

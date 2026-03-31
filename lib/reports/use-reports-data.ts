'use client'

import { useState, useMemo } from 'react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export type Booking = {
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
  instructor_id?: string
  fuel_cost?: number
  package_addon_cost?: number
  booking_category?: string
  discount_percentage?: number
}

export type FleetExpense = {
  id: string
  amount: number
  boat_id: string
  expense_date: string
  category: string
}

export type MaintenanceLog = {
  id: string
  actual_cost: number | null
  boat_id: string
  completed_date: string | null
}

export type ReportsClientProps = {
  bookings: Booking[]
  fleetExpenses?: FleetExpense[]
  maintenanceLogs?: MaintenanceLog[]
}

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export const PRESET_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
]

export function useReportsData(bookings: Booking[], fleetExpenses: FleetExpense[] = [], maintenanceLogs: MaintenanceLog[] = []) {
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

    // Booking-related cost breakdown
    const totalCaptainCosts = confirmed.reduce((sum, b) => sum + (b.captain_fee || 0), 0)
    const totalSailorCosts = confirmed.reduce((sum, b) => sum + (b.sailor_fee || 0), 0)
    const totalFuelCosts = confirmed.reduce((sum, b) => sum + (b.fuel_cost || 0), 0)
    const totalPackageAddonCosts = confirmed.reduce((sum, b) => sum + (b.package_addon_cost || 0), 0)
    const totalCommissions = confirmed.reduce((sum, b) => {
      if (!b.agents || !b.agent_id) return sum
      return sum + (b.total_price * b.agents.commission_percentage) / 100
    }, 0)

    // Fleet operational costs (maintenance + expenses)
    const filteredExpenses = fleetExpenses.filter(e => {
      const expenseDate = new Date(e.expense_date)
      return expenseDate >= dateFrom && expenseDate <= dateTo
    })
    const totalFleetExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

    const filteredMaintenance = maintenanceLogs.filter(m => {
      if (!m.completed_date) return false
      const completedDate = new Date(m.completed_date)
      return completedDate >= dateFrom && completedDate <= dateTo
    })
    const totalMaintenanceCosts = filteredMaintenance.reduce((sum, m) => sum + (m.actual_cost || 0), 0)

    const totalOperationalCosts = totalFleetExpenses + totalMaintenanceCosts
    const totalCosts = totalCaptainCosts + totalSailorCosts + totalFuelCosts + totalPackageAddonCosts + totalCommissions + totalOperationalCosts

    // Profit analysis
    const netProfit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      avgBookingValue,
      confirmedCount: confirmed.length,
      totalCaptainCosts,
      totalSailorCosts,
      totalFuelCosts,
      totalPackageAddonCosts,
      totalCommissions,
      totalFleetExpenses,
      totalMaintenanceCosts,
      totalOperationalCosts,
      totalCosts,
      netProfit,
      profitMargin
    }
  }, [filteredBookings, fleetExpenses, maintenanceLogs, dateFrom, dateTo])

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
    const dailyMap = new Map<string, { date: string; revenue: number; profit: number; margin: number }>()

    filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const date = b.booking_date
        const existing = dailyMap.get(date) || { date, revenue: 0, profit: 0, margin: 0 }

        const captainCost = b.captain_fee || 0
        const sailorCost = b.sailor_fee || 0
        const fuelCost = b.fuel_cost || 0
        const addonCost = b.package_addon_cost || 0
        const commission = b.agents ? (b.total_price * b.agents.commission_percentage) / 100 : 0
        const totalCosts = captainCost + sailorCost + fuelCost + addonCost + commission
        const profit = b.total_price - totalCosts

        existing.revenue += b.total_price
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
      fuelCosts: number
      addonCosts: number
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
        fuelCosts: 0,
        addonCosts: 0,
        commissions: 0,
        netProfit: 0
      }

      // Only count confirmed or completed bookings (exclude cancelled)
      if (b.status === 'confirmed' || b.status === 'completed') {
        existing.count++

        const captainCost = b.captain_fee || 0
        const sailorCost = b.sailor_fee || 0
        const fuelCost = b.fuel_cost || 0
        const addonCost = b.package_addon_cost || 0
        const commissionPercent = b.agents?.commission_percentage || 0
        const commission = b.total_price * (commissionPercent / 100)
        const totalCosts = captainCost + sailorCost + fuelCost + addonCost + commission
        const netProfit = b.total_price - totalCosts

        existing.revenue += b.total_price
        existing.captainCosts += captainCost
        existing.sailorCosts += sailorCost
        existing.fuelCosts += fuelCost
        existing.addonCosts += addonCost
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

      // Only count confirmed or completed bookings (exclude cancelled)
      if (b.status === 'confirmed' || b.status === 'completed') {
        const key = b.agent_id
        const name = `${b.agents.first_name} ${b.agents.last_name}`
        const existing = agentMap.get(key) || { name, count: 0, revenue: 0, commission: 0 }
        existing.count++
        existing.revenue += b.total_price
        existing.commission += (b.total_price * b.agents.commission_percentage) / 100
        agentMap.set(key, existing)
      }
    })

    return Array.from(agentMap.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings])

  // Booking statistics by package
  const packageStats = useMemo(() => {
    const packageMap = new Map<string, { count: number; revenue: number }>()
    filteredBookings.forEach(b => {
      // Only count confirmed or completed bookings (exclude cancelled)
      if (b.status === 'confirmed' || b.status === 'completed') {
        const existing = packageMap.get(b.package_type) || { count: 0, revenue: 0 }
        existing.count++
        existing.revenue += b.total_price
        packageMap.set(b.package_type, existing)
      }
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

  // Revenue by booking category
  const revenueByBookingCategory = useMemo(() => {
    const categoryMap = new Map<string, { revenue: number; count: number }>()

    filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const category = b.booking_category || 'commercial'
        const existing = categoryMap.get(category) || { revenue: 0, count: 0 }
        existing.revenue += b.total_price
        existing.count++
        categoryMap.set(category, existing)
      })

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      revenue: data.revenue,
      count: data.count
    })).sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings])

  // Fuel cost analysis
  const fuelCostAnalysis = useMemo(() => {
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
    const bookingsWithFuel = confirmed.filter(b => (b.fuel_cost || 0) > 0)
    const totalFuelCost = confirmed.reduce((sum, b) => sum + (b.fuel_cost || 0), 0)
    const avgFuelPerBooking = bookingsWithFuel.length > 0 ? totalFuelCost / bookingsWithFuel.length : 0

    // Fuel costs by boat type
    const boatTypeMap = new Map<string, { fuelCost: number; count: number }>()
    confirmed.forEach(b => {
      if (b.boats && (b.fuel_cost || 0) > 0) {
        const boatType = b.boats.boat_type
        const existing = boatTypeMap.get(boatType) || { fuelCost: 0, count: 0 }
        existing.fuelCost += b.fuel_cost || 0
        existing.count++
        boatTypeMap.set(boatType, existing)
      }
    })

    const fuelByBoatType = Array.from(boatTypeMap.entries()).map(([type, data]) => ({
      boatType: type,
      totalFuelCost: data.fuelCost,
      avgFuelCost: data.count > 0 ? data.fuelCost / data.count : 0,
      count: data.count
    }))

    return {
      totalFuelCost,
      avgFuelPerBooking,
      bookingsWithFuelCount: bookingsWithFuel.length,
      fuelByBoatType
    }
  }, [filteredBookings])

  // Profitability by booking category
  const profitabilityByCategory = useMemo(() => {
    const categoryMap = new Map<string, { revenue: number; costs: number; count: number }>()

    filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const category = b.booking_category || 'commercial'
        const existing = categoryMap.get(category) || { revenue: 0, costs: 0, count: 0 }

        const captainCost = b.captain_fee || 0
        const sailorCost = b.sailor_fee || 0
        const fuelCost = b.fuel_cost || 0
        const addonCost = b.package_addon_cost || 0
        const commission = b.agents ? (b.total_price * b.agents.commission_percentage) / 100 : 0
        const totalCosts = captainCost + sailorCost + fuelCost + addonCost + commission

        existing.revenue += b.total_price
        existing.costs += totalCosts
        existing.count++
        categoryMap.set(category, existing)
      })

    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const profit = data.revenue - data.costs
      const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0
      return {
        name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        revenue: data.revenue,
        costs: data.costs,
        profit,
        margin,
        count: data.count
      }
    }).sort((a, b) => b.profit - a.profit)
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
    if (revenueData.totalFuelCosts > 0) {
      data.push({ name: 'Fuel Costs', value: revenueData.totalFuelCosts, color: '#FB923C' })
    }
    if (revenueData.totalPackageAddonCosts > 0) {
      data.push({ name: 'Package Addon Costs', value: revenueData.totalPackageAddonCosts, color: '#A855F7' })
    }
    if (revenueData.totalCommissions > 0) {
      data.push({ name: 'Agent Commissions', value: revenueData.totalCommissions, color: '#00C49F' })
    }
    if (revenueData.totalMaintenanceCosts > 0) {
      data.push({ name: 'Maintenance Costs', value: revenueData.totalMaintenanceCosts, color: '#EC4899' })
    }
    if (revenueData.totalFleetExpenses > 0) {
      data.push({ name: 'Fleet Expenses', value: revenueData.totalFleetExpenses, color: '#F97316' })
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
        const fuelCost = b.fuel_cost || 0
        const addonCost = b.package_addon_cost || 0
        const commission = b.agents ? (b.total_price * b.agents.commission_percentage) / 100 : 0
        existing.costs += captainCost + sailorCost + fuelCost + addonCost + commission
        existing.profit += b.total_price - captainCost - sailorCost - fuelCost - addonCost - commission

        dailyMap.set(date, existing)
      })

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredBookings])

  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      // Comprehensive CSV export with all cost details
      const headers = [
        'Date', 'Boat', 'Agent', 'Agent Commission %', 'Package', 'Booking Category', 'Status',
        'Revenue', 'Captain Cost', 'Sailor Cost', 'Fuel Cost', 'Package Addon Cost', 'Commission Cost', 'Total Costs', 'Net Profit', 'Profit Margin %'
      ]

      const rows = filteredBookings.map(b => {
        const captainCost = b.captain_fee || 0
        const sailorCost = b.sailor_fee || 0
        const fuelCost = b.fuel_cost || 0
        const addonCost = b.package_addon_cost || 0
        const commissionPercent = b.agents?.commission_percentage || 0
        const commissionCost = b.total_price * (commissionPercent / 100)
        const totalCosts = captainCost + sailorCost + fuelCost + addonCost + commissionCost
        const netProfit = b.total_price - totalCosts
        const profitMargin = b.total_price > 0 ? (netProfit / b.total_price) * 100 : 0

        return [
          b.booking_date,
          b.boats?.name || 'N/A',
          b.agents ? `${b.agents.first_name} ${b.agents.last_name}` : 'N/A',
          commissionPercent.toFixed(0) + '%',
          b.package_type,
          b.booking_category || 'commercial',
          b.status,
          b.total_price.toFixed(2),
          captainCost.toFixed(2),
          sailorCost.toFixed(2),
          fuelCost.toFixed(2),
          addonCost.toFixed(2),
          commissionCost.toFixed(2),
          totalCosts.toFixed(2),
          netProfit.toFixed(2),
          profitMargin.toFixed(1) + '%',
        ]
      })

      // Add summary row
      rows.push([])
      rows.push(['SUMMARY', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
      rows.push([
        'Total Revenue',
        '',
        '',
        '',
        '',
        '',
        '',
        revenueData.totalRevenue.toFixed(2),
        revenueData.totalCaptainCosts.toFixed(2),
        revenueData.totalSailorCosts.toFixed(2),
        revenueData.totalFuelCosts.toFixed(2),
        revenueData.totalPackageAddonCosts.toFixed(2),
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

  return {
    dateFrom, dateTo, setDateFrom, setDateTo,
    applyPresetRange, handleExport,
    filteredBookings,
    revenueData, dailyRevenueData, dailyProfitData,
    boatStats, agentStats, packageStats,
    occupancyData, statusBreakdown,
    revenueByBookingCategory, fuelCostAnalysis,
    profitabilityByCategory, costComposition, revenueCostsTrend,
    PRESET_RANGES, COLORS,
  }
}

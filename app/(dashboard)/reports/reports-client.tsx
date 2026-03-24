'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import {
  Download,
  Ship,
  Users,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useReportsData, type ReportsClientProps } from '@/lib/reports/use-reports-data'
import SummaryStats from '@/app/components/reports/summary-stats'

const TrendCharts = dynamic(() => import('@/app/components/reports/trend-charts'), {
  loading: () => <div className="h-[420px] flex items-center justify-center text-sm text-muted-foreground">Loading charts...</div>,
})

const AnalyticsCharts = dynamic(() => import('@/app/components/reports/analytics-charts'), {
  loading: () => <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Loading charts...</div>,
})

export default function ReportsClient({ bookings }: ReportsClientProps) {
  const {
    dateFrom, dateTo, setDateFrom, setDateTo,
    applyPresetRange, handleExport,
    filteredBookings,
    revenueData, dailyRevenueData, dailyProfitData,
    boatStats, agentStats, packageStats,
    occupancyData, statusBreakdown,
    revenueByBookingCategory, fuelCostAnalysis,
    profitabilityByCategory, costComposition, revenueCostsTrend,
    PRESET_RANGES, COLORS,
  } = useReportsData(bookings)

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
      <SummaryStats
        revenueData={revenueData}
        filteredBookingsCount={filteredBookings.length}
        agentStats={agentStats}
      />

      {/* Financial Analytics - Tabbed Charts */}
      <TrendCharts
        dailyRevenueData={dailyRevenueData}
        revenueCostsTrend={revenueCostsTrend}
        dailyProfitData={dailyProfitData}
        costComposition={costComposition}
        totalRevenue={revenueData.totalRevenue}
      />

      <AnalyticsCharts
        revenueByBookingCategory={revenueByBookingCategory}
        statusBreakdown={statusBreakdown}
        packageStats={packageStats}
        COLORS={COLORS}
      />

      {/* Fuel Cost Analysis */}
      {fuelCostAnalysis.totalFuelCost > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fuel Cost Summary</CardTitle>
            <CardDescription>Analysis of fuel costs across bookings and boat types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <p className="text-sm font-medium text-muted-foreground">Total Fuel Costs</p>
                <p className="text-2xl font-bold text-orange-600">€{fuelCostAnalysis.totalFuelCost.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <p className="text-sm font-medium text-muted-foreground">Average per Booking</p>
                <p className="text-2xl font-bold text-orange-600">€{fuelCostAnalysis.avgFuelPerBooking.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <p className="text-sm font-medium text-muted-foreground">Bookings with Fuel</p>
                <p className="text-2xl font-bold text-orange-600">{fuelCostAnalysis.bookingsWithFuelCount}</p>
              </div>
            </div>

            {fuelCostAnalysis.fuelByBoatType.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Fuel Costs by Boat Type</h4>
                <div className="space-y-2">
                  {fuelCostAnalysis.fuelByBoatType.map((boat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{boat.boatType}</p>
                        <p className="text-sm text-muted-foreground">{boat.count} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">€{boat.totalFuelCost.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Avg: €{boat.avgFuelCost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profitability by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability by Booking Category</CardTitle>
          <CardDescription>Profit margins and net profit for each booking category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profitabilityByCategory.map((cat, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{cat.name}</h4>
                  <span className="text-sm text-muted-foreground">{cat.count} bookings</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">€{cat.revenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Costs</p>
                    <p className="text-lg font-bold text-red-600">€{cat.costs.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Profit</p>
                    <p className="text-lg font-bold text-green-600">€{cat.profit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit Margin</p>
                    <p className="text-lg font-bold text-blue-600">{cat.margin.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(0, Math.min(cat.margin, 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operational Costs Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Costs Detail</CardTitle>
          <CardDescription>Detailed breakdown of all operational expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {revenueData.totalCaptainCosts > 0 && (
              <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                <p className="text-xs font-medium text-muted-foreground">Captain Costs</p>
                <p className="text-xl font-bold text-red-600">€{revenueData.totalCaptainCosts.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((revenueData.totalCaptainCosts / revenueData.totalCosts) * 100).toFixed(1)}% of costs
                </p>
              </div>
            )}
            {revenueData.totalSailorCosts > 0 && (
              <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <p className="text-xs font-medium text-muted-foreground">Sailor Costs</p>
                <p className="text-xl font-bold text-purple-600">€{revenueData.totalSailorCosts.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((revenueData.totalSailorCosts / revenueData.totalCosts) * 100).toFixed(1)}% of costs
                </p>
              </div>
            )}
            {revenueData.totalFuelCosts > 0 && (
              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <p className="text-xs font-medium text-muted-foreground">Fuel Costs</p>
                <p className="text-xl font-bold text-orange-600">€{revenueData.totalFuelCosts.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((revenueData.totalFuelCosts / revenueData.totalCosts) * 100).toFixed(1)}% of costs
                </p>
              </div>
            )}
            {revenueData.totalPackageAddonCosts > 0 && (
              <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <p className="text-xs font-medium text-muted-foreground">Package Addon Costs</p>
                <p className="text-xl font-bold text-purple-600">€{revenueData.totalPackageAddonCosts.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((revenueData.totalPackageAddonCosts / revenueData.totalCosts) * 100).toFixed(1)}% of costs
                </p>
              </div>
            )}
            {revenueData.totalCommissions > 0 && (
              <div className="p-4 border rounded-lg bg-teal-50 dark:bg-teal-950/20">
                <p className="text-xs font-medium text-muted-foreground">Agent Commissions</p>
                <p className="text-xl font-bold text-teal-600">€{revenueData.totalCommissions.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((revenueData.totalCommissions / revenueData.totalCosts) * 100).toFixed(1)}% of costs
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  <th className="text-right py-2 px-2 font-semibold text-orange-600">Captain</th>
                  <th className="text-right py-2 px-2 font-semibold text-purple-600">Sailor</th>
                  <th className="text-right py-2 px-2 font-semibold text-orange-600">Fuel</th>
                  <th className="text-right py-2 px-2 font-semibold text-purple-600">Addon</th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-600">Commission</th>
                  <th className="text-right py-2 px-2 font-semibold text-green-600">Net Profit</th>
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
                    <td className="text-right py-2 px-2 text-orange-600">€{boat.fuelCosts.toFixed(2)}</td>
                    <td className="text-right py-2 px-2 text-purple-600">€{boat.addonCosts.toFixed(2)}</td>
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

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar as CalendarIcon,
  Ship,
  Package,
  Award,
} from 'lucide-react'
import { useReportsData } from '@/lib/reports/use-reports-data'

type SummaryStatsProps = {
  revenueData: ReturnType<typeof useReportsData>['revenueData']
  filteredBookingsCount: number
  agentStats: ReturnType<typeof useReportsData>['agentStats']
}

export default function SummaryStats({ revenueData, filteredBookingsCount, agentStats }: SummaryStatsProps) {
  return (
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
          <p className="text-3xl font-bold">{filteredBookingsCount}</p>
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
  )
}

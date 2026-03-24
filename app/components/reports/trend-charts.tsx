'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { useReportsData } from '@/lib/reports/use-reports-data'

type TrendChartsProps = {
  dailyRevenueData: ReturnType<typeof useReportsData>['dailyRevenueData']
  revenueCostsTrend: ReturnType<typeof useReportsData>['revenueCostsTrend']
  dailyProfitData: ReturnType<typeof useReportsData>['dailyProfitData']
  costComposition: ReturnType<typeof useReportsData>['costComposition']
  totalRevenue: number
}

export default function TrendCharts({
  dailyRevenueData,
  revenueCostsTrend,
  dailyProfitData,
  costComposition,
  totalRevenue,
}: TrendChartsProps) {
  return (
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
                  label={(entry) => `${entry.name}: €${entry.value.toFixed(0)} (${((entry.value / totalRevenue) * 100).toFixed(1)}%)`}
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
  )
}

'use client'

import {
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type AnalyticsChartsProps = {
  revenueByBookingCategory: Array<{ name: string; revenue: number; count: number }>
  statusBreakdown: Array<{ name: string; value: number }>
  packageStats: Array<{ name: string; count: number; revenue: number }>
  COLORS: string[]
}

export default function AnalyticsCharts({
  revenueByBookingCategory,
  statusBreakdown,
  packageStats,
  COLORS,
}: AnalyticsChartsProps) {
  return (
    <>
      {/* Revenue by Booking Category */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Booking Category</CardTitle>
          <CardDescription>Revenue breakdown across commercial, internal use, and bare boat charters</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByBookingCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
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
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {revenueByBookingCategory.map((cat, idx) => (
              <div key={idx} className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">{cat.name}</p>
                <p className="text-xl font-bold text-blue-600">€{cat.revenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{cat.count} bookings</p>
              </div>
            ))}
          </div>
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
    </>
  )
}

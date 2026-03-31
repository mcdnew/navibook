/**
 * GET /api/fleet/kpi?month=YYYY-MM
 * Returns per-boat fleet KPIs + P&L for the company.
 * Joins booking revenue with fleet costs (maintenance + fuel + expenses).
 */

import { NextResponse } from 'next/server'
import { requireFleetAccess } from '../_helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase, companyId } = ctx
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // YYYY-MM, optional — defaults to current month

  const targetMonth = month ?? new Date().toISOString().slice(0, 7)
  const startDate = `${targetMonth}-01`
  // End of month
  const [year, mon] = targetMonth.split('-').map(Number)
  const endDate = new Date(year, mon, 0).toISOString().split('T')[0]

  // Revenue: completed bookings in this month
  const { data: revenueRows } = await supabase
    .from('bookings')
    .select('boat_id, total_price')
    .eq('company_id', companyId)
    .eq('status', 'completed')
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)

  // Fuel costs
  const { data: fuelRows } = await supabase
    .from('fuel_logs')
    .select('boat_id, total_cost, liters, engine_hours_at_entry')
    .eq('company_id', companyId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)

  // Maintenance costs (actual_cost on completed records in this month)
  const { data: maintenanceRows } = await supabase
    .from('maintenance_logs')
    .select('boat_id, actual_cost, parts_cost, labor_cost')
    .eq('company_id', companyId)
    .eq('status', 'completed')
    .gte('completed_date', startDate)
    .lte('completed_date', endDate)

  // Fleet expenses
  const { data: expenseRows } = await supabase
    .from('fleet_expenses')
    .select('boat_id, amount')
    .eq('company_id', companyId)
    .eq('status', 'approved')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)

  // Boats for this company
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, current_engine_hours, engine_hours_alert_threshold')
    .eq('company_id', companyId)
    .eq('is_active', true)

  if (!boats) {
    return NextResponse.json({ month: targetMonth, boats: [] })
  }

  // Aggregate per boat
  const kpi = boats.map((boat) => {
    const revenue = (revenueRows ?? [])
      .filter((r) => r.boat_id === boat.id)
      .reduce((sum, r) => sum + (r.total_price ?? 0), 0)

    const fuelCost = (fuelRows ?? [])
      .filter((r) => r.boat_id === boat.id)
      .reduce((sum, r) => sum + (r.total_cost ?? 0), 0)

    const fuelLiters = (fuelRows ?? [])
      .filter((r) => r.boat_id === boat.id)
      .reduce((sum, r) => sum + (r.liters ?? 0), 0)

    const maintenanceCost = (maintenanceRows ?? [])
      .filter((r) => r.boat_id === boat.id)
      .reduce((sum, r) => sum + (r.actual_cost ?? 0), 0)

    const expenseCost = (expenseRows ?? [])
      .filter((r) => r.boat_id === boat.id)
      .reduce((sum, r) => sum + (r.amount ?? 0), 0)

    const totalCost = fuelCost + maintenanceCost + expenseCost
    const netPL = revenue - totalCost

    return {
      boatId: boat.id,
      boatName: boat.name,
      currentEngineHours: boat.current_engine_hours,
      engineHoursAlertThreshold: boat.engine_hours_alert_threshold,
      revenue: Math.round(revenue * 100) / 100,
      fuelCost: Math.round(fuelCost * 100) / 100,
      fuelLiters: Math.round(fuelLiters * 100) / 100,
      maintenanceCost: Math.round(maintenanceCost * 100) / 100,
      expenseCost: Math.round(expenseCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      netPL: Math.round(netPL * 100) / 100,
    }
  })

  const totals = kpi.reduce(
    (acc, b) => ({
      revenue: acc.revenue + b.revenue,
      totalCost: acc.totalCost + b.totalCost,
      netPL: acc.netPL + b.netPL,
    }),
    { revenue: 0, totalCost: 0, netPL: 0 }
  )

  return NextResponse.json({
    month: targetMonth,
    boats: kpi,
    totals: {
      revenue: Math.round(totals.revenue * 100) / 100,
      totalCost: Math.round(totals.totalCost * 100) / 100,
      netPL: Math.round(totals.netPL * 100) / 100,
    },
  })
}

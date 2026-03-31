/**
 * GET  /api/fleet/fuel-logs?boat_id=&start_date=&end_date=
 * POST /api/fleet/fuel-logs  — create fuel log, updates boats.current_engine_hours via trigger
 */

import { NextResponse } from 'next/server'
import { requireFleetAccess } from '../_helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase } = ctx
  const { searchParams } = new URL(request.url)
  const boatId = searchParams.get('boat_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  if (!boatId) {
    return NextResponse.json({ error: 'boat_id is required' }, { status: 400 })
  }

  let query = supabase
    .from('fuel_logs')
    .select('*')
    .eq('boat_id', boatId)
    .order('log_date', { ascending: false })

  if (startDate) query = query.gte('log_date', startDate)
  if (endDate) query = query.lte('log_date', endDate)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase, userId, companyId } = ctx
  const { boatId, liters, totalCost, engineHoursAtEntry, logDate, notes, receiptUrl } =
    await request.json()

  if (!boatId || liters == null || totalCost == null || !logDate) {
    return NextResponse.json(
      { error: 'boatId, liters, totalCost, and logDate are required' },
      { status: 400 }
    )
  }

  if (liters <= 0) {
    return NextResponse.json({ error: 'liters must be greater than 0' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('fuel_logs')
    .insert({
      company_id: companyId,
      boat_id: boatId,
      created_by_user_id: userId,
      liters,
      total_cost: totalCost,
      engine_hours_at_entry: engineHoursAtEntry || null,
      log_date: logDate,
      notes: notes || null,
      receipt_url: receiptUrl || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, fuelLog: data }, { status: 201 })
}

/**
 * GET /api/fleet/maintenance
 * List maintenance logs for a boat.
 * Query params: boat_id (required), status?, category?, start_date?, end_date?
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
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  if (!boatId) {
    return NextResponse.json({ error: 'boat_id is required' }, { status: 400 })
  }

  let query = supabase
    .from('maintenance_logs')
    .select('*')
    .eq('boat_id', boatId)
    .order('scheduled_date', { ascending: false })

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (startDate) query = query.gte('scheduled_date', startDate)
  if (endDate) query = query.lte('scheduled_date', endDate)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

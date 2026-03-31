/**
 * GET  /api/fleet/safety-equipment?boat_id=&status=
 * POST /api/fleet/safety-equipment
 * DELETE /api/fleet/safety-equipment?id=
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

  if (!boatId) {
    return NextResponse.json({ error: 'boat_id is required' }, { status: 400 })
  }

  let query = supabase
    .from('safety_equipment')
    .select('*')
    .eq('boat_id', boatId)
    .order('name')

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase, userId, companyId } = ctx
  const { boatId, name, category, quantity, expiryDate, lastChecked, nextService, serialNumber, notes } =
    await request.json()

  if (!boatId || !name || !category) {
    return NextResponse.json({ error: 'boatId, name, and category are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('safety_equipment')
    .insert({
      company_id: companyId,
      boat_id: boatId,
      added_by_user_id: userId,
      name: name.trim(),
      category,
      quantity: quantity ?? 1,
      expiry_date: expiryDate || null,
      last_checked: lastChecked || null,
      next_service: nextService || null,
      serial_number: serialNumber || null,
      notes: notes || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, equipment: data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase } = ctx
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('safety_equipment').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

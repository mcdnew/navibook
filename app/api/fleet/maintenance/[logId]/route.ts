/**
 * GET  /api/fleet/maintenance/[logId]  — single maintenance record
 * PATCH /api/fleet/maintenance/[logId] — update (status, fields)
 * DELETE /api/fleet/maintenance/[logId] — delete (trigger removes blocked_slot)
 */

import { NextResponse } from 'next/server'
import { requireFleetAccess } from '../../_helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: Request,
  { params }: { params: { logId: string } }
) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase } = ctx
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('id', params.logId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: { logId: string } }
) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase } = ctx
  const body = await request.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const allowed = [
    'title', 'description', 'type', 'category', 'maintenance_type', 'priority',
    'status', 'scheduled_date', 'estimated_end_date', 'completed_date',
    'estimated_cost', 'actual_cost', 'parts_cost', 'labor_cost',
    'vendor_name', 'vendor_contact', 'engine_hours_at_service',
    'next_service_date', 'notes', 'completion_notes',
    'before_photos', 'after_photos', 'assigned_to_user_id',
  ]

  for (const key of allowed) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    if (body[key] !== undefined) updates[snakeKey] = body[key]
    if (body[snakeKey] !== undefined) updates[snakeKey] = body[snakeKey]
  }

  // Auto-set completed_date when status → completed
  if (updates.status === 'completed' && !updates.completed_date) {
    updates.completed_date = new Date().toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('maintenance_logs')
    .update(updates)
    .eq('id', params.logId)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const record = data?.[0]
  if (!record) {
    return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, maintenance: record })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { logId: string } }
) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase } = ctx

  const { error } = await supabase
    .from('maintenance_logs')
    .delete()
    .eq('id', params.logId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // DB trigger (trg_sync_maintenance_blocked_slot) auto-removes the blocked_slot on DELETE
  return NextResponse.json({ success: true })
}

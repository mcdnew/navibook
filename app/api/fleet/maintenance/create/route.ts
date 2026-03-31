/**
 * POST /api/fleet/maintenance/create
 * Create a new maintenance log. Automatically creates a blocked_slot
 * for the scheduled date range via DB trigger.
 */

import { NextResponse } from 'next/server'
import { requireFleetAccess } from '../../_helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase, userId, companyId } = ctx

  const body = await request.json()
  const {
    boatId,
    title,
    description,
    type,
    category,
    maintenanceType,
    priority,
    scheduledDate,
    estimatedEndDate,
    estimatedCost,
    vendorName,
    vendorContact,
    engineHoursAtService,
    nextServiceDate,
    notes,
  } = body

  if (!boatId || !title || !type) {
    return NextResponse.json(
      { error: 'boatId, title, and type are required' },
      { status: 400 }
    )
  }

  const validTypes = ['routine', 'repair', 'upgrade', 'inspection', 'winterization']
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('maintenance_logs')
    .insert({
      company_id: companyId,
      boat_id: boatId,
      created_by_user_id: userId,
      title: title.trim(),
      description: description || null,
      type,
      category: category || null,
      maintenance_type: maintenanceType || null,
      priority: priority || 'normal',
      status: 'scheduled',
      scheduled_date: scheduledDate || null,
      estimated_end_date: estimatedEndDate || null,
      estimated_cost: estimatedCost || null,
      vendor_name: vendorName || null,
      vendor_contact: vendorContact || null,
      engine_hours_at_service: engineHoursAtService || null,
      next_service_date: nextServiceDate || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, maintenance: data }, { status: 201 })
}

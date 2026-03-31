/**
 * GET   /api/fleet/settings  — returns fleet_module_enabled for current company
 * PATCH /api/fleet/settings  — enable or disable the fleet module (admin only)
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()
  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: company } = await supabase
    .from('companies')
    .select('fleet_module_enabled')
    .eq('id', userRecord.company_id)
    .single()

  return NextResponse.json({ fleet_module_enabled: company?.fleet_module_enabled ?? false })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()
  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Only admins can toggle the fleet module
  if (!['admin', 'company_admin', 'manager'].includes(userRecord.role)) {
    return NextResponse.json({ error: 'Only admins can change fleet module settings' }, { status: 403 })
  }

  const { fleet_module_enabled } = await request.json()
  if (typeof fleet_module_enabled !== 'boolean') {
    return NextResponse.json({ error: 'fleet_module_enabled must be a boolean' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('companies')
    .update({ fleet_module_enabled })
    .eq('id', userRecord.company_id)
    .select('fleet_module_enabled')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, fleet_module_enabled: data.fleet_module_enabled })
}

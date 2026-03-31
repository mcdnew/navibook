/**
 * Shared helpers for fleet module API routes.
 * Every fleet route calls requireFleetAccess() first — it handles auth,
 * company lookup, and fleet_module_enabled check in one shot.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface FleetContext {
  supabase: SupabaseClient
  userId: string
  companyId: string
}

/**
 * Returns a FleetContext or a NextResponse error.
 * Call pattern:
 *   const ctx = await requireFleetAccess()
 *   if (ctx instanceof NextResponse) return ctx
 */
export async function requireFleetAccess(): Promise<FleetContext | NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: company } = await supabase
    .from('companies')
    .select('fleet_module_enabled')
    .eq('id', userRecord.company_id)
    .single()

  if (!company?.fleet_module_enabled) {
    return NextResponse.json({ error: 'Fleet module is not enabled for this company' }, { status: 403 })
  }

  return {
    supabase,
    userId: user.id,
    companyId: userRecord.company_id,
  }
}

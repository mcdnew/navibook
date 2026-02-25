/**
 * Direct Supabase DB access (service role) for test setup and teardown.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') })

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** Get the company_id for the demo company */
export async function getDemoCompanyId(): Promise<string> {
  const { data, error } = await adminSupabase
    .from('companies')
    .select('id')
    .eq('name', 'Happy Sail Estepona')
    .single()
  if (error || !data) throw new Error('Demo company not found')
  return data.id
}

/** Get a user by email */
export async function getUserByEmail(email: string) {
  const { data, error } = await adminSupabase
    .from('users')
    .select('id, company_id, role')
    .eq('email', email)
    .single()
  if (error || !data) throw new Error(`User not found: ${email}`)
  return data
}

/** Get boats for the demo company */
export async function getDemoBoats() {
  const companyId = await getDemoCompanyId()
  const { data, error } = await adminSupabase
    .from('boats')
    .select('id, name, boat_type, capacity')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .limit(3)
  if (error) throw new Error(`Failed to get boats: ${error.message}`)
  return data ?? []
}

/** Get the first available boat */
export async function getFirstBoat() {
  const boats = await getDemoBoats()
  if (!boats.length) throw new Error('No boats found in demo company')
  return boats[0]
}

/** Get the first captain user */
export async function getFirstCaptain() {
  const companyId = await getDemoCompanyId()
  const { data, error } = await adminSupabase
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('company_id', companyId)
    .eq('role', 'captain')
    .eq('is_active', true)
    .single()
  if (error || !data) throw new Error('No captain found')
  return data
}

/** Delete records from a table where a column contains a prefix */
export async function deleteByNamePrefix(
  table: string,
  column: string,
  prefix: string
): Promise<void> {
  // For bookings: the DB has a trigger (log_booking_changes_trigger) that fires AFTER DELETE
  // and tries to INSERT into booking_history — but the booking is already gone, violating the FK.
  // Workaround: UPDATE status to 'cancelled' so they're excluded from the no_overlap constraint
  // (cancelled bookings don't block future tests). Skip hard-delete.
  if (table === 'bookings') {
    await adminSupabase
      .from(table)
      .update({ status: 'cancelled' })
      .like(column, `${prefix}%`)
    return
  }
  const { error } = await adminSupabase
    .from(table)
    .delete()
    .like(column, `${prefix}%`)
  if (error) {
    console.warn(`Cleanup warning [${table}.${column}]:`, error.message)
  }
}

/** Delete a specific record by id */
export async function deleteById(table: string, id: string): Promise<void> {
  await adminSupabase.from(table).delete().eq('id', id)
}

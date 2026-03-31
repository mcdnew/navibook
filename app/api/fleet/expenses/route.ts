/**
 * GET  /api/fleet/expenses?boat_id=&status=&start_date=&end_date=
 * POST /api/fleet/expenses
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
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  if (!boatId) {
    return NextResponse.json({ error: 'boat_id is required' }, { status: 400 })
  }

  let query = supabase
    .from('fleet_expenses')
    .select('*')
    .eq('boat_id', boatId)
    .order('expense_date', { ascending: false })

  if (status) query = query.eq('status', status)
  if (startDate) query = query.gte('expense_date', startDate)
  if (endDate) query = query.lte('expense_date', endDate)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase, userId, companyId } = ctx
  const { boatId, amount, category, description, expenseDate, receiptUrl, maintenanceId } =
    await request.json()

  if (!boatId || !amount || !category || !description || !expenseDate) {
    return NextResponse.json(
      { error: 'boatId, amount, category, description, and expenseDate are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('fleet_expenses')
    .insert({
      company_id: companyId,
      boat_id: boatId,
      created_by_user_id: userId,
      amount,
      category,
      description: description.trim(),
      expense_date: expenseDate,
      receipt_url: receiptUrl || null,
      maintenance_id: maintenanceId || null,
      status: 'approved',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, expense: data }, { status: 201 })
}

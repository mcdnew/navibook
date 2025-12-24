import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const boatId = searchParams.get('boatId')

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build query for multi-day blocking
    // Find all blocks that overlap with the requested date range
    let query = supabase
      .from('blocked_slots')
      .select('*, boats(id, name), users(first_name, last_name)')
      .eq('company_id', userData.company_id)

    // Date range overlap check:
    // Block overlaps if: block.start_date <= queryEndDate AND block.end_date >= queryStartDate
    if (startDate) {
      // Block must end on or after the query start date
      query = query.gte('end_date', startDate)
    }

    if (endDate) {
      // Block must start on or before the query end date
      query = query.lte('start_date', endDate)
    }

    if (boatId && boatId !== 'all') {
      query = query.or(`boat_id.eq.${boatId},boat_id.is.null`)
    }

    // Order by start date, then start time
    query = query.order('start_date', { ascending: true })
      .order('start_time', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('List blocked slots error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch blocked slots' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('List blocked slots API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

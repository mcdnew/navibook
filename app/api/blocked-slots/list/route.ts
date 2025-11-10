import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Build query
    let query = supabase
      .from('blocked_slots')
      .select('*, boats(id, name), users(first_name, last_name)')
      .eq('company_id', userData.company_id)

    if (startDate) {
      query = query.gte('blocked_date', startDate)
    }

    if (endDate) {
      query = query.lte('blocked_date', endDate)
    }

    if (boatId && boatId !== 'all') {
      query = query.or(`boat_id.eq.${boatId},boat_id.is.null`)
    }

    query = query.order('blocked_date', { ascending: true })
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

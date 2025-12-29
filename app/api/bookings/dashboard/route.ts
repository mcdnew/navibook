import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role to determine filtering
    const { data: userRecord } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

    // Build base query
    let query = supabase.from('bookings').select('*, boats(name)')

    // Apply role-based filtering
    const isAdminOrOffice = ['admin', 'office_staff', 'operations_manager'].includes(userRecord.role)
    if (!isAdminOrOffice) {
      // Agents can only see their own bookings
      query = query.eq('agent_id', user.id)
    } else {
      // Admin/Office can see all bookings in their company
      query = query.eq('company_id', userRecord.company_id)
    }

    // Fetch upcoming bookings (next 10 future bookings, exclude cancelled)
    const { data: upcoming } = await query
      .neq('status', 'cancelled')
      .gte('booking_date', today)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(10)

    // Fetch latest created bookings (exclude cancelled)
    let latestQuery = supabase.from('bookings').select('*, boats(name)')
    if (!isAdminOrOffice) {
      latestQuery = latestQuery.eq('agent_id', user.id)
    } else {
      latestQuery = latestQuery.eq('company_id', userRecord.company_id)
    }

    const { data: latest } = await latestQuery
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch today's charters
    let todayQuery = supabase.from('bookings').select('*, boats(name)')
    if (!isAdminOrOffice) {
      todayQuery = todayQuery.eq('agent_id', user.id)
    } else {
      todayQuery = todayQuery.eq('company_id', userRecord.company_id)
    }

    const { data: todaysData } = await todayQuery
      .eq('booking_date', today)
      .in('status', ['confirmed', 'pending_hold'])
      .order('start_time', { ascending: true })

    // Fetch urgent actions
    // 1. Pending holds expiring soon
    let expiringQuery = supabase.from('bookings').select('*, boats(name)')
    if (!isAdminOrOffice) {
      expiringQuery = expiringQuery.eq('agent_id', user.id)
    } else {
      expiringQuery = expiringQuery.eq('company_id', userRecord.company_id)
    }

    const { data: expiringHolds } = await expiringQuery
      .eq('status', 'pending_hold')
      .not('hold_until', 'is', null)
      .lte('hold_until', twoHoursFromNow)
      .order('hold_until', { ascending: true })

    // 2. Unconfirmed bookings within 24 hours
    let unconfirmedQuery = supabase.from('bookings').select('*, boats(name)')
    if (!isAdminOrOffice) {
      unconfirmedQuery = unconfirmedQuery.eq('agent_id', user.id)
    } else {
      unconfirmedQuery = unconfirmedQuery.eq('company_id', userRecord.company_id)
    }

    const { data: unconfirmed } = await unconfirmedQuery
      .eq('status', 'pending_hold')
      .gte('booking_date', today)
      .lte('booking_date', tomorrow)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })

    // Combine and deduplicate urgent items
    const urgentMap = new Map()
    ;[...(expiringHolds || []), ...(unconfirmed || [])].forEach(booking => {
      urgentMap.set(booking.id, booking)
    })

    return NextResponse.json({
      upcoming: upcoming || [],
      latest: latest || [],
      todaysData: todaysData || [],
      urgentActions: Array.from(urgentMap.values()),
    })
  } catch (error: any) {
    console.error('Dashboard bookings API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

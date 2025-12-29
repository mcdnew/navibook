import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const {
      boatId,
      startDate,
      endDate,
      startTime,
      endTime,
      reason,
      blockType = 'maintenance',
      // Support legacy single-day format
      blockedDate,
    } = await request.json()

    // Support both new multi-day and legacy single-day formats
    const actualStartDate = startDate || blockedDate
    const actualEndDate = endDate || blockedDate

    if (!actualStartDate || !actualEndDate || !startTime || !endTime || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: startDate, endDate, startTime, endTime, reason' },
        { status: 400 }
      )
    }

    // Validate date range
    if (actualEndDate < actualStartDate) {
      return NextResponse.json(
        { error: 'End date must be after or equal to start date' },
        { status: 400 }
      )
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      return NextResponse.json(
        { error: 'Time format must be HH:MM' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company_id and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has permission (admin, operations_manager, or sales_agent)
    if (!['admin', 'operations_manager', 'sales_agent'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Create blocked slot with multi-day support
    const { data, error } = await supabase
      .from('blocked_slots')
      .insert({
        company_id: userData.company_id,
        boat_id: boatId || null, // null means all boats
        blocked_date: actualStartDate, // Keep for backward compatibility
        start_date: actualStartDate,
        end_date: actualEndDate,
        start_time: startTime,
        end_time: endTime,
        reason,
        block_type: blockType,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Create blocked slot error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create blocked slot' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Blocked slot created successfully',
    })
  } catch (error: any) {
    console.error('Create blocked slot API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

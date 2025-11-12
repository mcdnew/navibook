import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      boatId,
      blockedDate,
      startTime,
      endTime,
      reason,
      blockType = 'maintenance',
    } = await request.json()

    if (!blockedDate || !startTime || !endTime || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if user has permission (admin, manager, or power_agent)
    if (!['admin', 'manager', 'power_agent'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Create blocked slot
    const { data, error } = await supabase
      .from('blocked_slots')
      .insert({
        company_id: userData.company_id,
        boat_id: boatId || null, // null means all boats
        blocked_date: blockedDate,
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

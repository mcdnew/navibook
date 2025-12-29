import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: Get sailors assigned to a booking
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
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

    // Get sailors assigned to this booking
    const { data: sailors, error } = await supabase
      .from('booking_sailors')
      .select(`
        id,
        sailor_id,
        hourly_rate,
        fee,
        created_at,
        sailor:users!booking_sailors_sailor_id_fkey(
          id,
          first_name,
          last_name,
          hourly_rate
        )
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Get booking sailors error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to get booking sailors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sailors,
    })
  } catch (error: any) {
    console.error('Get booking sailors API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Assign sailors to a booking (admin/manager/office only)
export async function POST(request: Request) {
  try {
    const { bookingId, sailors } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(sailors)) {
      return NextResponse.json(
        { error: 'Sailors must be an array' },
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

    // Get user's role
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permission: only admin/operations_manager/office_staff can assign sailors
    if (!['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json(
        { error: 'Only admin, operations manager, or office staff can assign sailors' },
        { status: 403 }
      )
    }

    // Verify booking exists and belongs to user's company
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, company_id')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.company_id !== userRecord.company_id) {
      return NextResponse.json(
        { error: 'Booking does not belong to your company' },
        { status: 403 }
      )
    }

    // Delete existing sailor assignments for this booking
    const { error: deleteError } = await supabase
      .from('booking_sailors')
      .delete()
      .eq('booking_id', bookingId)

    if (deleteError) {
      console.error('Delete existing sailors error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to update sailor assignments' },
        { status: 500 }
      )
    }

    // If no sailors to assign, just return success (booking has 0 sailors)
    if (sailors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All sailors removed from booking',
        data: [],
      })
    }

    // Validate and prepare sailor assignments
    const sailorAssignments = sailors.map((s: { sailorId: string; hourlyRate: number; fee: number }) => ({
      booking_id: bookingId,
      sailor_id: s.sailorId,
      hourly_rate: s.hourlyRate || 0,
      fee: s.fee || 0,
    }))

    // Insert new sailor assignments
    const { data: insertedSailors, error: insertError } = await supabase
      .from('booking_sailors')
      .insert(sailorAssignments)
      .select(`
        id,
        sailor_id,
        hourly_rate,
        fee,
        sailor:users!booking_sailors_sailor_id_fkey(
          id,
          first_name,
          last_name
        )
      `)

    if (insertError) {
      console.error('Insert sailors error:', insertError)
      return NextResponse.json(
        { error: insertError.message || 'Failed to assign sailors' },
        { status: 500 }
      )
    }

    // Note: The trigger will automatically update bookings.sailor_fee

    return NextResponse.json({
      success: true,
      message: `${sailors.length} sailor(s) assigned to booking`,
      data: insertedSailors,
    })
  } catch (error: any) {
    console.error('Assign sailors API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a specific sailor from a booking
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const sailorId = searchParams.get('sailorId')

    if (!bookingId || !sailorId) {
      return NextResponse.json(
        { error: 'Booking ID and Sailor ID are required' },
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

    // Get user's role
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permission
    if (!['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json(
        { error: 'Only admin, operations manager, or office staff can remove sailors' },
        { status: 403 }
      )
    }

    // Delete the sailor assignment
    const { error: deleteError } = await supabase
      .from('booking_sailors')
      .delete()
      .eq('booking_id', bookingId)
      .eq('sailor_id', sailorId)

    if (deleteError) {
      console.error('Delete sailor error:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Failed to remove sailor' },
        { status: 500 }
      )
    }

    // Note: The trigger will automatically update bookings.sailor_fee

    return NextResponse.json({
      success: true,
      message: 'Sailor removed from booking',
    })
  } catch (error: any) {
    console.error('Remove sailor API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

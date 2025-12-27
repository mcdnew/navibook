import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, oldSailors, newSailors } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, company_id')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify user belongs to the same company
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord || userRecord.company_id !== booking.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create history entry for sailor changes
    const oldSailorIds = oldSailors?.map((s: any) => s.sailorId) || []
    const newSailorIds = newSailors?.map((s: any) => s.sailorId) || []

    const { error: historyError } = await supabase
      .from('booking_history')
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        action: 'updated',
        old_data: {
          sailors: oldSailorIds,
          sailor_count: oldSailors?.length || 0,
        },
        new_data: {
          sailors: newSailorIds,
          sailor_count: newSailors?.length || 0,
        },
        notes: `Changed Sailors (${oldSailors?.length || 0} → ${newSailors?.length || 0})`,
      })

    if (historyError) {
      console.error('Error logging sailor history:', historyError)
      return NextResponse.json(
        { error: 'Failed to log history' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in sailor history API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

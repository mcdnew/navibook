import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { bookingId, newDate, newStartTime, newEndTime } = await request.json()

    // Validation
    if (!bookingId || !newDate || !newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: 'Booking ID, date, start time, and end time are required' },
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

    // Get the current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, boats(name, capacity)')
      .eq('id', bookingId)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if the boat is available at the new time
    const { data: availableBoats, error: availabilityError } = await supabase.rpc(
      'get_available_boats',
      {
        p_boat_type: null, // null means all boat types
        p_booking_date: newDate,
        p_company_id: currentBooking.company_id,
        p_end_time: newEndTime,
        p_min_capacity: currentBooking.passengers,
        p_start_time: newStartTime,
      }
    )

    if (availabilityError) {
      console.error('Availability check error:', availabilityError)
      return NextResponse.json(
        { error: 'Failed to check boat availability' },
        { status: 500 }
      )
    }

    // Check if the boat is in the available list
    const isBoatAvailable = availableBoats?.some(
      (boat: any) => boat.boat_id === currentBooking.boat_id
    )

    if (!isBoatAvailable) {
      return NextResponse.json(
        {
          error: `${currentBooking.boats?.name} is not available at the selected time. Please choose a different time or boat.`,
        },
        { status: 409 }
      )
    }

    // Update the booking with new date and times
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) {
      console.error('Update booking error:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to reschedule booking' },
        { status: 500 }
      )
    }

    // Log the reschedule in booking history
    const { error: historyError } = await supabase.from('booking_history').insert({
      booking_id: bookingId,
      user_id: user.id,
      action: 'rescheduled',
      old_data: {
        booking_date: currentBooking.booking_date,
        start_time: currentBooking.start_time,
        end_time: currentBooking.end_time,
      },
      new_data: {
        booking_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
      },
    })

    if (historyError) {
      console.error('History log error:', historyError)
      // Don't fail the request if history logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking: updatedBooking,
    })
  } catch (error: any) {
    console.error('Reschedule booking API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

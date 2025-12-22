import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { bookingId, depositPaid } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call the confirm_booking database function
    const { data, error } = await supabase
      .rpc('confirm_booking', {
        p_booking_id: bookingId,
        p_deposit_paid: depositPaid || false,
      })

    if (error) {
      console.error('Confirm booking error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to confirm booking' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Booking not found or already confirmed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
    })
  } catch (error: any) {
    console.error('Confirm booking API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

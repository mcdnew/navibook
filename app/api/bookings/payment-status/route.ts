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

    if (typeof depositPaid !== 'boolean') {
      return NextResponse.json(
        { error: 'Deposit paid status must be a boolean' },
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

    // Update booking payment status
    const { data, error } = await supabase
      .from('bookings')
      .update({ deposit_paid: depositPaid })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Update payment status error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update payment status' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      booking: data,
    })
  } catch (error: any) {
    console.error('Payment status API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

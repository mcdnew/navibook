import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createPaymentLink } from '@/lib/stripe/stripe-service'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { bookingId, paymentType } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get booking details
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        boats(name)
      `)
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.company_id !== userRecord.company_id) {
      return NextResponse.json(
        { error: 'You can only create payment links for bookings in your company' },
        { status: 403 }
      )
    }

    // Calculate payment amount based on type
    let amount: number
    let description: string

    if (paymentType === 'deposit') {
      amount = booking.deposit_amount || booking.total_price * 0.3 // 30% deposit default
      description = `Deposit for ${booking.boats?.name} - ${booking.booking_date}`
    } else if (paymentType === 'full') {
      amount = booking.total_price
      description = `Full payment for ${booking.boats?.name} - ${booking.booking_date}`
    } else {
      // Calculate remaining balance
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('booking_id', bookingId)

      const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
      amount = booking.total_price - totalPaid
      description = `Balance payment for ${booking.boats?.name} - ${booking.booking_date}`
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'No payment required' }, { status: 400 })
    }

    // Create Stripe payment link
    const result = await createPaymentLink({
      bookingId: booking.id,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email || '',
      amount,
      description,
      metadata: {
        payment_type: paymentType,
        boat_name: booking.boats?.name || '',
        booking_date: booking.booking_date,
      },
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Store payment link in booking notes or separate table
    await supabase
      .from('bookings')
      .update({
        notes: booking.notes
          ? `${booking.notes}\n\nPayment link (${paymentType}): ${result.paymentLinkUrl}`
          : `Payment link (${paymentType}): ${result.paymentLinkUrl}`,
      })
      .eq('id', bookingId)

    return NextResponse.json({
      success: true,
      paymentLinkUrl: result.paymentLinkUrl,
      amount,
      message: 'Payment link created successfully',
    })
  } catch (error: any) {
    console.error('Create payment link API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const {
      bookingId,
      amount,
      paymentType,
      paymentMethod,
      transactionReference,
      notes,
      paymentDate,
    } = await request.json()

    if (!bookingId || !amount || !paymentType || !paymentMethod) {
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

    // Get user's company and role
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admin, manager, office_staff, and accountant can record payments
    if (!['admin', 'manager', 'office_staff', 'accountant'].includes(userRecord.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to record payments' },
        { status: 403 }
      )
    }

    // Verify booking exists and belongs to user's company
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, company_id, total_price, status')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.company_id !== userRecord.company_id) {
      return NextResponse.json(
        { error: 'You can only record payments for bookings in your company' },
        { status: 403 }
      )
    }

    // Don't allow payments on cancelled or no-show bookings
    if (booking.status === 'cancelled' || booking.status === 'no_show') {
      return NextResponse.json(
        { error: 'Cannot record payment for cancelled or no-show bookings' },
        { status: 400 }
      )
    }

    // Calculate total paid so far
    const { data: existingPayments } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('booking_id', bookingId)

    const totalPaid = existingPayments?.reduce((sum, pt) => sum + pt.amount, 0) || 0
    const newTotalPaid = totalPaid + amount

    // Validate payment amount (allow overpayment for refund scenarios)
    if (!paymentType.includes('refund') && newTotalPaid > booking.total_price + 0.01) {
      return NextResponse.json(
        {
          error: `Payment would exceed booking total. Outstanding: €${(booking.total_price - totalPaid).toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Record payment transaction
    const { data: paymentTransaction, error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        booking_id: bookingId,
        company_id: userRecord.company_id,
        amount: parseFloat(amount),
        payment_type: paymentType,
        payment_method: paymentMethod,
        transaction_reference: transactionReference || null,
        notes: notes || null,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
        recorded_by: user.id,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment transaction error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to record payment transaction' },
        { status: 500 }
      )
    }

    // If booking is fully paid and status is pending_hold, upgrade to confirmed
    if (newTotalPaid >= booking.total_price && booking.status === 'pending_hold') {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId)
    }

    return NextResponse.json({
      success: true,
      payment: paymentTransaction,
      message: 'Payment recorded successfully',
    })
  } catch (error: any) {
    console.error('Record payment API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

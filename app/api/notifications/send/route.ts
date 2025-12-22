import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendNotification } from '@/lib/notifications/notification-service'
import {
  getBookingConfirmationEmail,
  getBookingReminderEmail,
  getPaymentReceivedEmail,
} from '@/lib/notifications/email-templates'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { bookingId, notificationType, recipientEmail, testMode } = await request.json()

    if (!bookingId || !notificationType) {
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
        boats(name),
        agents:users!agent_id(first_name, last_name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.company_id !== userRecord.company_id) {
      return NextResponse.json(
        { error: 'You can only send notifications for bookings in your company' },
        { status: 403 }
      )
    }

    let emailTemplate
    let subject = ''
    let html = ''

    // Generate email based on notification type
    if (notificationType === 'booking_confirmation') {
      emailTemplate = getBookingConfirmationEmail({
        customerName: booking.customer_name,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        boatName: booking.boats?.name || 'Boat',
        packageType: booking.package_type,
        totalPrice: booking.total_price,
        depositAmount: booking.deposit_amount,
        passengers: booking.passengers,
        bookingReference: booking.id.substring(0, 8).toUpperCase(),
      })
      subject = emailTemplate.subject
      html = emailTemplate.html
    } else if (notificationType === 'booking_reminder') {
      emailTemplate = getBookingReminderEmail({
        customerName: booking.customer_name,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        boatName: booking.boats?.name || 'Boat',
      })
      subject = emailTemplate.subject
      html = emailTemplate.html
    } else if (notificationType === 'payment_received') {
      // Get payment data
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (payments && payments.length > 0) {
        const latestPayment = payments[0]
        const totalPaid = await supabase
          .from('payment_transactions')
          .select('amount')
          .eq('booking_id', bookingId)
          .then(({ data }) => data?.reduce((sum, p) => sum + p.amount, 0) || 0)

        emailTemplate = getPaymentReceivedEmail({
          customerName: booking.customer_name,
          bookingDate: booking.booking_date,
          amountPaid: latestPayment.amount,
          paymentMethod: latestPayment.payment_method,
          outstandingBalance: booking.total_price - totalPaid,
        })
        subject = emailTemplate.subject
        html = emailTemplate.html
      }
    }

    if (!html) {
      return NextResponse.json(
        { error: 'Could not generate email template' },
        { status: 400 }
      )
    }

    // Send notification
    const result = await sendNotification({
      companyId: userRecord.company_id,
      recipientEmail: recipientEmail || booking.customer_email,
      recipientName: booking.customer_name,
      bookingId: booking.id,
      notificationType: notificationType,
      channel: 'email',
      subject,
      message: subject,
      html,
      metadata: { testMode: testMode || false },
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      notificationId: result.notificationId,
    })
  } catch (error: any) {
    console.error('Send notification API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

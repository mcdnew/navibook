import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/stripe/stripe-service'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Disable body parsing, need raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

    // Verify webhook signature
    const result = await constructWebhookEvent(body, signature, webhookSecret)

    if (!result.success || !result.event) {
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
    }

    const event = result.event

    // Initialize Supabase with service role (for webhook context)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any

        const bookingId = session.metadata?.booking_id
        const amount = session.amount_total / 100 // Convert from cents to euros

        if (!bookingId) {
          console.error('No booking ID in session metadata')
          break
        }

        // Get booking details
        const { data: booking } = await supabase
          .from('bookings')
          .select('company_id, total_price')
          .eq('id', bookingId)
          .single()

        if (!booking) {
          console.error('Booking not found:', bookingId)
          break
        }

        // Record payment transaction
        await supabase.from('payment_transactions').insert({
          booking_id: bookingId,
          company_id: booking.company_id,
          amount: amount,
          payment_type: amount >= booking.total_price ? 'full_payment' : 'deposit',
          payment_method: 'stripe',
          transaction_reference: session.payment_intent,
          notes: `Stripe Checkout Session: ${session.id}`,
          payment_date: new Date().toISOString().split('T')[0],
        })

        // Calculate total paid
        const { data: payments } = await supabase
          .from('payment_transactions')
          .select('amount')
          .eq('booking_id', bookingId)

        const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

        // If fully paid, confirm the booking
        if (totalPaid >= booking.total_price && booking) {
          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId)
        }

        console.log(`Payment processed for booking ${bookingId}: €${amount}`)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        const bookingId = paymentIntent.metadata?.booking_id

        console.log(`Payment intent succeeded for booking ${bookingId}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        const bookingId = paymentIntent.metadata?.booking_id

        console.error(`Payment failed for booking ${bookingId}`)
        // Could notify admins or customer here
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any
        const paymentIntentId = charge.payment_intent

        // Find the original payment transaction
        const { data: payment } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('transaction_reference', paymentIntentId)
          .single()

        if (payment) {
          // Record refund transaction
          await supabase.from('payment_transactions').insert({
            booking_id: payment.booking_id,
            company_id: payment.company_id,
            amount: -(charge.amount_refunded / 100), // Negative amount for refund
            payment_type: 'refund',
            payment_method: 'stripe',
            transaction_reference: charge.id,
            notes: `Refund for: ${paymentIntentId}`,
            payment_date: new Date().toISOString().split('T')[0],
          })

          console.log(`Refund processed for booking ${payment.booking_id}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import Stripe from 'stripe'

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

interface CreatePaymentLinkParams {
  bookingId: string
  customerName: string
  customerEmail: string
  amount: number
  description: string
  metadata?: Record<string, string>
}

interface CreateCheckoutSessionParams {
  bookingId: string
  customerName: string
  customerEmail: string
  amount: number
  description: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export async function createPaymentLink({
  bookingId,
  customerName,
  customerEmail,
  amount,
  description,
  metadata = {},
}: CreatePaymentLinkParams) {
  try {
    // Create a payment link for the booking
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description,
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'hosted_confirmation',
        hosted_confirmation: {
          custom_message: 'Thank you for your payment! Your booking is confirmed.',
        },
      },
      metadata: {
        booking_id: bookingId,
        customer_name: customerName,
        customer_email: customerEmail,
        ...metadata,
      },
      custom_text: {
        submit: {
          message: 'Your payment will be processed securely by Stripe.',
        },
      },
    })

    return {
      success: true,
      paymentLinkUrl: paymentLink.url,
      paymentLinkId: paymentLink.id,
    }
  } catch (error: any) {
    console.error('Stripe payment link creation error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function createCheckoutSession({
  bookingId,
  customerName,
  customerEmail,
  amount,
  description,
  successUrl,
  cancelUrl,
  metadata = {},
}: CreateCheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description,
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        booking_id: bookingId,
        customer_name: customerName,
        customer_email: customerEmail,
        ...metadata,
      },
      payment_intent_data: {
        metadata: {
          booking_id: bookingId,
        },
      },
    })

    return {
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
    }
  } catch (error: any) {
    console.error('Stripe checkout session creation error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return {
      success: true,
      paymentIntent,
    }
  } catch (error: any) {
    console.error('Stripe payment intent retrieval error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function retrieveCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
      success: true,
      session,
    }
  } catch (error: any) {
    console.error('Stripe session retrieval error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    return {
      success: true,
      event,
    }
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function createRefund(paymentIntentId: string, amount?: number, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      reason: reason as any,
    })

    return {
      success: true,
      refund,
    }
  } catch (error: any) {
    console.error('Stripe refund creation error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export { stripe }

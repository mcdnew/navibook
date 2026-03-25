import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

export type WebhookEvent =
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.completed'
  | 'booking.no_show'

export function signWebhookPayload(secret: string, body: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
}

/**
 * Fire-and-forget webhook delivery for API-sourced bookings.
 * Looks up the booking's api_key_id, fetches the key's webhook_url + secret,
 * signs with HMAC-SHA256, and POSTs. Retries up to 3 times with exponential
 * backoff (1s, 2s, 4s). Never throws or blocks the caller.
 */
export function triggerWebhook(bookingId: string, event: WebhookEvent): void {
  void deliverWebhook(bookingId, event)
}

type BookingRow = {
  id: string
  api_key_id: string | null
  status: string
  booking_date: string
  start_time: string
  end_time: string
  duration: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  passengers: number
  package_type: string
  total_price: number
}

type ApiKeyRow = {
  webhook_url: string | null
  webhook_secret: string
  is_active: boolean
}

async function deliverWebhook(bookingId: string, event: WebhookEvent): Promise<void> {
  try {
    const supabase = createAdminClient()

    const { data: booking } = await supabase
      .from('bookings')
      .select(
        'id, api_key_id, status, booking_date, start_time, end_time, duration, ' +
        'customer_name, customer_phone, customer_email, passengers, package_type, total_price'
      )
      .eq('id', bookingId)
      .single() as { data: BookingRow | null }

    if (!booking?.api_key_id) return

    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('webhook_url, webhook_secret, is_active')
      .eq('id', booking.api_key_id)
      .single() as { data: ApiKeyRow | null }

    if (!apiKey?.webhook_url || !apiKey.is_active) return

    const payload = {
      event,
      booking_id: booking.id,
      status: booking.status,
      timestamp: new Date().toISOString(),
      booking: {
        id: booking.id,
        date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        duration: booking.duration,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_email: booking.customer_email ?? null,
        passengers: booking.passengers,
        package_type: booking.package_type,
        total_price: booking.total_price,
      },
    }

    const body = JSON.stringify(payload)
    const signature = signWebhookPayload(apiKey.webhook_secret, body)

    const MAX_ATTEMPTS = 3
    let lastErr: string | undefined
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(apiKey.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-NaviBook-Signature': signature,
            'X-NaviBook-Event': event,
            'X-NaviBook-Attempt': String(attempt),
          },
          body,
          signal: AbortSignal.timeout(10_000),
        })
        if (res.ok) return
        lastErr = `HTTP ${res.status}`
      } catch (err) {
        lastErr = err instanceof Error ? err.message : String(err)
      }
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
      }
    }
    console.error(`[webhook] all ${MAX_ATTEMPTS} attempts failed [${event}] booking=${bookingId}: ${lastErr}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[webhook] delivery error [${event}] booking=${bookingId}: ${msg}`)
  }
}

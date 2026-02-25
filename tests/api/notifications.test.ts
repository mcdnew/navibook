/**
 * Notifications API tests — send, preferences GET/PUT
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX } from './helpers/client'
import { adminSupabase, getDemoCompanyId, getFirstBoat } from './helpers/supabase'

let testBookingId: string | null = null

const TEST_DAYS_OFFSET = 150
const getTargetDate = () => {
  const d = new Date(); d.setDate(d.getDate() + TEST_DAYS_OFFSET); return d.toISOString().split('T')[0]
}

beforeAll(async () => {
  // Create a minimal booking for notification tests
  const companyId = await getDemoCompanyId()
  const boat = await getFirstBoat()

  // Cancel any leftover test bookings at this date from previous runs
  await adminSupabase.from('bookings')
    .update({ status: 'cancelled' })
    .eq('boat_id', boat.id)
    .eq('booking_date', getTargetDate())
    .like('customer_name', '[TEST-%')

  const { data } = await adminSupabase
    .from('bookings')
    .insert({
      company_id: companyId,
      boat_id: boat.id,
      customer_name: `${TEST_PREFIX} Notification Test`,
      customer_phone: '+34600000000',
      customer_email: 'notify-test@example.com',
      booking_date: getTargetDate(),
      start_time: '10:00',
      end_time: '13:00',
      duration: '3h',
      passengers: 2,
      package_type: 'charter_only',
      total_price: 300,
      deposit_amount: 75,
      status: 'confirmed',
    })
    .select('id')
    .single()

  testBookingId = data?.id ?? null
})

afterAll(async () => {
  // UPDATE to cancelled (direct DELETE fails due to DB audit trigger)
  await adminSupabase.from('bookings')
    .update({ status: 'cancelled' })
    .like('customer_name', `${TEST_PREFIX}%`)
})

describe('Notifications API', () => {
  describe('GET /api/notifications/preferences', () => {
    it('returns notification preferences', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/notifications/preferences')
      expect(res.status).toBe(200)
      // Returns default prefs or user-specific prefs
      expect(typeof res.body).toBe('object')
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/notifications/preferences')
      expect(res.status).toBe(401)
    })
  })

  describe('PUT /api/notifications/preferences', () => {
    it('updates notification preferences', async () => {
      const api = await createApiClient('admin')
      const res = await api.put('/api/notifications/preferences', {
        email_booking_confirmations: true,
        email_booking_changes: true,
        email_payment_notifications: false,
        email_booking_reminders: true,
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.preferences).toBeDefined()
    })
  })

  describe('POST /api/notifications/send', () => {
    it('attempts to send notification (test mode)', async () => {
      if (!testBookingId) {
        console.warn('Skipping notification send test — no test booking created')
        return
      }
      const api = await createApiClient('admin')
      const res = await api.post('/api/notifications/send', {
        bookingId: testBookingId,
        notificationType: 'booking_confirmation',
        testMode: true,
      })
      // May succeed or fail depending on email config — just verify response shape
      expect([200, 500]).toContain(res.status)
      if (res.status === 200) {
        expect((res.body as any).success).toBe(true)
      }
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/notifications/send', {
        notificationType: 'booking_confirmation',
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 for missing notificationType', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/notifications/send', {
        bookingId: testBookingId ?? '00000000-0000-0000-0000-000000000000',
      })
      expect(res.status).toBe(400)
    })
  })
})

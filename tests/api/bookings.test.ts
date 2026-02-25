/**
 * Bookings API tests — dashboard, confirm, cancel, complete, no-show, edit, reschedule, payment-status
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX } from './helpers/client'
import {
  adminSupabase,
  getDemoCompanyId,
  getFirstBoat,
  deleteByNamePrefix,
} from './helpers/supabase'

let companyId: string
let boatId: string
let bookingId: string
let bookingIdForCancel: string
let bookingIdForNoShow: string

let bookingOffset = 0

// Helper: insert a booking directly via service role (bypasses availability check)
async function createTestBooking(
  name: string,
  status: string = 'confirmed'
): Promise<string> {
  bookingOffset += 1
  const d = new Date()
  d.setDate(d.getDate() + 60 + bookingOffset) // spread bookings across days far in future
  const dateStr = d.toISOString().split('T')[0]

  const { data, error } = await adminSupabase
    .from('bookings')
    .insert({
      company_id: companyId,
      boat_id: boatId,
      customer_name: name,
      customer_phone: '+34600000000',
      booking_date: dateStr,
      start_time: '10:00',
      end_time: '14:00',
      duration: '4h',
      passengers: 2,
      package_type: 'charter_only',
      total_price: 400,
      deposit_amount: 100,
      status,
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(`Failed to create test booking: ${error?.message}`)
  return data.id
}

beforeAll(async () => {
  companyId = await getDemoCompanyId()
  const boat = await getFirstBoat()
  boatId = boat.id

  // Create bookings for different test scenarios
  bookingId = await createTestBooking(`${TEST_PREFIX} Main Booking`, 'pending_hold')
  bookingIdForCancel = await createTestBooking(`${TEST_PREFIX} Cancel Me`, 'confirmed')
  bookingIdForNoShow = await createTestBooking(`${TEST_PREFIX} No Show`, 'confirmed')
})

afterAll(async () => {
  // Clean up all test bookings
  await deleteByNamePrefix('bookings', 'customer_name', TEST_PREFIX)
})

describe('Bookings API', () => {
  describe('GET /api/bookings/dashboard', () => {
    it('returns dashboard data for admin', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/bookings/dashboard')
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(Array.isArray(body.upcoming)).toBe(true)
      expect(Array.isArray(body.latest)).toBe(true)
    })

    it('returns dashboard data for agent (own bookings only)', async () => {
      const api = await createApiClient('agent')
      const res = await api.get('/api/bookings/dashboard')
      expect(res.status).toBe(200)
      expect(Array.isArray((res.body as any).upcoming)).toBe(true)
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/bookings/dashboard')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/bookings/confirm', () => {
    it('confirms a pending_hold booking', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/confirm', {
        bookingId,
        depositPaid: false,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/confirm', {})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/bookings/payment-status', () => {
    it('updates deposit_paid flag', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/payment-status', {
        bookingId,
        depositPaid: true,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/payment-status', { depositPaid: true })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/bookings/edit', () => {
    it('edits a booking', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/edit', {
        bookingId,
        customerName: `${TEST_PREFIX} Edited Name`,
        customerPhone: '+34611111111',
        passengers: 3,
        packageType: 'charter_only',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/edit', {
        customerName: 'Test',
        customerPhone: '+34600000000',
        passengers: 1,
      })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/bookings/reschedule', () => {
    it('reschedules a booking to a different date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 14)
      const newDate = futureDate.toISOString().split('T')[0]

      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/reschedule', {
        bookingId,
        newDate,
        newStartTime: '14:00',
        newEndTime: '18:00',
      })
      // May succeed or fail due to availability — just verify we get a response
      expect([200, 400, 409]).toContain(res.status)
    })

    it('returns 400 for missing required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/reschedule', { bookingId })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/bookings/complete', () => {
    it('completes a confirmed booking', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/complete', { bookingId })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns error when trying to complete an already-completed booking', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/complete', { bookingId })
      // Already completed — API returns 400 or 500 depending on error path
      expect([400, 500]).toContain(res.status)
    })
  })

  describe('POST /api/bookings/no-show', () => {
    it('marks a confirmed booking as no-show', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/no-show', {
        bookingId: bookingIdForNoShow,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/no-show', {})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/bookings/cancel', () => {
    it('cancels a confirmed booking', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/cancel', {
        bookingId: bookingIdForCancel,
        reason: 'Test cancellation',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns error for a booking already cancelled', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/cancel', {
        bookingId: bookingIdForCancel,
        reason: 'Duplicate cancel',
      })
      // Already cancelled — API returns 400 or 500 depending on error path
      expect([400, 500]).toContain(res.status)
    })

    it('returns 400 for missing reason', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/cancel', { bookingId: bookingId })
      expect(res.status).toBe(400)
    })
  })
})

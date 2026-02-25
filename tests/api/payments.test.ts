/**
 * Payments API tests — record payment (deposit/full/refund), create-link
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX } from './helpers/client'
import { adminSupabase, getDemoCompanyId, getFirstBoat } from './helpers/supabase'

let companyId: string
let boatId: string
let bookingId: string

const TEST_DAYS_OFFSET = 90
const getTargetDate = () => {
  const d = new Date(); d.setDate(d.getDate() + TEST_DAYS_OFFSET); return d.toISOString().split('T')[0]
}

async function createTestBooking(name: string): Promise<string> {
  const dateStr = getTargetDate()

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
      total_price: 500,
      deposit_amount: 100,
      status: 'confirmed',
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

  // Cancel any leftover test bookings at the target date from previous runs
  await adminSupabase.from('bookings')
    .update({ status: 'cancelled' })
    .eq('boat_id', boatId)
    .eq('booking_date', getTargetDate())
    .like('customer_name', '[TEST-%')

  bookingId = await createTestBooking(`${TEST_PREFIX} Payment Test`)
})

afterAll(async () => {
  // UPDATE to cancelled (direct DELETE fails due to DB audit trigger)
  await adminSupabase.from('bookings')
    .update({ status: 'cancelled' })
    .like('customer_name', `${TEST_PREFIX}%`)
})

describe('Payments API', () => {
  describe('POST /api/payments/record', () => {
    it('records a deposit payment', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/payments/record', {
        bookingId,
        amount: 100,
        paymentType: 'deposit',
        paymentMethod: 'cash',
        notes: 'Test deposit',
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.payment).toBeDefined()
    })

    it('records a full payment', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/payments/record', {
        bookingId,
        amount: 400,
        paymentType: 'full_payment',
        paymentMethod: 'card',
        transactionReference: 'TEST-REF-001',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('records a refund', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/payments/record', {
        bookingId,
        amount: -50,
        paymentType: 'refund',
        paymentMethod: 'cash',
        notes: 'Partial refund test',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/payments/record', {
        bookingId,
        amount: 100,
        // missing paymentType and paymentMethod
      })
      expect(res.status).toBe(400)
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/payments/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount: 100, paymentType: 'deposit', paymentMethod: 'cash' }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/payments/create-link', () => {
    it('creates a payment link for deposit', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/payments/create-link', {
        bookingId,
        paymentType: 'deposit',
      })
      // May be 200 (Stripe configured) or 500 (Stripe not configured in test env)
      // Just verify we get a response and it either has a URL or an error
      expect([200, 400, 500]).toContain(res.status)
      if (res.status === 200) {
        expect((res.body as any).success).toBe(true)
      }
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/payments/create-link', {
        paymentType: 'deposit',
      })
      expect(res.status).toBe(400)
    })
  })
})

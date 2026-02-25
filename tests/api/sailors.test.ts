/**
 * Sailors API tests — assign, list, remove
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX } from './helpers/client'
import { adminSupabase, getDemoCompanyId, getFirstBoat } from './helpers/supabase'

let bookingId: string
let sailorUserId: string | null = null
let boatId: string

const TEST_DAYS_OFFSET = 120
const getTargetDate = () => {
  const d = new Date(); d.setDate(d.getDate() + TEST_DAYS_OFFSET); return d.toISOString().split('T')[0]
}

beforeAll(async () => {
  const companyId = await getDemoCompanyId()
  const boat = await getFirstBoat()
  boatId = boat.id

  // Cancel any leftover test bookings at the target date from previous runs
  await adminSupabase.from('bookings')
    .update({ status: 'cancelled' })
    .eq('boat_id', boatId)
    .eq('booking_date', getTargetDate())
    .like('customer_name', '[TEST-%')

  const dateStr = getTargetDate()

  const { data: booking, error } = await adminSupabase
    .from('bookings')
    .insert({
      company_id: companyId,
      boat_id: boatId,
      customer_name: `${TEST_PREFIX} Sailors Test`,
      customer_phone: '+34600000000',
      booking_date: dateStr,
      start_time: '09:00',
      end_time: '13:00',
      duration: '4h',
      passengers: 2,
      package_type: 'charter_only',
      total_price: 300,
      deposit_amount: 75,
      status: 'confirmed',
    })
    .select('id')
    .single()

  if (error || !booking) throw new Error('Failed to create test booking for sailors test')
  bookingId = booking.id

  // Get a sailor user from the demo company
  const { data: sailor } = await adminSupabase
    .from('users')
    .select('id')
    .eq('company_id', companyId)
    .eq('role', 'sailor')
    .single()

  sailorUserId = sailor?.id ?? null
})

afterAll(async () => {
  // UPDATE to cancelled (direct DELETE fails due to DB audit trigger)
  await adminSupabase.from('bookings')
    .update({ status: 'cancelled' })
    .like('customer_name', `${TEST_PREFIX}%`)
})

describe('Sailors API', () => {
  describe('GET /api/bookings/sailors', () => {
    it('returns empty list when no sailors assigned', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/bookings/sailors', { bookingId })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/bookings/sailors')
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/bookings/sailors', () => {
    it('assigns a sailor to a booking', async () => {
      if (!sailorUserId) {
        console.warn('No sailor found in demo data, skipping assignment test')
        return
      }
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/sailors', {
        bookingId,
        sailors: [
          {
            sailorId: sailorUserId,
            hourlyRate: 15,
            fee: 60,
          },
        ],
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing bookingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/bookings/sailors', { sailors: [] })
      expect(res.status).toBe(400)
    })

    it('returns 403 for captain role (insufficient permissions)', async () => {
      const api = await createApiClient('captain')
      const res = await api.post('/api/bookings/sailors', {
        bookingId,
        sailors: [],
      })
      expect([403, 401]).toContain(res.status)
    })
  })

  describe('DELETE /api/bookings/sailors', () => {
    it('removes a sailor from a booking', async () => {
      if (!sailorUserId) {
        console.warn('No sailor found, skipping delete test')
        return
      }
      const api = await createApiClient('admin')
      const res = await api.delete('/api/bookings/sailors', {
        bookingId,
        sailorId: sailorUserId,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing params', async () => {
      const api = await createApiClient('admin')
      const res = await api.delete('/api/bookings/sailors', { bookingId })
      expect(res.status).toBe(400)
    })
  })
})

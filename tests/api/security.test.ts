/**
 * Security tests — cross-company isolation
 * Verifies that the 7 critical security fixes work: no user can mutate another company's bookings.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX, ApiClient } from './helpers/client'
import {
  adminSupabase,
  getDemoCompanyId,
  getFirstBoat,
  deleteByNamePrefix,
  getUserByEmail,
} from './helpers/supabase'

let companyId: string
let boatId: string
let victimBookingId: string
let attackerClient: ApiClient | null = null
let attackerCompanyId: string | null = null
let bookingOffset = 0

// Helper: insert a booking directly via service role
async function createTestBooking(
  name: string,
  status: string = 'confirmed'
): Promise<string> {
  bookingOffset += 1
  const d = new Date()
  d.setDate(d.getDate() + 60 + bookingOffset)
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

  // Create a test booking belonging to the demo company
  victimBookingId = await createTestBooking(`${TEST_PREFIX} Victim Booking`, 'confirmed')

  // Try to find a second company via admin@navibook.com
  try {
    const navibookUser = await getUserByEmail('admin@navibook.com')
    attackerCompanyId = navibookUser.company_id

    // Only use navibook admin as attacker if they belong to a different company
    if (attackerCompanyId !== companyId) {
      attackerClient = await createApiClient({
        email: 'admin@navibook.com',
        password: 'Admin123!',
      })
    }
  } catch {
    // admin@navibook.com doesn't exist or other error — will skip tests
  }
})

afterAll(async () => {
  // Clean up all test bookings
  await deleteByNamePrefix('bookings', 'customer_name', TEST_PREFIX)
})

describe('Cross-company security', () => {
  it('cannot cancel another company booking', async (ctx) => {
    if (!attackerClient) { ctx.skip(); return }
    const res = await attackerClient.post('/api/bookings/cancel', {
      bookingId: victimBookingId,
      reason: 'Malicious cancellation attempt',
    })
    // Should be 403 Forbidden or 404 Not Found, NOT 200
    expect([403, 404]).toContain(res.status)
  })

  it('cannot confirm another company booking', async (ctx) => {
    if (!attackerClient) { ctx.skip(); return }
    const res = await attackerClient.post('/api/bookings/confirm', {
      bookingId: victimBookingId,
      depositPaid: false,
    })
    expect([403, 404]).toContain(res.status)
  })

  it('cannot complete another company booking', async (ctx) => {
    if (!attackerClient) { ctx.skip(); return }
    const res = await attackerClient.post('/api/bookings/complete', {
      bookingId: victimBookingId,
    })
    expect([403, 404]).toContain(res.status)
  })

  it('cannot mark another company booking as no-show', async (ctx) => {
    if (!attackerClient) { ctx.skip(); return }
    const res = await attackerClient.post('/api/bookings/no-show', {
      bookingId: victimBookingId,
    })
    expect([403, 404]).toContain(res.status)
  })

  it('cannot reschedule another company booking', async (ctx) => {
    if (!attackerClient) { ctx.skip(); return }
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 90)
    const newDate = futureDate.toISOString().split('T')[0]

    const res = await attackerClient.post('/api/bookings/reschedule', {
      bookingId: victimBookingId,
      newDate,
      newStartTime: '14:00',
      newEndTime: '18:00',
    })
    expect([403, 404]).toContain(res.status)
  })

  it('cannot edit another company booking', async (ctx) => {
    if (!attackerClient) { ctx.skip(); return }
    const res = await attackerClient.post('/api/bookings/edit', {
      bookingId: victimBookingId,
      customerName: 'Hacked Name',
      customerPhone: '+34999999999',
      passengers: 10,
      packageType: 'charter_only',
    })
    expect([403, 404]).toContain(res.status)
  })

  it('cannot change payment status on another company booking', async (ctx) => {
    if (!attackerClient) { ctx.skip(); return }
    const res = await attackerClient.post('/api/bookings/payment-status', {
      bookingId: victimBookingId,
      depositPaid: true,
    })
    expect([403, 404]).toContain(res.status)
  })
})

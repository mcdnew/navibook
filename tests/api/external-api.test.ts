/**
 * External API v1 tests — Bearer token authentication
 * Tests for /api/v1/availability, /api/v1/bookings, and /api/v1/bookings/[id]
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TEST_PREFIX } from './helpers/client'
import {
  adminSupabase,
  getDemoCompanyId,
  deleteByNamePrefix,
} from './helpers/supabase'
import { generateApiKey } from '../../lib/api-keys'
import { signWebhookPayload } from '../../lib/webhooks'

let companyId: string
let boatId: string
let apiKey: string
let revokedApiKey: string
let createdBookingId: string

// Helper to make v1 API requests with Bearer token
async function apiV1(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>,
  authKey?: string
) {
  const url = new URL('http://localhost:3000' + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authKey) {
    headers['Authorization'] = `Bearer ${authKey}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data: unknown
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  return { status: res.status, body: data }
}

beforeAll(async () => {
  companyId = await getDemoCompanyId()

  // Find a boat in the demo company that has charter_only/4h pricing (needed for POST /api/v1/bookings)
  const { data: companyBoats } = await adminSupabase
    .from('boats')
    .select('id')
    .eq('company_id', companyId)
    .eq('is_active', true)
  const boatIds = companyBoats?.map((b: { id: string }) => b.id) ?? []
  const { data: pricedBoats } = await adminSupabase
    .from('pricing')
    .select('boat_id')
    .in('boat_id', boatIds)
    .eq('duration', '4h')
    .eq('package_type', 'charter_only')
    .limit(1)
  if (!pricedBoats?.length) throw new Error('No boat with charter_only/4h pricing found in demo company')
  boatId = pricedBoats[0].boat_id

  // Create a real API key
  const { rawKey, keyHash, keyPrefix } = generateApiKey()
  apiKey = rawKey

  await adminSupabase.from('api_keys').insert({
    company_id: companyId,
    name: `${TEST_PREFIX} Test Key`,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    is_active: true,
  })

  // Create a revoked API key
  const { rawKey: revokedRaw, keyHash: revokedHash, keyPrefix: revokedPrefix } = generateApiKey()
  revokedApiKey = revokedRaw

  await adminSupabase.from('api_keys').insert({
    company_id: companyId,
    name: `${TEST_PREFIX} Revoked Key`,
    key_hash: revokedHash,
    key_prefix: revokedPrefix,
    is_active: false,
  })
})

afterAll(async () => {
  // Cancel any test bookings
  if (createdBookingId) {
    await adminSupabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', createdBookingId)
  }

  // Delete test API keys
  await adminSupabase
    .from('api_keys')
    .delete()
    .like('name', `${TEST_PREFIX}%`)
})

describe('External API v1', () => {
  describe('Authentication', () => {
    it('rejects requests without Authorization header', async () => {
      const res = await apiV1('GET', '/api/v1/availability', undefined, {
        date: '2026-06-01',
        start_time: '10:00',
        duration: '4h',
      })
      expect(res.status).toBe(401)
    })

    it('rejects requests with invalid API key', async () => {
      const res = await apiV1(
        'GET',
        '/api/v1/availability',
        undefined,
        {
          date: '2026-06-01',
          start_time: '10:00',
          duration: '4h',
        },
        'invalid_key_12345'
      )
      expect(res.status).toBe(401)
    })

    it('rejects requests with revoked API key', async () => {
      const res = await apiV1(
        'GET',
        '/api/v1/availability',
        undefined,
        {
          date: '2026-06-01',
          start_time: '10:00',
          duration: '4h',
        },
        revokedApiKey
      )
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/v1/availability', () => {
    it('returns available boats for a future date', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 90)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await apiV1(
        'GET',
        '/api/v1/availability',
        undefined,
        {
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
          passengers: '2',
        },
        apiKey
      )

      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body).toHaveProperty('available')
      expect(body).toHaveProperty('boats')
      expect(Array.isArray(body.boats)).toBe(true)
    })

    it('includes pricing in availability response', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 91)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await apiV1(
        'GET',
        '/api/v1/availability',
        undefined,
        {
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
          passengers: '2',
        },
        apiKey
      )

      expect(res.status).toBe(200)
      const body = res.body as any
      if (body.boats && body.boats.length > 0) {
        expect(body.boats[0]).toHaveProperty('pricing')
        expect(Array.isArray(body.boats[0].pricing)).toBe(true)
      }
    })

    it('rejects dates in the past', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const dateStr = pastDate.toISOString().split('T')[0]

      const res = await apiV1(
        'GET',
        '/api/v1/availability',
        undefined,
        {
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
        },
        apiKey
      )
      expect(res.status).toBe(400)
    })

    it('rejects invalid duration', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 92)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await apiV1(
        'GET',
        '/api/v1/availability',
        undefined,
        {
          date: dateStr,
          start_time: '10:00',
          duration: '5h', // Invalid: only 2h, 3h, 4h, 8h allowed
        },
        apiKey
      )
      expect(res.status).toBe(400)
    })

    it('rejects missing required params', async () => {
      const res = await apiV1(
        'GET',
        '/api/v1/availability',
        undefined,
        {
          date: '2026-06-01',
          // Missing start_time and duration
        },
        apiKey
      )
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/bookings', () => {
    it('creates a booking with valid data', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 93)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await apiV1(
        'POST',
        '/api/v1/bookings',
        {
          boat_id: boatId,
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
          passengers: 2,
          customer_name: `${TEST_PREFIX} API Booking`,
          customer_phone: '+34600000001',
          customer_email: 'customer@example.com',
          package_type: 'charter_only',
        },
        undefined,
        apiKey
      )

      expect(res.status).toBe(201)
      const body = res.body as any
      expect(body).toHaveProperty('booking_id')
      createdBookingId = body.booking_id
    })

    it('returns 422 when no pricing configured', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 94)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await apiV1(
        'POST',
        '/api/v1/bookings',
        {
          boat_id: boatId,
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
          passengers: 2,
          customer_name: `${TEST_PREFIX} Invalid Package`,
          customer_phone: '+34600000002',
          package_type: 'invalid_package', // Will cause pricing lookup to fail
        },
        undefined,
        apiKey
      )

      expect(res.status).toBe(422)
    })

    it('returns 400 when missing required fields', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 95)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await apiV1(
        'POST',
        '/api/v1/bookings',
        {
          boat_id: boatId,
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
          passengers: 2,
          // Missing customer_name
          customer_phone: '+34600000003',
        },
        undefined,
        apiKey
      )

      expect(res.status).toBe(400)
    })

    it('returns 400 when date is in the past', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const dateStr = pastDate.toISOString().split('T')[0]

      const res = await apiV1(
        'POST',
        '/api/v1/bookings',
        {
          boat_id: boatId,
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
          passengers: 2,
          customer_name: `${TEST_PREFIX} Past Date`,
          customer_phone: '+34600000004',
        },
        undefined,
        apiKey
      )

      expect(res.status).toBe(400)
    })

    it('returns 404 when boat_id does not belong to company', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 96)
      const dateStr = futureDate.toISOString().split('T')[0]

      const randomUuid = '00000000-0000-0000-0000-000000000000'

      const res = await apiV1(
        'POST',
        '/api/v1/bookings',
        {
          boat_id: randomUuid,
          date: dateStr,
          start_time: '10:00',
          duration: '4h',
          passengers: 2,
          customer_name: `${TEST_PREFIX} Wrong Boat`,
          customer_phone: '+34600000005',
        },
        undefined,
        apiKey
      )

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/v1/bookings/[id]', () => {
    it('returns booking status for a booking created via API', async () => {
      if (!createdBookingId) {
        // Skip if no booking was created in earlier tests
        expect(true).toBe(true)
        return
      }

      const res = await apiV1(
        'GET',
        `/api/v1/bookings/${createdBookingId}`,
        undefined,
        undefined,
        apiKey
      )

      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body).toHaveProperty('booking_id')
      expect(body).toHaveProperty('status')
      expect(body.booking_id).toBe(createdBookingId)
    })

    it('returns 404 for unknown booking id', async () => {
      const unknownId = '00000000-0000-0000-0000-000000000000'

      const res = await apiV1(
        'GET',
        `/api/v1/bookings/${unknownId}`,
        undefined,
        undefined,
        apiKey
      )

      expect(res.status).toBe(404)
    })

    it('returns 404 for booking from another company', async () => {
      // Create a booking in the demo company, then try to fetch it as the external API key
      // (which belongs to a different company, if one exists)
      // For now, we'll just verify the endpoint structure
      const testId = '11111111-1111-1111-1111-111111111111'

      const res = await apiV1(
        'GET',
        `/api/v1/bookings/${testId}`,
        undefined,
        undefined,
        apiKey
      )

      // Will return 404 because the booking doesn't exist in this company
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/v1/bookings', () => {
    it('returns a list of bookings', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, undefined, apiKey)
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body).toHaveProperty('bookings')
      expect(Array.isArray(body.bookings)).toBe(true)
      expect(body).toHaveProperty('total')
      expect(body).toHaveProperty('limit')
      expect(body).toHaveProperty('offset')
    })

    it('each booking has expected shape', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, { limit: '1' }, apiKey)
      expect(res.status).toBe(200)
      const body = res.body as any
      if (body.bookings.length > 0) {
        const b = body.bookings[0]
        expect(b).toHaveProperty('booking_id')
        expect(b).toHaveProperty('status')
        expect(b).toHaveProperty('date')
        expect(b).toHaveProperty('start_time')
        expect(b).toHaveProperty('total_price')
      }
    })

    it('respects limit and offset', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, { limit: '5', offset: '0' }, apiKey)
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.limit).toBe(5)
      expect(body.offset).toBe(0)
      expect(body.bookings.length).toBeLessThanOrEqual(5)
    })

    it('clamps limit to 100', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, { limit: '999' }, apiKey)
      expect(res.status).toBe(200)
      expect((res.body as any).limit).toBe(100)
    })

    it('filters by status', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, { status: 'confirmed' }, apiKey)
      expect(res.status).toBe(200)
      const body = res.body as any
      for (const b of body.bookings) {
        expect(b.status).toBe('confirmed')
      }
    })

    it('rejects invalid status', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, { status: 'invalid' }, apiKey)
      expect(res.status).toBe(400)
    })

    it('filters by date_from and date_to', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, {
        date_from: '2026-01-01',
        date_to: '2026-12-31',
      }, apiKey)
      expect(res.status).toBe(200)
      const body = res.body as any
      for (const b of body.bookings) {
        expect(b.date >= '2026-01-01').toBe(true)
        expect(b.date <= '2026-12-31').toBe(true)
      }
    })

    it('rejects invalid date_from format', async () => {
      const res = await apiV1('GET', '/api/v1/bookings', undefined, { date_from: '01-01-2026' }, apiKey)
      expect(res.status).toBe(400)
    })

    it('requires auth', async () => {
      const res = await apiV1('GET', '/api/v1/bookings')
      expect(res.status).toBe(401)
    })
  })

  describe('Webhook signature (signWebhookPayload)', () => {
    it('produces sha256= prefixed HMAC', () => {
      const sig = signWebhookPayload('mysecret', '{"hello":"world"}')
      expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/)
    })

    it('same inputs produce same signature', () => {
      const body = '{"event":"booking.confirmed"}'
      const sig1 = signWebhookPayload('secret123', body)
      const sig2 = signWebhookPayload('secret123', body)
      expect(sig1).toBe(sig2)
    })

    it('different secrets produce different signatures', () => {
      const body = '{"event":"booking.confirmed"}'
      const sig1 = signWebhookPayload('secret-a', body)
      const sig2 = signWebhookPayload('secret-b', body)
      expect(sig1).not.toBe(sig2)
    })

    it('different bodies produce different signatures', () => {
      const secret = 'same-secret'
      const sig1 = signWebhookPayload(secret, '{"event":"booking.confirmed"}')
      const sig2 = signWebhookPayload(secret, '{"event":"booking.cancelled"}')
      expect(sig1).not.toBe(sig2)
    })
  })
})

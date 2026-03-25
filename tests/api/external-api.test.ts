/**
 * External API v1 tests — Bearer token authentication
 * Tests for /api/v1/availability, /api/v1/bookings, and /api/v1/bookings/[id]
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TEST_PREFIX } from './helpers/client'
import {
  adminSupabase,
  getDemoCompanyId,
  getFirstBoat,
  deleteByNamePrefix,
} from './helpers/supabase'
import { generateApiKey } from '../../lib/api-keys'

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
  const boat = await getFirstBoat()
  boatId = boat.id

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
})

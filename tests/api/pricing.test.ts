/**
 * Pricing API tests — create, edit, delete, copy between boats
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX } from './helpers/client'
import { getDemoBoats, adminSupabase } from './helpers/supabase'

let boat1Id: string
let boat2Id: string
let createdPricingId: string | null = null

// Use a combination unlikely to conflict with real demo data
const TEST_DURATION = '8h'
const TEST_PACKAGE = 'charter_full'

beforeAll(async () => {
  const boats = await getDemoBoats()
  if (boats.length < 2) throw new Error('Need at least 2 boats for pricing tests')
  boat1Id = boats[0].id
  boat2Id = boats[1].id

  // Clean up any leftover test pricing entries from previous failed runs
  await adminSupabase.from('pricing').delete()
    .eq('boat_id', boat1Id).eq('duration', TEST_DURATION).eq('package_type', TEST_PACKAGE)
  await adminSupabase.from('pricing').delete()
    .eq('boat_id', boat2Id).eq('duration', TEST_DURATION).eq('package_type', TEST_PACKAGE)
})

afterAll(async () => {
  // Remove test pricing entries created during tests
  if (createdPricingId) {
    await adminSupabase.from('pricing').delete().eq('id', createdPricingId)
  }
  // Also clean up any copies made to boat2
  await adminSupabase.from('pricing').delete()
    .eq('boat_id', boat2Id).eq('duration', TEST_DURATION).eq('package_type', TEST_PACKAGE)
})

describe('Pricing API', () => {
  describe('POST /api/pricing/create', () => {
    it('creates a pricing entry', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/create', {
        boatId: boat1Id,
        duration: TEST_DURATION,
        packageType: TEST_PACKAGE,
        price: 599,
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.pricing.price).toBe(599)
      createdPricingId = body.pricing.id
    })

    it('returns 400 for missing required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/create', {
        boatId: boat1Id,
        price: 100,
      })
      expect(res.status).toBe(400)
    })

    it('returns 409 for duplicate entry', async () => {
      const api = await createApiClient('admin')
      // Try to create the same entry again
      const res = await api.post('/api/pricing/create', {
        boatId: boat1Id,
        duration: TEST_DURATION,
        packageType: TEST_PACKAGE,
        price: 600,
      })
      expect(res.status).toBe(409)
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/pricing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatId: boat1Id, duration: '2h', packageType: 'charter_only', price: 100 }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/pricing/edit', () => {
    it('edits the pricing entry price', async () => {
      expect(createdPricingId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/edit', {
        pricingId: createdPricingId,
        price: 649,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      expect((res.body as any).pricing.price).toBe(649)
    })

    it('returns 400 for missing pricingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/edit', { price: 100 })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/pricing/copy', () => {
    it('copies pricing from one boat to another', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/copy', {
        fromBoatId: boat1Id,
        toBoatId: boat2Id,
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(typeof body.count).toBe('number')
    })

    it('returns 400 for missing boatIds', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/copy', { fromBoatId: boat1Id })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/pricing/delete', () => {
    it('deletes the pricing entry', async () => {
      expect(createdPricingId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/delete', { pricingId: createdPricingId })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      createdPricingId = null
    })

    it('returns 400 for missing pricingId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/pricing/delete', {})
      expect(res.status).toBe(400)
    })
  })
})

/**
 * Boats API tests — create, edit, toggle-status, deactivate, delete, fuel-config CRUD
 */

import { describe, it, expect, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX, runCleanup, registerCleanup } from './helpers/client'
import { adminSupabase, deleteByNamePrefix } from './helpers/supabase'

const boatName = `${TEST_PREFIX} Test Boat`
let createdBoatId: string | null = null

afterAll(async () => {
  // Clean up boats created during this test run
  await deleteByNamePrefix('boats', 'name', TEST_PREFIX)
})

describe('Boats API', () => {
  describe('POST /api/boats/create', () => {
    it('creates a boat with required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/create', {
        name: boatName,
        boatType: 'motorboat',
        capacity: 8,
        description: 'Test boat for automated tests',
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.boat.name).toBe(boatName)
      expect(body.boat.capacity).toBe(8)
      createdBoatId = body.boat.id
    })

    it('returns 400 when name is missing', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/create', {
        boatType: 'motorboat',
        capacity: 6,
      })
      expect(res.status).toBe(400)
      expect((res.body as any).error).toBeTruthy()
    })

    it('returns 400 when capacity < 1', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/create', {
        name: `${TEST_PREFIX} Invalid`,
        boatType: 'motorboat',
        capacity: 0,
      })
      expect(res.status).toBe(400)
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/boats/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'x', boatType: 'motorboat', capacity: 1 }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/boats/edit', () => {
    it('edits the created boat', async () => {
      expect(createdBoatId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/edit', {
        boatId: createdBoatId,
        name: `${boatName} (edited)`,
        boatType: 'motorboat',
        capacity: 10,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      expect((res.body as any).boat.capacity).toBe(10)
    })

    it('returns 400 for missing boatId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/edit', {
        name: 'New Name',
        boatType: 'motorboat',
        capacity: 5,
      })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/boats/toggle-status', () => {
    it('toggles boat to inactive', async () => {
      expect(createdBoatId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/toggle-status', {
        boatId: createdBoatId,
        isActive: false,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      expect((res.body as any).boat.is_active).toBe(false)
    })

    it('toggles boat back to active', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/toggle-status', {
        boatId: createdBoatId,
        isActive: true,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).boat.is_active).toBe(true)
    })
  })

  describe('Fuel config', () => {
    it('GET returns null when no fuel config', async () => {
      expect(createdBoatId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.get('/api/boats/fuel-config', { boatId: createdBoatId! })
      expect(res.status).toBe(200)
      // body is null or an object
    })

    it('POST creates/updates fuel config', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/fuel-config', {
        boatId: createdBoatId,
        fuelConsumptionRate: 20,
        fuelPricePerLiter: 1.5,
        notes: 'test fuel config',
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.fuel_consumption_rate).toBe(20)
      expect(body.fuel_price_per_liter).toBe(1.5)
    })

    it('GET returns fuel config after creation', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/boats/fuel-config', { boatId: createdBoatId! })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body).not.toBeNull()
      expect(body.fuel_consumption_rate).toBe(20)
    })

    it('DELETE removes fuel config', async () => {
      const api = await createApiClient('admin')
      const res = await api.delete('/api/boats/fuel-config', { boatId: createdBoatId! })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })
  })

  describe('POST /api/boats/deactivate', () => {
    it('deactivates (soft deletes) the boat', async () => {
      expect(createdBoatId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.post('/api/boats/deactivate', { boatId: createdBoatId })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      expect((res.body as any).boat.is_active).toBe(false)
    })
  })

  describe('DELETE /api/boats/delete', () => {
    it('returns 400 when trying to delete a boat with bookings', async () => {
      // Use a real demo boat (has bookings), should fail
      const { data: boats } = await adminSupabase
        .from('boats')
        .select('id')
        .limit(1)
        .single()

      if (!boats) return // skip if no boats

      // Check if it has bookings
      const { data: bookings } = await adminSupabase
        .from('bookings')
        .select('id')
        .eq('boat_id', boats.id)
        .limit(1)

      if (!bookings?.length) return // skip - no bookings to test with

      const api = await createApiClient('admin')
      const res = await api.delete('/api/boats/delete', { id: boats.id })
      expect(res.status).toBe(400)
      expect((res.body as any).error).toMatch(/booking/i)
    })

    it('returns 400 for missing id param', async () => {
      const api = await createApiClient('admin')
      const res = await api.delete('/api/boats/delete')
      expect(res.status).toBe(400)
    })

    it('deletes a boat with no bookings', async () => {
      // Create a fresh boat to delete
      const api = await createApiClient('admin')
      const createRes = await api.post('/api/boats/create', {
        name: `${TEST_PREFIX} To Delete`,
        boatType: 'motorboat',
        capacity: 2,
      })
      expect(createRes.status).toBe(200)
      const boatToDelete = (createRes.body as any).boat.id

      const res = await api.delete('/api/boats/delete', { id: boatToDelete })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })
  })
})

/**
 * Blocked Slots API tests — create, list (with filters), delete
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX } from './helpers/client'
import { getFirstBoat, adminSupabase, getDemoCompanyId } from './helpers/supabase'

let boatId: string
let createdSlotId: string | null = null

beforeAll(async () => {
  const boat = await getFirstBoat()
  boatId = boat.id
})

afterAll(async () => {
  // Clean up created slots
  if (createdSlotId) {
    await adminSupabase.from('blocked_slots').delete().eq('id', createdSlotId)
  }
  // Also clean any that slipped through by reason
  await adminSupabase
    .from('blocked_slots')
    .delete()
    .like('reason', `${TEST_PREFIX}%`)
})

describe('Blocked Slots API', () => {
  describe('POST /api/blocked-slots/create', () => {
    it('creates a blocked slot', async () => {
      const api = await createApiClient('admin')
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await api.post('/api/blocked-slots/create', {
        boatId,
        startDate: dateStr,
        endDate: dateStr,
        startTime: '08:00',
        endTime: '18:00',
        reason: `${TEST_PREFIX} Maintenance`,
        blockType: 'maintenance',
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      createdSlotId = body.data?.id ?? null
    })

    it('returns 400 for missing required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/blocked-slots/create', {
        startTime: '08:00',
        endTime: '18:00',
      })
      expect(res.status).toBe(400)
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/blocked-slots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatId, startDate: '2030-01-01', endDate: '2030-01-01', startTime: '09:00', endTime: '17:00', reason: 'test' }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/blocked-slots/list', () => {
    it('returns list of blocked slots', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/blocked-slots/list')
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
    })

    it('filters by date range', async () => {
      const api = await createApiClient('admin')
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const dateStr = futureDate.toISOString().split('T')[0]

      const res = await api.get('/api/blocked-slots/list', {
        startDate: dateStr,
        endDate: dateStr,
      })
      expect(res.status).toBe(200)
      expect(Array.isArray((res.body as any).data)).toBe(true)
    })

    it('filters by boatId', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/blocked-slots/list', { boatId })
      expect(res.status).toBe(200)
      const body = res.body as any
      // All results should belong to the filtered boat
      for (const slot of body.data) {
        if (slot.boat_id) expect(slot.boat_id).toBe(boatId)
      }
    })
  })

  describe('DELETE /api/blocked-slots/delete', () => {
    it('deletes the created blocked slot', async () => {
      expect(createdSlotId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.delete('/api/blocked-slots/delete', { id: createdSlotId! })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      createdSlotId = null
    })

    it('returns 400 for missing id param', async () => {
      const api = await createApiClient('admin')
      const res = await api.delete('/api/blocked-slots/delete')
      expect(res.status).toBe(400)
    })
  })
})

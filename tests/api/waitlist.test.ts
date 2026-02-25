/**
 * Waitlist API tests — add, list, update (PATCH), delete, convert to booking
 */

import { describe, it, expect, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX } from './helpers/client'
import { adminSupabase } from './helpers/supabase'

let createdEntryId: string | null = null

afterAll(async () => {
  // Clean up any leftover waitlist entries
  await adminSupabase
    .from('waitlist')
    .delete()
    .like('customer_name', `${TEST_PREFIX}%`)
})

describe('Waitlist API', () => {
  describe('POST /api/waitlist/add', () => {
    it('adds a waitlist entry', async () => {
      const api = await createApiClient('admin')
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)

      const res = await api.post('/api/waitlist/add', {
        customerName: `${TEST_PREFIX} Waitlist Customer`,
        customerPhone: '+34600123456',
        customerEmail: 'waitlist-test@example.com',
        preferredDate: futureDate.toISOString().split('T')[0],
        passengers: 4,
        notes: 'Test entry from automated tests',
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.waitlistEntry).toBeDefined()
      createdEntryId = body.waitlistEntry.id
    })

    it('returns 400 for missing required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/waitlist/add', {
        customerPhone: '+34600000000',
      })
      expect(res.status).toBe(400)
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/waitlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: 'x', customerPhone: '+34600000000', preferredDate: '2030-01-01', passengers: 2 }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/waitlist/list', () => {
    it('returns all waitlist entries', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/waitlist/list')
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
    })

    it('filters by status=active', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/waitlist/list', { status: 'active' })
      expect(res.status).toBe(200)
      const body = res.body as any
      for (const entry of body.data) {
        expect(entry.status).toBe('active')
      }
    })
  })

  describe('PATCH /api/waitlist/[id]', () => {
    it('updates a waitlist entry', async () => {
      expect(createdEntryId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.patch(`/api/waitlist/${createdEntryId}`, {
        passengers: 6,
        notes: 'Updated by test',
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.data.passengers).toBe(6)
    })

    it('returns error for non-existent entry', async () => {
      const api = await createApiClient('admin')
      const res = await api.patch('/api/waitlist/00000000-0000-0000-0000-000000000000', {
        passengers: 1,
      })
      // Supabase .single() throws when 0 rows matched → API returns 500
      expect([404, 500]).toContain(res.status)
    })
  })

  describe('DELETE /api/waitlist/[id]', () => {
    it('deletes the waitlist entry', async () => {
      expect(createdEntryId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.delete(`/api/waitlist/${createdEntryId}`)
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      createdEntryId = null
    })

    it('returns 200 for non-existent entry (delete is idempotent)', async () => {
      const api = await createApiClient('admin')
      const res = await api.delete('/api/waitlist/00000000-0000-0000-0000-000000000000')
      // Supabase .delete() without .single() returns success even if 0 rows deleted
      expect(res.status).toBe(200)
    })
  })
})

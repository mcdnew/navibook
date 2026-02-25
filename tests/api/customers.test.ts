/**
 * Customers API tests — notes GET, POST (upsert)
 */

import { describe, it, expect, afterAll } from 'vitest'
import { createApiClient, runId } from './helpers/client'
import { adminSupabase } from './helpers/supabase'

const testEmail = `test-customer-${runId}@example.com`

afterAll(async () => {
  await adminSupabase.from('customer_notes').delete().eq('customer_email', testEmail)
})

describe('Customers API', () => {
  describe('POST /api/customers/notes', () => {
    it('creates/upserts customer notes', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/customers/notes', {
        customerEmail: testEmail,
        notes: 'VIP client, prefers early morning departures',
        preferences: 'No shellfish',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing customerEmail', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/customers/notes', {
        notes: 'No email provided',
      })
      expect(res.status).toBe(400)
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/customers/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: testEmail, notes: 'x' }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/customers/notes', () => {
    it('retrieves notes for a single email', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/customers/notes', { emails: testEmail })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(Array.isArray(body.notes)).toBe(true)
      const note = body.notes.find((n: any) => n.customer_email === testEmail)
      expect(note).toBeDefined()
      expect(note.notes).toBe('VIP client, prefers early morning departures')
    })

    it('retrieves notes for multiple emails', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/customers/notes', {
        emails: `${testEmail},other@example.com`,
      })
      expect(res.status).toBe(200)
      expect(Array.isArray((res.body as any).notes)).toBe(true)
    })

    it('returns empty array for non-existent email', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/customers/notes', {
        emails: 'nobody-exists-xyz@example.com',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).notes).toHaveLength(0)
    })

    it('returns empty notes array when emails param is missing', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/customers/notes')
      expect(res.status).toBe(200)
      expect((res.body as any).notes).toHaveLength(0)
    })
  })
})

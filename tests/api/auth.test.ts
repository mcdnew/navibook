/**
 * Auth tests — verify that the Supabase session cookie approach works
 * and that unauthenticated requests are rejected.
 */

import { describe, it, expect } from 'vitest'
import { createApiClient, runCleanup } from './helpers/client'

describe('Auth', () => {
  it('authenticated request succeeds on a protected endpoint', async () => {
    const api = await createApiClient('admin')
    const res = await api.get('/api/company/info')
    expect(res.status).toBe(200)
    expect((res.body as any).success).toBe(true)
  })

  it('unauthenticated request returns 401', async () => {
    const res = await fetch('http://localhost:3000/api/company/info', {
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status).toBe(401)
  })

  it('captain can access dashboard bookings', async () => {
    const api = await createApiClient('captain')
    const res = await api.get('/api/bookings/dashboard')
    // Captain gets filtered view — 200 or 200 with subset
    expect(res.status).toBe(200)
  })

  it('agent can access dashboard bookings', async () => {
    const api = await createApiClient('agent')
    const res = await api.get('/api/bookings/dashboard')
    expect(res.status).toBe(200)
  })
})

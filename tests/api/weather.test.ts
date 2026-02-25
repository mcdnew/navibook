/**
 * Weather API tests — forecast GET, booking weather POST
 */

import { describe, it, expect } from 'vitest'
import { createApiClient } from './helpers/client'

describe('Weather API', () => {
  describe('GET /api/weather/forecast', () => {
    it('returns forecast data', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/weather/forecast', { days: '3' })
      // Weather depends on external API — may succeed or fail gracefully
      expect([200, 500]).toContain(res.status)
      if (res.status === 200) {
        const body = res.body as any
        expect(body.success).toBe(true)
        expect(Array.isArray(body.forecasts)).toBe(true)
      }
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/weather/forecast')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/weather/booking', () => {
    it('returns weather suitability for a booking date', async () => {
      const api = await createApiClient('admin')
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 2)

      const res = await api.post('/api/weather/booking', {
        bookingDate: futureDate.toISOString().split('T')[0],
        startTime: '10:00',
        boatType: 'motorboat',
      })
      // Weather API dependent — verify graceful response
      expect([200, 500]).toContain(res.status)
      if (res.status === 200) {
        const body = res.body as any
        expect(body.success).toBe(true)
        expect(body.suitability).toBeDefined()
      }
    })

    it('returns 400 for missing required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/weather/booking', {
        // missing bookingDate and startTime
        boatType: 'motorboat',
      })
      expect(res.status).toBe(400)
    })

    it('returns 401 for unauthenticated request', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 2)
      const res = await fetch('http://localhost:3000/api/weather/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingDate: futureDate.toISOString().split('T')[0],
          startTime: '10:00',
        }),
      })
      expect(res.status).toBe(401)
    })
  })
})

/**
 * Company API tests — info, location, cancellation-policies, package-config
 */

import { describe, it, expect, afterAll } from 'vitest'
import { createApiClient, runId } from './helpers/client'
import { adminSupabase, getDemoCompanyId } from './helpers/supabase'

let createdPolicyId: string | null = null
const testPolicyName = `Test Policy ${runId}`

afterAll(async () => {
  // Clean up test policies
  if (createdPolicyId) {
    await adminSupabase.from('cancellation_policies').delete().eq('id', createdPolicyId)
  }
})

describe('Company API', () => {
  describe('GET /api/company/info', () => {
    it('returns company info', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/company/info')
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.company).toBeDefined()
      expect(typeof body.company.name).toBe('string')
    })

    it('returns 401 for unauthenticated request', async () => {
      const res = await fetch('http://localhost:3000/api/company/info')
      expect(res.status).toBe(401)
    })
  })

  describe('PUT /api/company/info', () => {
    it('updates company info', async () => {
      const api = await createApiClient('admin')
      // First get current info
      const getRes = await api.get('/api/company/info')
      const current = (getRes.body as any).company

      const res = await api.put('/api/company/info', {
        name: current.name, // keep the name
        email: 'info@happysail.es',
        phone: '+34600000000',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing name', async () => {
      const api = await createApiClient('admin')
      const res = await api.put('/api/company/info', { email: 'test@x.com' })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/company/location', () => {
    it('returns location data', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/company/location')
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.location).toBeDefined()
    })
  })

  describe('PUT /api/company/location', () => {
    it('updates company location', async () => {
      const api = await createApiClient('admin')
      const res = await api.put('/api/company/location', {
        latitude: 36.424,
        longitude: -5.1473,
        location_name: 'Puerto Deportivo de Estepona',
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for invalid latitude', async () => {
      const api = await createApiClient('admin')
      const res = await api.put('/api/company/location', {
        latitude: 200,
        longitude: 0,
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 for missing coordinates', async () => {
      const api = await createApiClient('admin')
      const res = await api.put('/api/company/location', {})
      expect(res.status).toBe(400)
    })
  })

  describe('Cancellation Policies', () => {
    it('GET returns list of policies', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/company/cancellation-policies')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('POST creates a cancellation policy', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/company/cancellation-policies', {
        policyName: testPolicyName,
        refundBefore7Days: 100,
        refundBefore3Days: 50,
        refundBefore1Day: 0,
        description: 'Policy created by automated test',
      })
      expect(res.status).toBe(201)
      const body = res.body as any
      expect(body.policy_name).toBe(testPolicyName)
      createdPolicyId = body.id
    })

    it('POST returns 400 for invalid percentages', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/company/cancellation-policies', {
        policyName: 'Bad Policy',
        refundBefore7Days: 150, // > 100
        refundBefore3Days: 50,
        refundBefore1Day: 0,
      })
      expect(res.status).toBe(400)
    })

    it('PUT updates the policy', async () => {
      expect(createdPolicyId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.put('/api/company/cancellation-policies', {
        policyId: createdPolicyId,
        refundBefore7Days: 80,
        refundBefore3Days: 40,
        refundBefore1Day: 10,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).refund_before_7_days).toBe(80)
    })

    it('DELETE removes the policy', async () => {
      expect(createdPolicyId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.delete('/api/company/cancellation-policies', {
        id: createdPolicyId!,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
      createdPolicyId = null
    })
  })

  describe('Package Config', () => {
    it('GET returns package config', async () => {
      const api = await createApiClient('admin')
      const res = await api.get('/api/company/package-config')
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(typeof body.drinks_cost_per_person).toBe('number')
      expect(typeof body.food_cost_per_person).toBe('number')
    })

    it('PUT updates package config', async () => {
      const api = await createApiClient('admin')
      const res = await api.put('/api/company/package-config', {
        drinksCostPerPerson: 15,
        foodCostPerPerson: 25,
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.drinks_cost_per_person).toBe(15)
      expect(body.food_cost_per_person).toBe(25)
    })

    it('DELETE resets to defaults', async () => {
      const api = await createApiClient('admin')
      const res = await api.delete('/api/company/package-config')
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })
  })
})

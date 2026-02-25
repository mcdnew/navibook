/**
 * Agents API tests — create, edit, delete
 */

import { describe, it, expect, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX, runId } from './helpers/client'
import { adminSupabase } from './helpers/supabase'

const testEmail = `test-agent-${runId}@navibook-test.com`
let createdAgentId: string | null = null
let createdAuthUserId: string | null = null

afterAll(async () => {
  // Clean up test auth user
  if (createdAuthUserId) {
    await adminSupabase.auth.admin.deleteUser(createdAuthUserId)
  }
  // Clean up any users with test email pattern
  const { data: testUsers } = await adminSupabase
    .from('users')
    .select('id')
    .like('email', `test-agent-%@navibook-test.com`)

  if (testUsers?.length) {
    for (const u of testUsers) {
      await adminSupabase.auth.admin.deleteUser(u.id)
    }
    await adminSupabase.from('users').delete().like('email', `test-agent-%@navibook-test.com`)
  }
})

describe('Agents API', () => {
  describe('POST /api/agents/create', () => {
    it('creates a new agent', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/agents/create', {
        firstName: 'Test',
        lastName: `Agent ${runId}`,
        email: testEmail,
        role: 'sales_agent',
        commissionPercentage: 10,
        password: 'TestAgent123!',
        isActive: true,
      })
      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.success).toBe(true)
      expect(body.agent.email).toBe(testEmail)
      createdAgentId = body.agent.id
      createdAuthUserId = body.agent.id
    })

    it('returns 400 for missing required fields', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/agents/create', {
        firstName: 'Test',
        email: 'incomplete@example.com',
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 for password too short', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/agents/create', {
        firstName: 'Test',
        lastName: 'Short',
        email: `short-pw-${runId}@navibook-test.com`,
        role: 'sales_agent',
        password: '123',
      })
      expect(res.status).toBe(400)
    })

    it('returns 409 for duplicate email', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/agents/create', {
        firstName: 'Dup',
        lastName: 'Agent',
        email: testEmail,
        role: 'sales_agent',
        password: 'TestAgent123!',
      })
      expect(res.status).toBe(409)
    })

    it('returns 403 when called by non-admin user', async () => {
      const api = await createApiClient('agent')
      const res = await api.post('/api/agents/create', {
        firstName: 'Unauthorized',
        lastName: 'Agent',
        email: `unauth-${runId}@navibook-test.com`,
        role: 'sales_agent',
        password: 'TestAgent123!',
      })
      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/agents/edit', () => {
    it('edits the created agent', async () => {
      expect(createdAgentId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.post('/api/agents/edit', {
        agentId: createdAgentId,
        firstName: 'Updated',
        lastName: `Agent ${runId}`,
        email: testEmail,
        role: 'sales_agent',
        commissionPercentage: 15,
        isActive: true,
      })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 400 for missing agentId', async () => {
      const api = await createApiClient('admin')
      const res = await api.post('/api/agents/edit', {
        firstName: 'Test',
        lastName: 'Agent',
        email: 'x@x.com',
        role: 'sales_agent',
        isActive: true,
      })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/agents/delete', () => {
    it('deletes (archives) the agent', async () => {
      expect(createdAgentId).toBeTruthy()
      const api = await createApiClient('admin')
      const res = await api.post('/api/agents/delete', { agentId: createdAgentId })
      expect(res.status).toBe(200)
      expect((res.body as any).success).toBe(true)
    })

    it('returns 403 when called by non-admin', async () => {
      const api = await createApiClient('ops')
      const res = await api.post('/api/agents/delete', { agentId: createdAgentId })
      // ops_manager might get 403 or 404 depending on how delete is implemented
      expect([403, 404]).toContain(res.status)
    })
  })
})

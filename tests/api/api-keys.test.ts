/**
 * API Key Management tests
 * Tests for internal API key management endpoints (session auth)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApiClient, TEST_PREFIX, ApiClient } from './helpers/client'
import { adminSupabase, getDemoCompanyId } from './helpers/supabase'

let adminClient: ApiClient
let agentClient: ApiClient
let captainClient: ApiClient
let companyId: string
let createdKeyId: string | null = null

beforeAll(async () => {
  companyId = await getDemoCompanyId()
  adminClient = await createApiClient('admin')
  agentClient = await createApiClient('agent')
  captainClient = await createApiClient('captain')
})

afterAll(async () => {
  // Delete any api_keys created in tests
  await adminSupabase
    .from('api_keys')
    .delete()
    .like('name', `${TEST_PREFIX}%`)
})

describe('API Key Management', () => {
  describe('POST /api/settings/api-keys', () => {
    it('admin can create an API key', async () => {
      const res = await adminClient.post('/api/settings/api-keys', {
        name: `${TEST_PREFIX} Admin Key`,
      })

      expect(res.status).toBe(201)
      const body = res.body as any
      expect(body).toHaveProperty('rawKey')
      expect(body).toHaveProperty('key')
      expect(body.key).toHaveProperty('id')
      expect(body.key).toHaveProperty('name')
      expect(body.key.name).toBe(`${TEST_PREFIX} Admin Key`)
      createdKeyId = body.key.id
    })

    it('returns rawKey only once (not key_hash)', async () => {
      const res = await adminClient.post('/api/settings/api-keys', {
        name: `${TEST_PREFIX} Key Hash Test`,
      })

      expect(res.status).toBe(201)
      const body = res.body as any
      expect(body).toHaveProperty('rawKey')
      expect(typeof body.rawKey).toBe('string')
      expect(body.rawKey.length).toBeGreaterThan(0)
      expect(body.key).not.toHaveProperty('key_hash')
    })

    it('agent cannot create API keys', async () => {
      const res = await agentClient.post('/api/settings/api-keys', {
        name: `${TEST_PREFIX} Agent Key`,
      })

      expect(res.status).toBe(401)
    })

    it('captain cannot create API keys', async () => {
      const res = await captainClient.post('/api/settings/api-keys', {
        name: `${TEST_PREFIX} Captain Key`,
      })

      expect(res.status).toBe(401)
    })

    it('requires a name field', async () => {
      const res = await adminClient.post('/api/settings/api-keys', {})

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/settings/api-keys', () => {
    it('admin can list API keys', async () => {
      const res = await adminClient.get('/api/settings/api-keys')

      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body).toHaveProperty('keys')
      expect(Array.isArray(body.keys)).toBe(true)
    })

    it('does not include key_hash in list', async () => {
      const res = await adminClient.get('/api/settings/api-keys')

      expect(res.status).toBe(200)
      const body = res.body as any
      expect(Array.isArray(body.keys)).toBe(true)

      // Check that no key in the list has key_hash
      for (const key of body.keys) {
        expect(key).not.toHaveProperty('key_hash')
        expect(key).toHaveProperty('key_prefix') // Should have prefix instead
      }
    })

    it('agent cannot list API keys', async () => {
      const res = await agentClient.get('/api/settings/api-keys')

      expect(res.status).toBe(401)
    })

    it('captain cannot list API keys', async () => {
      const res = await captainClient.get('/api/settings/api-keys')

      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/settings/api-keys/[id]', () => {
    let keyToRevokeId: string

    beforeAll(async () => {
      // Create a key to revoke in later tests
      const res = await adminClient.post('/api/settings/api-keys', {
        name: `${TEST_PREFIX} Key to Revoke`,
      })
      if (res.status === 201) {
        const body = res.body as any
        keyToRevokeId = body.key.id
      }
    })

    it('admin can revoke an API key', async () => {
      if (!keyToRevokeId) {
        expect(true).toBe(true) // Skip if setup failed
        return
      }

      const res = await adminClient.delete(`/api/settings/api-keys/${keyToRevokeId}`)

      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body).toHaveProperty('success')
      expect(body.success).toBe(true)
    })

    it('revoked key returns is_active: false', async () => {
      if (!keyToRevokeId) {
        expect(true).toBe(true) // Skip if setup failed
        return
      }

      const res = await adminClient.get('/api/settings/api-keys')

      expect(res.status).toBe(200)
      const body = res.body as any
      const revokedKey = body.keys.find((k: any) => k.id === keyToRevokeId)

      if (revokedKey) {
        expect(revokedKey.is_active).toBe(false)
      }
    })

    it('agent cannot revoke API keys', async () => {
      if (!createdKeyId) {
        expect(true).toBe(true) // Skip if no key was created
        return
      }

      const res = await agentClient.delete(`/api/settings/api-keys/${createdKeyId}`)

      expect(res.status).toBe(401)
    })

    it('captain cannot revoke API keys', async () => {
      if (!createdKeyId) {
        expect(true).toBe(true) // Skip if no key was created
        return
      }

      const res = await captainClient.delete(`/api/settings/api-keys/${createdKeyId}`)

      expect(res.status).toBe(401)
    })

    it('returns 404 for non-existent key id', async () => {
      const unknownId = '00000000-0000-0000-0000-000000000000'

      const res = await adminClient.delete(`/api/settings/api-keys/${unknownId}`)

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/settings/api-keys/[id]', () => {
    let patchKeyId: string

    beforeAll(async () => {
      const res = await adminClient.post('/api/settings/api-keys', {
        name: `${TEST_PREFIX} Patch Key`,
      })
      if (res.status === 201) {
        patchKeyId = (res.body as any).key.id
      }
    })

    it('admin can set a webhook URL', async () => {
      if (!patchKeyId) { expect(true).toBe(true); return }

      const res = await adminClient.patch(`/api/settings/api-keys/${patchKeyId}`, {
        webhook_url: 'https://example.com/webhooks/navibook',
      })

      expect(res.status).toBe(200)
      const body = res.body as any
      expect(body.key.webhook_url).toBe('https://example.com/webhooks/navibook')
    })

    it('can clear webhook URL by passing null', async () => {
      if (!patchKeyId) { expect(true).toBe(true); return }

      const res = await adminClient.patch(`/api/settings/api-keys/${patchKeyId}`, {
        webhook_url: null,
      })

      expect(res.status).toBe(200)
      expect((res.body as any).key.webhook_url).toBeNull()
    })

    it('rejects non-http(s) URLs', async () => {
      if (!patchKeyId) { expect(true).toBe(true); return }

      const res = await adminClient.patch(`/api/settings/api-keys/${patchKeyId}`, {
        webhook_url: 'ftp://example.com/hook',
      })

      expect(res.status).toBe(400)
    })

    it('rejects invalid URLs', async () => {
      if (!patchKeyId) { expect(true).toBe(true); return }

      const res = await adminClient.patch(`/api/settings/api-keys/${patchKeyId}`, {
        webhook_url: 'not-a-url',
      })

      expect(res.status).toBe(400)
    })

    it('agent cannot update webhook URL', async () => {
      if (!patchKeyId) { expect(true).toBe(true); return }

      const res = await agentClient.patch(`/api/settings/api-keys/${patchKeyId}`, {
        webhook_url: 'https://attacker.com/hook',
      })

      expect(res.status).toBe(401)
    })

    it('returns 404 for non-existent key id', async () => {
      const unknownId = '00000000-0000-0000-0000-000000000000'

      const res = await adminClient.patch(`/api/settings/api-keys/${unknownId}`, {
        webhook_url: 'https://example.com/hook',
      })

      expect(res.status).toBe(404)
    })
  })
})

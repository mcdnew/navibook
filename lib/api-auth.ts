import { createAdminClient } from '@/lib/supabase/server'
import { hashApiKey } from '@/lib/api-keys'

type ApiKeyResult =
  | { companyId: string; keyId: string; revoked: false }
  | { revoked: true }

const rateLimitMap = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT = 60
const WINDOW_MS = 60_000

export function checkRateLimit(keyId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(keyId)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(keyId, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function validateApiKey(request: Request): Promise<ApiKeyResult | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const rawKey = authHeader.slice(7).trim()
  if (!rawKey) return null

  const keyHash = hashApiKey(rawKey)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, company_id, is_active')
    .eq('key_hash', keyHash)
    .single()

  if (error || !data) return null
  if (!data.is_active) return { revoked: true }

  // Update last_used_at in background (don't await to avoid blocking response)
  void supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return { companyId: data.company_id, keyId: data.id, revoked: false }
}

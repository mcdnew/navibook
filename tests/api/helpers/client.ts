/**
 * API Test Client
 * Authenticates via @supabase/ssr (same library as the app) so cookies match exactly.
 */

import dotenv from 'dotenv'
import path from 'path'
import { createServerClient } from '@supabase/ssr'

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') })

const BASE_URL = 'http://localhost:3000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Unique prefix for all test data created in this run
export const runId = Date.now()
export const TEST_PREFIX = `[TEST-${runId}]`

// ── Auth ───────────────────────────────────────────────────────────────────────

/**
 * Signs in using @supabase/ssr's createServerClient with an in-memory cookie store.
 * This produces the exact same cookie format the app uses, so no guesswork.
 * Returns a Cookie header string ready for use in fetch requests.
 */
async function login(email: string, password: string): Promise<string> {
  const cookieJar: Map<string, string> = new Map()

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value }))
      },
      setAll(cookies) {
        for (const { name, value } of cookies) {
          if (value) {
            cookieJar.set(name, value)
          } else {
            cookieJar.delete(name)
          }
        }
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(`Login failed for ${email}: ${error.message}`)
  }

  if (cookieJar.size === 0) {
    throw new Error(`Login appeared to succeed for ${email} but no cookies were set`)
  }

  // Build a Cookie header from the jar (values are raw strings from setAll)
  // We URL-encode them since the browser sends them URL-encoded (matching what cookie.serialize does)
  return Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ')
}

// ── Client factory ─────────────────────────────────────────────────────────────

export type ApiResponse = {
  status: number
  body: unknown
}

export type ApiClient = {
  get(path: string, params?: Record<string, string>): Promise<ApiResponse>
  post(path: string, body?: unknown): Promise<ApiResponse>
  put(path: string, body?: unknown): Promise<ApiResponse>
  patch(path: string, body?: unknown): Promise<ApiResponse>
  delete(path: string, params?: Record<string, string>): Promise<ApiResponse>
}

async function request(
  cookieHeader: string,
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<ApiResponse> {
  const url = new URL(BASE_URL + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let responseBody: unknown
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    responseBody = await res.json()
  } else {
    responseBody = await res.text()
  }

  return { status: res.status, body: responseBody }
}

const DEMO_CREDS = {
  admin: { email: 'admin@happysail.es', password: 'Demo1234!' },
  captain: { email: 'captain.javier@happysail.es', password: 'Demo1234!' },
  agent: { email: 'agent.marco@happysail.es', password: 'Demo1234!' },
  ops: { email: 'ops@happysail.es', password: 'Demo1234!' },
} as const

export type UserRole = keyof typeof DEMO_CREDS

type Credentials = { email: string; password: string }

// Session cache so we only login once per role per test run
const sessionCache = new Map<string, string>()

export async function createApiClient(role: UserRole | Credentials): Promise<ApiClient> {
  const creds = typeof role === 'string' ? DEMO_CREDS[role] : role
  const cacheKey = typeof role === 'string' ? role : creds.email

  let cookieHeader = sessionCache.get(cacheKey)
  if (!cookieHeader) {
    cookieHeader = await login(creds.email, creds.password)
    sessionCache.set(cacheKey, cookieHeader)
  }

  const cookie = cookieHeader

  return {
    get: (path, params) => request(cookie, 'GET', path, undefined, params),
    post: (path, body) => request(cookie, 'POST', path, body),
    put: (path, body) => request(cookie, 'PUT', path, body),
    patch: (path, body) => request(cookie, 'PATCH', path, body),
    delete: (path, params) => request(cookie, 'DELETE', path, undefined, params),
  }
}

// ── Cleanup registry ───────────────────────────────────────────────────────────

type CleanupFn = () => Promise<void>
const cleanupRegistry: CleanupFn[] = []

export function registerCleanup(fn: CleanupFn) {
  cleanupRegistry.push(fn)
}

export async function runCleanup() {
  for (const fn of cleanupRegistry.reverse()) {
    try {
      await fn()
    } catch {
      // ignore
    }
  }
  cleanupRegistry.length = 0
}

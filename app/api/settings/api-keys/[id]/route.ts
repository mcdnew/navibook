import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function getAuthorizedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!userData) return null
  if (userData.role !== 'admin' && userData.role !== 'operations_manager') return null

  return { userId: user.id, companyId: userData.company_id as string }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authorized = await getAuthorizedUser()
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { webhook_url } = body

    // Allow null/empty to clear the webhook
    const normalizedUrl = webhook_url ? webhook_url.trim() : null

    if (normalizedUrl) {
      try {
        const parsed = new URL(normalizedUrl)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          return NextResponse.json({ error: 'webhook_url must be an http or https URL' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'webhook_url must be a valid URL' }, { status: 400 })
      }
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', id)
      .eq('company_id', authorized.companyId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({ webhook_url: normalizedUrl })
      .eq('id', id)
      .select('id, name, key_prefix, is_active, created_at, last_used_at, webhook_url')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ key: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authorized = await getAuthorizedUser()
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const supabase = createAdminClient()

    // Verify the key belongs to this company before revoking
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', id)
      .eq('company_id', authorized.companyId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

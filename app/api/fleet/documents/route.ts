/**
 * GET    /api/fleet/documents?boat_id=&status=
 * POST   /api/fleet/documents
 * DELETE /api/fleet/documents?id=
 */

import { NextResponse } from 'next/server'
import { requireFleetAccess } from '../_helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase } = ctx
  const { searchParams } = new URL(request.url)
  const boatId = searchParams.get('boat_id')
  const status = searchParams.get('status')

  if (!boatId) {
    return NextResponse.json({ error: 'boat_id is required' }, { status: 400 })
  }

  let query = supabase
    .from('fleet_documents')
    .select('*')
    .eq('boat_id', boatId)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase, userId, companyId } = ctx
  const { boatId, name, documentType, fileUrl, fileSizeBytes, expiryDate, notes } =
    await request.json()

  if (!boatId || !name || !documentType || !fileUrl) {
    return NextResponse.json(
      { error: 'boatId, name, documentType, and fileUrl are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('fleet_documents')
    .insert({
      company_id: companyId,
      boat_id: boatId,
      uploaded_by_user_id: userId,
      name: name.trim(),
      document_type: documentType,
      file_url: fileUrl,
      file_size_bytes: fileSizeBytes || null,
      expiry_date: expiryDate || null,
      notes: notes || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, document: data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const ctx = await requireFleetAccess()
  if (ctx instanceof NextResponse) return ctx

  const { supabase } = ctx
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('fleet_documents').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emails = searchParams.get('emails')?.split(',').filter(Boolean) || []

    if (emails.length === 0) {
      return NextResponse.json({ notes: [] })
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: notes, error } = await supabase
      .from('customer_notes')
      .select('customer_email, notes, preferences')
      .eq('company_id', userRecord.company_id)
      .in('customer_email', emails)

    if (error) {
      console.error('Fetch customer notes error:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({ notes: notes || [] })
  } catch (error: any) {
    console.error('Get customer notes API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { customerEmail, notes, preferences } = await request.json()

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: upsertError } = await supabase
      .from('customer_notes')
      .upsert({
        company_id: userRecord.company_id,
        customer_email: customerEmail,
        notes,
        preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,customer_email',
      })

    if (upsertError) {
      console.error('Save customer notes error:', upsertError)
      return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Notes saved successfully' })
  } catch (error: any) {
    console.error('Save customer notes API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

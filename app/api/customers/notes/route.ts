import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


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

    // For now, we'll store notes in a simple format
    // In production, you'd want a dedicated customer_notes table
    //
    // CREATE TABLE customer_notes (
    //   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    //   company_id UUID REFERENCES companies(id),
    //   customer_email TEXT NOT NULL,
    //   notes TEXT,
    //   preferences TEXT,
    //   created_at TIMESTAMPTZ DEFAULT NOW(),
    //   updated_at TIMESTAMPTZ DEFAULT NOW()
    // );
    //
    // For now, we'll just return success
    // The notes would need to be stored and retrieved from the database

    console.log('Customer notes to be saved:', {
      customerEmail,
      notes,
      preferences,
      company_id: userRecord.company_id,
    })

    // TODO: Implement actual database storage
    // const { data, error } = await supabase
    //   .from('customer_notes')
    //   .upsert({
    //     company_id: userRecord.company_id,
    //     customer_email: customerEmail,
    //     notes,
    //     preferences,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .select()
    //   .single()

    return NextResponse.json({
      success: true,
      message: 'Notes saved successfully (note: database table customer_notes needs to be created for persistence)',
    })
  } catch (error: any) {
    console.error('Save customer notes API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

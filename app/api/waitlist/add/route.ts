import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      preferredDate,
      boatId,
      passengers,
      notes,
    } = await request.json()

    if (!customerName || !customerPhone || !preferredDate || !passengers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Add to waitlist
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from('waitlist')
      .insert({
        company_id: userRecord.company_id,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone,
        preferred_date: preferredDate,
        boat_id: boatId || null,
        passengers: parseInt(passengers),
        notes: notes || null,
        status: 'active',
      })
      .select()
      .single()

    if (waitlistError) {
      console.error('Waitlist error:', waitlistError)
      return NextResponse.json(
        { error: 'Failed to add to waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      waitlistEntry,
      message: 'Customer added to waitlist successfully',
    })
  } catch (error: any) {
    console.error('Add to waitlist API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

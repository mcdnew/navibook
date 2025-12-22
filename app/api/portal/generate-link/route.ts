import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
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

    // Get booking details
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, company_id, customer_name, customer_email')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify booking belongs to user's company
    if (booking.company_id !== userRecord.company_id) {
      return NextResponse.json(
        { error: 'You can only generate portal links for bookings in your company' },
        { status: 403 }
      )
    }

    if (!booking.customer_email) {
      return NextResponse.json(
        { error: 'Booking must have a customer email to generate portal link' },
        { status: 400 }
      )
    }

    // Generate or retrieve portal token
    const { data: tokenData, error: tokenError } = await supabase.rpc('create_portal_token', {
      p_booking_id: bookingId,
      p_customer_email: booking.customer_email,
      p_customer_name: booking.customer_name,
    })

    if (tokenError || !tokenData || tokenData.length === 0) {
      console.error('Token generation error:', tokenError)
      return NextResponse.json({ error: 'Failed to generate portal token' }, { status: 500 })
    }

    const { token, expires_at } = tokenData[0]

    // Construct portal URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''
    const portalUrl = `${baseUrl}/portal/${token}`

    return NextResponse.json({
      success: true,
      portalUrl,
      token,
      expiresAt: expires_at,
      customerEmail: booking.customer_email,
      customerName: booking.customer_name,
    })
  } catch (error: any) {
    console.error('Generate portal link API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

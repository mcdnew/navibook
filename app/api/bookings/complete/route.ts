import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { triggerWebhook } from '@/lib/webhooks'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's company
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update booking status to completed (scoped to company)
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('company_id', userRecord.company_id)
      .eq('status', 'confirmed') // Only complete if currently confirmed
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found or not accessible' },
          { status: 404 }
        )
      }
      console.error('Complete booking error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to mark booking as completed' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Booking not found or not in confirmed status' },
        { status: 404 }
      )
    }

    triggerWebhook(bookingId, 'booking.completed')
    return NextResponse.json({
      success: true,
      message: 'Booking marked as completed',
    })
  } catch (error: any) {
    console.error('Complete booking API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

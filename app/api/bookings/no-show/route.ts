import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
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

    // Update booking status to no_show
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'no_show',
        completed_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('status', 'confirmed') // Only mark no-show if currently confirmed
      .select()
      .single()

    if (error) {
      console.error('No-show booking error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to mark booking as no-show' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Booking not found or not in confirmed status' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Booking marked as no-show',
    })
  } catch (error: any) {
    console.error('No-show booking API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

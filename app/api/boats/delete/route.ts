import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const boatId = searchParams.get('id')

    if (!boatId) {
      return NextResponse.json({ error: 'Boat ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admin and manager can permanently delete boats
    if (!['admin', 'manager'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and managers can delete boats.' },
        { status: 403 }
      )
    }

    // Check if boat has any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('boat_id', boatId)
      .limit(1)

    if (bookingsError) {
      console.error('Check bookings error:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to check boat bookings' },
        { status: 500 }
      )
    }

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete boat with existing bookings. Please deactivate it instead.',
        },
        { status: 400 }
      )
    }

    // Delete the boat
    const { error: deleteError } = await supabase
      .from('boats')
      .delete()
      .eq('id', boatId)
      .eq('company_id', userData.company_id)

    if (deleteError) {
      console.error('Delete boat error:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Failed to delete boat' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Boat deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete boat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { boatId } = await request.json()

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

    // Deactivate boat (soft delete)
    const { data, error } = await supabase
      .from('boats')
      .update({ is_active: false })
      .eq('id', boatId)
      .select()
      .single()

    if (error) {
      console.error('Deactivate boat error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to deactivate boat' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Boat deactivated successfully',
      boat: data,
    })
  } catch (error: any) {
    console.error('Deactivate boat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { boatId, isActive } = await request.json()

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

    // Toggle boat status
    const { data, error } = await supabase
      .from('boats')
      .update({ is_active: isActive })
      .eq('id', boatId)
      .select()
      .single()

    if (error) {
      console.error('Toggle boat status error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update boat status' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Boat ${isActive ? 'activated' : 'deactivated'} successfully`,
      boat: data,
    })
  } catch (error: any) {
    console.error('Toggle boat status API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Blocked slot ID is required' },
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

    // Get user's role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has permission (admin, manager, or power_agent)
    if (!['admin', 'manager', 'power_agent'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete blocked slot (RLS will ensure they can only delete their company's blocks)
    const { error } = await supabase
      .from('blocked_slots')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete blocked slot error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete blocked slot' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Blocked slot deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete blocked slot API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

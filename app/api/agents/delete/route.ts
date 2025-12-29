import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { agentId } = await request.json()

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's role and company
    const { data: currentUser } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admin can delete agents
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete agents' },
        { status: 403 }
      )
    }

    // Get the agent being deleted
    const { data: agentToDelete } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', agentId)
      .single()

    if (!agentToDelete) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Ensure agent belongs to same company
    if (agentToDelete.company_id !== currentUser.company_id) {
      return NextResponse.json(
        { error: 'You can only delete agents from your company' },
        { status: 403 }
      )
    }

    // Prevent deleting yourself
    if (agentId === user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Archive the user by setting is_active to false (preserves historical data)
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', agentId)

    if (updateError) {
      console.error('User archival error:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to archive user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Agent archived successfully',
    })
  } catch (error: any) {
    console.error('Delete agent API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

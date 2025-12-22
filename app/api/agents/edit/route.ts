import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const {
      agentId,
      firstName,
      lastName,
      email,
      phone,
      role,
      commissionPercentage,
      isActive,
    } = await request.json()

    // Validation
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: 'First name, last name, email, and role are required' },
        { status: 400 }
      )
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

    // Only admin and manager can edit agents
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      return NextResponse.json(
        { error: 'Only admins and managers can edit agents' },
        { status: 403 }
      )
    }

    // Get the agent being edited
    const { data: agentToEdit } = await supabase
      .from('users')
      .select('company_id, email')
      .eq('id', agentId)
      .single()

    if (!agentToEdit) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Ensure agent belongs to same company
    if (agentToEdit.company_id !== currentUser.company_id) {
      return NextResponse.json(
        { error: 'You can only edit agents from your company' },
        { status: 403 }
      )
    }

    // If email is being changed, check if new email already exists
    if (email !== agentToEdit.email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', agentId)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      // Update auth email
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(agentId, {
        email,
      })

      if (authError) {
        console.error('Auth email update error:', authError)
        return NextResponse.json(
          { error: authError.message || 'Failed to update email' },
          { status: 500 }
        )
      }
    }

    // Update user record
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        role,
        commission_percentage: commissionPercentage || 0,
        is_active: isActive,
      })
      .eq('id', agentId)
      .select()
      .single()

    if (updateError) {
      console.error('User update error:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to update agent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Agent updated successfully',
      agent: updatedUser,
    })
  } catch (error: any) {
    console.error('Edit agent API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

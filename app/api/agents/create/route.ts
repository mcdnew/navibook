import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      commissionPercentage,
      password,
      isActive,
    } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { error: 'First name, last name, email, password, and role are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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

    // Only admin and manager can create agents
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      return NextResponse.json(
        { error: 'Only admins and managers can create agents' },
        { status: 403 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create auth user using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Failed to create auth user' },
        { status: 500 }
      )
    }

    // Create user record in users table
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        company_id: currentUser.company_id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        role,
        commission_percentage: commissionPercentage || 0,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single()

    if (userError) {
      console.error('User record creation error:', userError)
      // Try to delete the auth user if user record creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: userError.message || 'Failed to create user record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Agent created successfully',
      agent: newUser,
    })
  } catch (error: any) {
    console.error('Create agent API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

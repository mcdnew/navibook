import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch company package configuration
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user and company
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get package config
    const { data: packageConfig, error } = await supabase
      .from('company_package_config')
      .select('*')
      .eq('company_id', userRecord.company_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      packageConfig || {
        company_id: userRecord.company_id,
        drinks_cost_per_person: 0,
        food_cost_per_person: 0,
      }
    )
  } catch (error) {
    console.error('Error fetching package config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update company package configuration
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Check user role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    // Only admin, operations_manager, or office_staff can update package config
    if (!userRecord || !['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { drinksCostPerPerson, foodCostPerPerson } = body

    // Validate inputs
    if (drinksCostPerPerson === undefined || foodCostPerPerson === undefined) {
      return NextResponse.json(
        { error: 'drinksCostPerPerson and foodCostPerPerson are required' },
        { status: 400 }
      )
    }

    if (drinksCostPerPerson < 0 || foodCostPerPerson < 0) {
      return NextResponse.json(
        { error: 'Costs cannot be negative' },
        { status: 400 }
      )
    }

    // Upsert package config
    const { data: packageConfig, error } = await supabase
      .from('company_package_config')
      .upsert(
        {
          company_id: userRecord.company_id,
          drinks_cost_per_person: parseFloat(drinksCostPerPerson),
          food_cost_per_person: parseFloat(foodCostPerPerson),
        },
        { onConflict: 'company_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(packageConfig)
  } catch (error) {
    console.error('Error updating package config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Reset package configuration to defaults
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check user role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    // Only admin, operations_manager, or office_staff can delete package config
    if (!userRecord || !['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete package config (will be recreated on next read with defaults)
    const { error } = await supabase
      .from('company_package_config')
      .delete()
      .eq('company_id', userRecord.company_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting package config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

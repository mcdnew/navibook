import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch fuel configuration for a specific boat
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const boatId = searchParams.get('boatId')

    if (!boatId) {
      return NextResponse.json({ error: 'boatId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user has access to this boat
    const { data: boat } = await supabase
      .from('boats')
      .select('company_id')
      .eq('id', boatId)
      .single()

    if (!boat) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
    }

    // Get fuel config
    const { data: fuelConfig, error } = await supabase
      .from('boat_fuel_config')
      .select('*')
      .eq('boat_id', boatId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(fuelConfig || null)
  } catch (error) {
    console.error('Error fetching fuel config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update fuel configuration for a boat
export async function POST(request: Request) {
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

    // Only admin, operations_manager, or office_staff can create/update fuel config
    if (!userRecord || !['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { boatId, fuelConsumptionRate, fuelPricePerLiter, notes } = body

    if (!boatId || fuelConsumptionRate === undefined || fuelPricePerLiter === undefined) {
      return NextResponse.json(
        { error: 'boatId, fuelConsumptionRate, and fuelPricePerLiter are required' },
        { status: 400 }
      )
    }

    if (fuelConsumptionRate <= 0 || fuelPricePerLiter <= 0) {
      return NextResponse.json(
        { error: 'fuelConsumptionRate and fuelPricePerLiter must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify boat belongs to user's company
    const { data: boat } = await supabase
      .from('boats')
      .select('company_id')
      .eq('id', boatId)
      .single()

    if (!boat || boat.company_id !== userRecord.company_id) {
      return NextResponse.json({ error: 'Boat not found or access denied' }, { status: 404 })
    }

    // Upsert fuel config
    const { data: fuelConfig, error } = await supabase
      .from('boat_fuel_config')
      .upsert(
        {
          boat_id: boatId,
          fuel_consumption_rate: parseFloat(fuelConsumptionRate),
          fuel_price_per_liter: parseFloat(fuelPricePerLiter),
          notes: notes || null,
        },
        { onConflict: 'boat_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(fuelConfig)
  } catch (error) {
    console.error('Error creating/updating fuel config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove fuel configuration for a boat
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

    // Only admin, operations_manager, or office_staff can delete fuel config
    if (!userRecord || !['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const boatId = searchParams.get('boatId')

    if (!boatId) {
      return NextResponse.json({ error: 'boatId is required' }, { status: 400 })
    }

    // Verify boat belongs to user's company
    const { data: boat } = await supabase
      .from('boats')
      .select('company_id')
      .eq('id', boatId)
      .single()

    if (!boat || boat.company_id !== userRecord.company_id) {
      return NextResponse.json({ error: 'Boat not found or access denied' }, { status: 404 })
    }

    // Delete fuel config
    const { error } = await supabase
      .from('boat_fuel_config')
      .delete()
      .eq('boat_id', boatId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fuel config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

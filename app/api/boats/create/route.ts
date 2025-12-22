import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { name, boatType, capacity, description, licenseNumber, imageUrl } =
      await request.json()

    // Validation
    if (!name || !boatType || !capacity) {
      return NextResponse.json(
        { error: 'Name, boat type, and capacity are required' },
        { status: 400 }
      )
    }

    if (capacity < 1) {
      return NextResponse.json(
        { error: 'Capacity must be at least 1' },
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

    // Get user's company
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create boat
    const { data, error } = await supabase
      .from('boats')
      .insert({
        company_id: userRecord.company_id,
        name: name.trim(),
        boat_type: boatType,
        capacity: capacity,
        description: description || null,
        license_number: licenseNumber || null,
        image_url: imageUrl || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Create boat error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create boat' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Boat created successfully',
      boat: data,
    })
  } catch (error: any) {
    console.error('Create boat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

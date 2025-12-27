import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { boatId, name, boatType, capacity, description, licenseNumber, imageUrl, defaultCaptainId } =
      await request.json()

    // Validation
    if (!boatId) {
      return NextResponse.json({ error: 'Boat ID is required' }, { status: 400 })
    }

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

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      boat_type: boatType,
      capacity: capacity,
      description: description || null,
      license_number: licenseNumber || null,
      image_url: imageUrl || null,
    }

    // Handle default captain (can be null to clear, undefined to skip)
    if (defaultCaptainId !== undefined) {
      updateData.default_captain_id = defaultCaptainId || null
    }

    // Update boat
    const { data, error } = await supabase
      .from('boats')
      .update(updateData)
      .eq('id', boatId)
      .select(`
        *,
        default_captain:users!boats_default_captain_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) {
      console.error('Update boat error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update boat' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Boat not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Boat updated successfully',
      boat: data,
    })
  } catch (error: any) {
    console.error('Update boat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

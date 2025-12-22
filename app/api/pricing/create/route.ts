import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { boatId, duration, packageType, price } = await request.json()

    // Validation
    if (!boatId || !duration || !packageType || price === undefined) {
      return NextResponse.json(
        { error: 'Boat, duration, package type, and price are required' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if pricing already exists
    const { data: existing } = await supabase
      .from('pricing')
      .select('id')
      .eq('boat_id', boatId)
      .eq('duration', duration)
      .eq('package_type', packageType)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Pricing for this combination already exists. Please edit instead.' },
        { status: 409 }
      )
    }

    // Create pricing
    const { data, error } = await supabase
      .from('pricing')
      .insert({
        boat_id: boatId,
        duration,
        package_type: packageType,
        price,
      })
      .select()
      .single()

    if (error) {
      console.error('Create pricing error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create pricing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing created successfully',
      pricing: data,
    })
  } catch (error: any) {
    console.error('Create pricing API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

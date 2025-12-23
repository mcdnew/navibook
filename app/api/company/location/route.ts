import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Retrieve company location
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's company ID
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get company location
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name, latitude, longitude, location_name')
      .eq('id', userRecord.company_id)
      .single()

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Return location with defaults if not set
    return NextResponse.json({
      success: true,
      location: {
        latitude: company.latitude || 41.3851, // Default Barcelona
        longitude: company.longitude || 2.1734,
        location_name: company.location_name || 'Default Location',
      },
      company_id: company.id,
      company_name: company.name,
    })
  } catch (error: any) {
    console.error('Get company location API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update company location (ADMIN ONLY)
export async function PUT(request: Request) {
  try {
    const { latitude, longitude, location_name } = await request.json()

    // Validate input
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Validate coordinate ranges
    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Latitude and longitude must be valid numbers' },
        { status: 400 }
      )
    }

    if (lat < -90 || lat > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      )
    }

    if (lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's role and company ID
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    if (userRecord.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update company location' },
        { status: 403 }
      )
    }

    // Update company location
    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        latitude: lat,
        longitude: lon,
        location_name: location_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      })
      .eq('id', userRecord.company_id)
      .select('id, name, latitude, longitude, location_name')
      .single()

    if (error) {
      console.error('Update company location error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update company location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Company location updated successfully',
      location: {
        latitude: updatedCompany.latitude,
        longitude: updatedCompany.longitude,
        location_name: updatedCompany.location_name,
      },
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
      },
    })
  } catch (error: any) {
    console.error('Update company location API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

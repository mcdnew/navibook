import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Retrieve company info
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

    // Get company info
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name, email, phone, address')
      .eq('id', userRecord.company_id)
      .single()

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      company,
    })
  } catch (error: any) {
    console.error('Get company info API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update company info (ADMIN ONLY)
export async function PUT(request: Request) {
  try {
    const { name, email, phone, address } = await request.json()

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
        { error: 'Only admins can update company information' },
        { status: 403 }
      )
    }

    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Update company info
    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      })
      .eq('id', userRecord.company_id)
      .select('id, name, email, phone, address')
      .single()

    if (error) {
      console.error('Update company info error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update company information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Company information updated successfully',
      company: updatedCompany,
    })
  } catch (error: any) {
    console.error('Update company info API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

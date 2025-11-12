import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()

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
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update object (only include provided fields)
    const updateData: any = {}
    if (body.customerName !== undefined) updateData.customer_name = body.customerName
    if (body.customerEmail !== undefined) updateData.customer_email = body.customerEmail
    if (body.customerPhone !== undefined) updateData.customer_phone = body.customerPhone
    if (body.preferredDate !== undefined) updateData.preferred_date = body.preferredDate
    if (body.boatId !== undefined) updateData.boat_id = body.boatId
    if (body.passengers !== undefined) updateData.passengers = parseInt(body.passengers)
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.status !== undefined) updateData.status = body.status
    if (body.priority !== undefined) updateData.priority = parseInt(body.priority)

    // Update waitlist entry (RLS ensures same company)
    const { data, error } = await supabase
      .from('waitlist')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', userRecord.company_id)
      .select()
      .single()

    if (error) {
      console.error('Update waitlist error:', error)
      return NextResponse.json(
        { error: 'Failed to update waitlist entry' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Waitlist entry updated successfully',
    })
  } catch (error: any) {
    console.error('Update waitlist API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

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
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete waitlist entry (RLS ensures same company)
    const { error } = await supabase
      .from('waitlist')
      .delete()
      .eq('id', id)
      .eq('company_id', userRecord.company_id)

    if (error) {
      console.error('Delete waitlist error:', error)
      return NextResponse.json(
        { error: 'Failed to delete waitlist entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Waitlist entry deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete waitlist API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

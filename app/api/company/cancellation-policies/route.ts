import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch all cancellation policies for company
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

    // Get all active cancellation policies
    const { data: policies, error } = await supabase
      .from('cancellation_policies')
      .select('*')
      .eq('company_id', userRecord.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(policies || [])
  } catch (error) {
    console.error('Error fetching cancellation policies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new cancellation policy
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

    // Only admin, operations_manager, or office_staff can create policies
    if (!userRecord || !['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      policyName,
      refundBefore7Days,
      refundBefore3Days,
      refundBefore1Day,
      description,
    } = body

    // Validate inputs
    if (!policyName) {
      return NextResponse.json(
        { error: 'Policy name is required' },
        { status: 400 }
      )
    }

    if (
      refundBefore7Days === undefined ||
      refundBefore3Days === undefined ||
      refundBefore1Day === undefined
    ) {
      return NextResponse.json(
        { error: 'All refund percentages are required' },
        { status: 400 }
      )
    }

    // Validate percentages
    const percentages = [refundBefore7Days, refundBefore3Days, refundBefore1Day]
    if (percentages.some(p => p < 0 || p > 100)) {
      return NextResponse.json(
        { error: 'Refund percentages must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Create policy
    const { data: policy, error } = await supabase
      .from('cancellation_policies')
      .insert({
        company_id: userRecord.company_id,
        policy_name: policyName,
        refund_before_7_days: parseFloat(refundBefore7Days),
        refund_before_3_days: parseFloat(refundBefore3Days),
        refund_before_1_day: parseFloat(refundBefore1Day),
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Policy name "${policyName}" already exists for your company` },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(policy, { status: 201 })
  } catch (error) {
    console.error('Error creating cancellation policy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing cancellation policy
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

    // Only admin, operations_manager, or office_staff can update policies
    if (!userRecord || !['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      policyId,
      policyName,
      refundBefore7Days,
      refundBefore3Days,
      refundBefore1Day,
      description,
      isActive,
    } = body

    // Validate inputs
    if (!policyId) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      )
    }

    // Verify policy belongs to company
    const { data: existingPolicy } = await supabase
      .from('cancellation_policies')
      .select('id, company_id')
      .eq('id', policyId)
      .single()

    if (!existingPolicy || existingPolicy.company_id !== userRecord.company_id) {
      return NextResponse.json(
        { error: 'Policy not found or unauthorized' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (policyName) updateData.policy_name = policyName
    if (refundBefore7Days !== undefined) {
      if (refundBefore7Days < 0 || refundBefore7Days > 100) {
        return NextResponse.json(
          { error: 'Refund percentage must be between 0 and 100' },
          { status: 400 }
        )
      }
      updateData.refund_before_7_days = parseFloat(refundBefore7Days)
    }
    if (refundBefore3Days !== undefined) {
      if (refundBefore3Days < 0 || refundBefore3Days > 100) {
        return NextResponse.json(
          { error: 'Refund percentage must be between 0 and 100' },
          { status: 400 }
        )
      }
      updateData.refund_before_3_days = parseFloat(refundBefore3Days)
    }
    if (refundBefore1Day !== undefined) {
      if (refundBefore1Day < 0 || refundBefore1Day > 100) {
        return NextResponse.json(
          { error: 'Refund percentage must be between 0 and 100' },
          { status: 400 }
        )
      }
      updateData.refund_before_1_day = parseFloat(refundBefore1Day)
    }
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.is_active = isActive

    // Update policy
    const { data: policy, error } = await supabase
      .from('cancellation_policies')
      .update(updateData)
      .eq('id', policyId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Policy name "${policyName}" already exists for your company` },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error updating cancellation policy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete cancellation policy
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

    // Only admin, operations_manager, or office_staff can delete policies
    if (!userRecord || !['admin', 'operations_manager', 'office_staff'].includes(userRecord.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const policyId = searchParams.get('id')

    if (!policyId) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      )
    }

    // Verify policy belongs to company
    const { data: existingPolicy } = await supabase
      .from('cancellation_policies')
      .select('id, company_id, policy_name')
      .eq('id', policyId)
      .single()

    if (!existingPolicy || existingPolicy.company_id !== userRecord.company_id) {
      return NextResponse.json(
        { error: 'Policy not found or unauthorized' },
        { status: 404 }
      )
    }

    // Prevent deletion of "Standard" policy if it's the only active policy
    const { data: activePolicies } = await supabase
      .from('cancellation_policies')
      .select('id, policy_name')
      .eq('company_id', userRecord.company_id)
      .eq('is_active', true)

    if (
      existingPolicy.policy_name === 'Standard' &&
      activePolicies &&
      activePolicies.length === 1
    ) {
      return NextResponse.json(
        { error: 'Cannot delete the Standard policy. At least one active policy is required.' },
        { status: 400 }
      )
    }

    // Delete policy
    const { error } = await supabase
      .from('cancellation_policies')
      .delete()
      .eq('id', policyId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cancellation policy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

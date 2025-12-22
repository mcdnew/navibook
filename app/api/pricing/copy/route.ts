import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { fromBoatId, toBoatId } = await request.json()

    // Validation
    if (!fromBoatId || !toBoatId) {
      return NextResponse.json(
        { error: 'Source and destination boat IDs are required' },
        { status: 400 }
      )
    }

    if (fromBoatId === toBoatId) {
      return NextResponse.json(
        { error: 'Source and destination boats cannot be the same' },
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

    // Verify both boats belong to user's company
    const { data: boats } = await supabase
      .from('boats')
      .select('id, name')
      .eq('company_id', userRecord.company_id)
      .in('id', [fromBoatId, toBoatId])

    if (!boats || boats.length !== 2) {
      return NextResponse.json(
        { error: 'One or both boats not found or do not belong to your company' },
        { status: 404 }
      )
    }

    // Get all pricing from source boat
    const { data: sourcePricing, error: fetchError } = await supabase
      .from('pricing')
      .select('duration, package_type, price')
      .eq('boat_id', fromBoatId)

    if (fetchError) {
      console.error('Fetch pricing error:', fetchError)
      return NextResponse.json(
        { error: fetchError.message || 'Failed to fetch source pricing' },
        { status: 500 }
      )
    }

    if (!sourcePricing || sourcePricing.length === 0) {
      return NextResponse.json(
        { error: 'No pricing found for source boat' },
        { status: 404 }
      )
    }

    // Delete existing pricing for destination boat
    const { error: deleteError } = await supabase
      .from('pricing')
      .delete()
      .eq('boat_id', toBoatId)

    if (deleteError) {
      console.error('Delete existing pricing error:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Failed to delete existing pricing' },
        { status: 500 }
      )
    }

    // Insert new pricing for destination boat
    const newPricing = sourcePricing.map((p) => ({
      boat_id: toBoatId,
      duration: p.duration,
      package_type: p.package_type,
      price: p.price,
    }))

    const { data: insertedPricing, error: insertError } = await supabase
      .from('pricing')
      .insert(newPricing)
      .select()

    if (insertError) {
      console.error('Insert pricing error:', insertError)
      return NextResponse.json(
        { error: insertError.message || 'Failed to insert new pricing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully copied ${insertedPricing.length} pricing entries`,
      count: insertedPricing.length,
    })
  } catch (error: any) {
    console.error('Copy pricing API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

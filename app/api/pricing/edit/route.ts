import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { pricingId, price } = await request.json()

    // Validation
    if (!pricingId || price === undefined) {
      return NextResponse.json(
        { error: 'Pricing ID and price are required' },
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

    // Update pricing
    const { data, error } = await supabase
      .from('pricing')
      .update({ price })
      .eq('id', pricingId)
      .select()
      .single()

    if (error) {
      console.error('Update pricing error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update pricing' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing updated successfully',
      pricing: data,
    })
  } catch (error: any) {
    console.error('Update pricing API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

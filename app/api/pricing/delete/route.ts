import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { pricingId } = await request.json()

    if (!pricingId) {
      return NextResponse.json({ error: 'Pricing ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete pricing
    const { data, error } = await supabase
      .from('pricing')
      .delete()
      .eq('id', pricingId)
      .select()
      .single()

    if (error) {
      console.error('Delete pricing error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete pricing' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete pricing API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

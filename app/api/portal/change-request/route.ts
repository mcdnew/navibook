import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, requestType, currentValue, requestedValue, customerMessage } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify token and get booking ID
    const { data: tokenData, error: tokenError } = await supabase.rpc('verify_portal_token', {
      p_token: token,
    })

    if (tokenError || !tokenData || tokenData.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { booking_id, company_id } = tokenData[0]

    // Create change request
    const { data: changeRequest, error: insertError } = await supabase
      .from('customer_change_requests')
      .insert({
        booking_id,
        company_id,
        request_type: requestType,
        current_value: currentValue,
        requested_value: requestedValue,
        customer_message: customerMessage,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Change request insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create change request' }, { status: 500 })
    }

    // TODO: Send notification to company about new change request

    return NextResponse.json({
      success: true,
      changeRequest,
      message: 'Change request submitted successfully',
    })
  } catch (error: any) {
    console.error('Portal change request API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

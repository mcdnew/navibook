import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const resend = new Resend(process.env.RESEND_API_KEY)


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

    // Notify company about the new change request
    try {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('booking_date, start_time, customer_name, boats(name), companies(name, email)')
        .eq('id', booking_id)
        .single()

      if (bookingData) {
        const company = Array.isArray(bookingData.companies) ? bookingData.companies[0] : bookingData.companies
        const boat = Array.isArray(bookingData.boats) ? bookingData.boats[0] : bookingData.boats
        if (company?.email && process.env.RESEND_API_KEY) {
          const requestTypeLabel: Record<string, string> = {
            date_change: 'Date Change',
            time_change: 'Time Change',
            package_change: 'Package Change',
            participant_count: 'Participant Count Change',
            cancellation: 'Cancellation',
            other: 'Other',
          }
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
          await resend.emails.send({
            from: fromEmail,
            to: company.email,
            subject: `New Change Request from ${bookingData.customer_name}`,
            html: `
              <h2>New Customer Change Request</h2>
              <p>A customer has submitted a change request via their booking portal.</p>
              <table cellpadding="8" style="border-collapse:collapse;">
                <tr><td><strong>Customer:</strong></td><td>${bookingData.customer_name}</td></tr>
                <tr><td><strong>Booking Date:</strong></td><td>${bookingData.booking_date} at ${bookingData.start_time}</td></tr>
                <tr><td><strong>Boat:</strong></td><td>${boat?.name || '—'}</td></tr>
                <tr><td><strong>Request Type:</strong></td><td>${requestTypeLabel[requestType] || requestType}</td></tr>
                <tr><td><strong>Current Value:</strong></td><td>${currentValue || '—'}</td></tr>
                <tr><td><strong>Requested Value:</strong></td><td>${requestedValue || '—'}</td></tr>
                ${customerMessage ? `<tr><td><strong>Message:</strong></td><td>${customerMessage}</td></tr>` : ''}
              </table>
              <p>Please log in to NaviBook to review and respond to this request.</p>
            `,
          })
        }
      }
    } catch (notifError) {
      // Don't fail the request if notification fails
      console.error('Change request notification error:', notifError)
    }

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

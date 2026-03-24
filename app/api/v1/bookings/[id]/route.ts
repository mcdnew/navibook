import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate
    const apiKeyResult = await validateApiKey(request)
    if (!apiKeyResult) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }
    if (apiKeyResult.revoked) {
      return NextResponse.json({ error: 'API key has been revoked' }, { status: 401 })
    }

    // Rate limit
    if (!checkRateLimit(apiKeyResult.keyId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Maximum 60 requests per minute.' }, { status: 429 })
    }

    const { companyId } = apiKeyResult
    const { id } = params

    const supabase = createAdminClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        booking_date,
        start_time,
        end_time,
        duration,
        passengers,
        package_type,
        total_price,
        fuel_cost,
        package_addon_cost,
        customer_name,
        customer_phone,
        customer_email,
        notes,
        source,
        created_at,
        updated_at,
        boats(name)
      `)
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({
      booking_id: booking.id,
      status: booking.status,
      boat_name: (booking.boats as unknown as { name: string } | null)?.name || null,
      date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      duration: booking.duration,
      passengers: booking.passengers,
      package_type: booking.package_type,
      total_price: booking.total_price,
      fuel_cost: booking.fuel_cost,
      package_addon_cost: booking.package_addon_cost,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      customer_email: booking.customer_email,
      notes: booking.notes,
      source: booking.source,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('v1/bookings/[id] GET error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Use service role to bypass RLS for token verification
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

    const { booking_id, customer_email, customer_name } = tokenData[0]

    // Fetch booking details with all related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        boats (
          id,
          name,
          type,
          capacity,
          description,
          hourly_rate,
          daily_rate,
          image_url
        ),
        companies (
          id,
          name,
          email,
          phone,
          address
        )
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Fetch payment transactions
    const { data: payments } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('booking_id', booking_id)
      .order('payment_date', { ascending: false })

    // Calculate payment summary
    const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const amountDue = booking.total_price - totalPaid

    // Fetch change requests
    const { data: changeRequests } = await supabase
      .from('customer_change_requests')
      .select('*')
      .eq('booking_id', booking_id)
      .order('created_at', { ascending: false })

    // Fetch weather forecast if booking is in the future
    let weatherData = null
    if (new Date(booking.booking_date) >= new Date()) {
      try {
        const weatherResponse = await fetch(
          `${process.env.OPEN_METEO_API_URL || 'https://marine-api.open-meteo.com/v1/marine'}?` +
            `latitude=${booking.boats?.latitude || 41.3851}&` +
            `longitude=${booking.boats?.longitude || 2.1734}&` +
            `start_date=${booking.booking_date}&` +
            `end_date=${booking.booking_date}&` +
            `hourly=wave_height,wind_speed_10m,temperature_2m,precipitation&` +
            `timezone=auto`
        )
        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json()
        }
      } catch (error) {
        console.error('Weather fetch error:', error)
      }
    }

    return NextResponse.json({
      booking,
      payments,
      changeRequests,
      weatherData,
      paymentSummary: {
        totalPrice: booking.total_price,
        totalPaid,
        amountDue,
        status: amountDue <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid',
      },
      customerInfo: {
        email: customer_email,
        name: customer_name,
      },
    })
  } catch (error: any) {
    console.error('Portal booking API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

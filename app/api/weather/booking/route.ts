import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchMarineWeather, assessWeatherSuitability } from '@/lib/weather/weather-service'
export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const { bookingDate, startTime, boatType } = await request.json()

    if (!bookingDate || !startTime) {
      return NextResponse.json(
        { error: 'Missing booking date or start time' },
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

    // Get company location
    const { data: company } = await supabase
      .from('companies')
      .select('latitude, longitude, location_name')
      .eq('id', userRecord.company_id)
      .single()

    // Use company coordinates or fallback to default
    const latitude = company?.latitude || 41.3851 // Default: Barcelona
    const longitude = company?.longitude || 2.1734

    const forecasts = await fetchMarineWeather(latitude, longitude, 7)

    // Find forecast for the specific date and closest time
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`)
    const bookingHour = bookingDateTime.getHours()

    // Find closest forecast
    const relevantForecasts = forecasts.filter((f) => f.date === bookingDate)

    if (relevantForecasts.length === 0) {
      return NextResponse.json(
        { error: 'No weather data available for this date' },
        { status: 404 }
      )
    }

    // Get forecast closest to booking time
    const closestForecast = relevantForecasts.reduce((prev, curr) => {
      const prevHour = parseInt(prev.time.split(':')[0])
      const currHour = parseInt(curr.time.split(':')[0])

      const prevDiff = Math.abs(prevHour - bookingHour)
      const currDiff = Math.abs(currHour - bookingHour)

      return currDiff < prevDiff ? curr : prev
    })

    // Assess suitability
    const suitability = assessWeatherSuitability(closestForecast, boatType || 'motorboat')

    return NextResponse.json({
      success: true,
      forecast: closestForecast,
      suitability,
      bookingDate,
      startTime,
    })
  } catch (error: any) {
    console.error('Weather booking check API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check weather for booking' },
      { status: 500 }
    )
  }
}

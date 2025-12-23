import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchMarineWeather, getDailySummary } from '@/lib/weather/weather-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

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
    const locationName = company?.location_name || 'Default Location'

    // Fetch weather data from Open-Meteo
    const forecasts = await fetchMarineWeather(latitude, longitude, days)

    // Get daily summaries
    const dailySummaries = getDailySummary(forecasts)

    // Store forecasts in database for historical tracking
    const forecastsToStore = forecasts.filter((f) => {
      const hour = parseInt(f.time.split(':')[0])
      // Only store key hours: 9am, 12pm, 3pm, 6pm
      return [9, 12, 15, 18].includes(hour)
    })

    // Upsert weather forecasts to database
    if (userRecord) {
      // Upsert weather forecasts
      const weatherData = forecastsToStore.map((f) => ({
        company_id: userRecord.company_id,
        forecast_date: f.date,
        forecast_time: f.time,
        wave_height: f.waveHeight,
        wind_speed: f.windSpeed,
        wind_direction: f.windDirection,
        temperature: f.temperature,
        precipitation_probability: f.precipitationProbability,
        weather_code: f.weatherCode,
        latitude,
        longitude,
      }))

      // Insert/update weather data
      await supabase.from('weather_forecasts').upsert(weatherData, {
        onConflict: 'company_id,forecast_date,forecast_time',
        ignoreDuplicates: false,
      })
    }

    return NextResponse.json({
      success: true,
      forecasts,
      dailySummaries,
      location: {
        latitude,
        longitude,
        name: locationName,
      },
    })
  } catch (error: any) {
    console.error('Weather forecast API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weather forecast' },
      { status: 500 }
    )
  }
}

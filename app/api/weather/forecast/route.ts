import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchMarineWeather, getDailySummary } from '@/lib/weather/weather-service'

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

    // Get user's company to determine location
    // For now, using default Mediterranean coordinates
    // In production, companies would have their location stored
    const latitude = 41.3851 // Barcelona area
    const longitude = 2.1734

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

    // Get user's company
    const { data: userRecord } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

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
        name: 'Mediterranean Coast',
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

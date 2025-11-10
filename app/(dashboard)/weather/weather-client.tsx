'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface DailySummary {
  date: string
  avgWaveHeight: number
  maxWaveHeight: number
  avgWindSpeed: number
  maxWindSpeed: number
  avgTemperature: number
  maxPrecipitationProbability: number
  weatherCode: number
  hourlyForecasts: any[]
}

export default function WeatherClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null)

  useEffect(() => {
    fetchWeatherForecast()
  }, [])

  const fetchWeatherForecast = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/weather/forecast?days=7')
      if (!response.ok) {
        throw new Error('Failed to fetch weather forecast')
      }

      const data = await response.json()
      setDailySummaries(data.dailySummaries || [])

      if (data.dailySummaries && data.dailySummaries.length > 0) {
        setSelectedDay(data.dailySummaries[0])
      }
    } catch (error: any) {
      console.error('Error fetching weather:', error)
      toast.error('Failed to load weather forecast')
    } finally {
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (code: number): string => {
    if (code === 0 || code === 1) return '☀️'
    if (code === 2) return '⛅'
    if (code === 3) return '☁️'
    if (code >= 45 && code <= 48) return '🌫️'
    if (code >= 51 && code <= 55) return '🌦️'
    if (code >= 61 && code <= 65) return '🌧️'
    if (code >= 71 && code <= 77) return '❄️'
    if (code >= 80 && code <= 82) return '🌧️'
    if (code >= 85 && code <= 86) return '🌨️'
    if (code >= 95 && code <= 99) return '⛈️'
    return '🌤️'
  }

  const getWeatherCodeDescription = (code: number): string => {
    const codes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
    }
    return codes[code] || 'Variable'
  }

  const getSafetyBadge = (waveHeight: number, windSpeed: number) => {
    if (waveHeight >= 3 || windSpeed >= 40) {
      return <Badge className="bg-red-100 text-red-700">⚠️ Not Safe</Badge>
    } else if (waveHeight >= 2 || windSpeed >= 30) {
      return <Badge className="bg-yellow-100 text-yellow-700">⚡ Caution</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-700">✓ Good</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading weather data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 7-Day Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {dailySummaries.map((day) => (
          <Card
            key={day.date}
            className={`cursor-pointer transition-all ${
              selectedDay?.date === day.date ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedDay(day)}
          >
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">{formatDate(day.date)}</p>
                <div className="text-4xl">{getWeatherIcon(day.weatherCode)}</div>
                <p className="text-2xl font-bold">{Math.round(day.avgTemperature)}°C</p>
                <p className="text-xs text-muted-foreground">{getWeatherCodeDescription(day.weatherCode)}</p>

                <div className="pt-2 border-t space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>🌊 Waves</span>
                    <span className="font-medium">{day.maxWaveHeight.toFixed(1)}m</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>💨 Wind</span>
                    <span className="font-medium">{Math.round(day.maxWindSpeed)} km/h</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>💧 Rain</span>
                    <span className="font-medium">{day.maxPrecipitationProbability}%</span>
                  </div>
                </div>

                <div className="pt-2">
                  {getSafetyBadge(day.maxWaveHeight, day.maxWindSpeed)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Forecast */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Forecast - {formatDate(selectedDay.date)}</CardTitle>
            <CardDescription>Hourly breakdown for selected day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl mb-2">🌊</p>
                    <p className="text-2xl font-bold">{selectedDay.maxWaveHeight.toFixed(1)}m</p>
                    <p className="text-sm text-muted-foreground">Max Wave Height</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg: {selectedDay.avgWaveHeight.toFixed(1)}m</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl mb-2">💨</p>
                    <p className="text-2xl font-bold">{Math.round(selectedDay.maxWindSpeed)} km/h</p>
                    <p className="text-sm text-muted-foreground">Max Wind Speed</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg: {Math.round(selectedDay.avgWindSpeed)} km/h</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl mb-2">🌡️</p>
                    <p className="text-2xl font-bold">{Math.round(selectedDay.avgTemperature)}°C</p>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-xs text-muted-foreground mt-1">Average daytime</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl mb-2">💧</p>
                    <p className="text-2xl font-bold">{selectedDay.maxPrecipitationProbability}%</p>
                    <p className="text-sm text-muted-foreground">Rain Probability</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum chance</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Forecast Table */}
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Time</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Conditions</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Temp</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Waves</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Wind</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Rain</th>
                      <th className="px-4 py-2 text-center text-sm font-medium">Safety</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedDay.hourlyForecasts
                      .filter((h) => {
                        const hour = parseInt(h.time.split(':')[0])
                        return hour >= 7 && hour <= 20 // Show 7am to 8pm
                      })
                      .map((forecast, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 text-sm font-medium">{forecast.time}</td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getWeatherIcon(forecast.weatherCode)}</span>
                              <span className="text-xs text-muted-foreground">
                                {getWeatherCodeDescription(forecast.weatherCode)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-right">{Math.round(forecast.temperature)}°C</td>
                          <td className="px-4 py-2 text-sm text-right">{forecast.waveHeight.toFixed(1)}m</td>
                          <td className="px-4 py-2 text-sm text-right">{Math.round(forecast.windSpeed)} km/h</td>
                          <td className="px-4 py-2 text-sm text-right">{forecast.precipitationProbability}%</td>
                          <td className="px-4 py-2 text-center">
                            {getSafetyBadge(forecast.waveHeight, forecast.windSpeed)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Information */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">⚓ Marine Weather Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-green-700 dark:text-green-400 mb-2">✓ Good Conditions</p>
              <ul className="space-y-1 text-xs">
                <li>• Wave height &lt; 1m</li>
                <li>• Wind speed &lt; 25 km/h</li>
                <li>• Low precipitation probability</li>
                <li>• Clear or partly cloudy</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">⚡ Caution Advised</p>
              <ul className="space-y-1 text-xs">
                <li>• Wave height 1-2m</li>
                <li>• Wind speed 25-35 km/h</li>
                <li>• Moderate rain probability</li>
                <li>• Monitor conditions closely</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-red-700 dark:text-red-400 mb-2">⚠️ Not Recommended</p>
              <ul className="space-y-1 text-xs">
                <li>• Wave height &gt; 2m</li>
                <li>• Wind speed &gt; 35 km/h</li>
                <li>• High precipitation/storms</li>
                <li>• Consider rescheduling</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Data provided by Open-Meteo Marine Weather API. Forecasts updated every 6 hours. Always check current conditions before departure.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={fetchWeatherForecast} variant="outline">
          🔄 Refresh Forecast
        </Button>
      </div>
    </div>
  )
}

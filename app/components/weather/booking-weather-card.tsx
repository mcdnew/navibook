'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CloudSun, AlertCircle, Loader2 } from 'lucide-react'
import { kmhToKnots, getWindDirectionEmoji, getWindDirection } from '@/lib/weather/weather-service'

interface BookingWeatherCardProps {
  date: string
  startTime: string
  loading: boolean
  weatherData?: {
    temperature: number
    windSpeed: number
    windDirection: number
    waveHeight: number
    precipitationProbability: number
    weatherCode: number
  } | null
  safetyBadge?: React.ReactNode
}

export default function BookingWeatherCard({
  date,
  startTime,
  loading,
  weatherData,
  safetyBadge,
}: BookingWeatherCardProps) {
  // Format date for display
  const dateObj = new Date(date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const getSafetyInfo = () => {
    if (!weatherData) return null

    const windKnots = kmhToKnots(weatherData.windSpeed)
    const { waveHeight, precipitationProbability } = weatherData

    if (waveHeight > 2 || windKnots >= 19) {
      return {
        status: 'Not Recommended',
        color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
        textColor: 'text-red-700 dark:text-red-200',
        icon: '⚠️',
      }
    } else if (waveHeight >= 2 || windKnots >= 13.5) {
      return {
        status: 'Caution Advised',
        color: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-700 dark:text-yellow-200',
        icon: '⚡',
      }
    } else {
      return {
        status: 'Good Conditions',
        color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        textColor: 'text-green-700 dark:text-green-200',
        icon: '✓',
      }
    }
  }

  const safetyInfo = getSafetyInfo()

  return (
    <Card className="border-2 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Weather Forecast</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            {formattedDate} at {startTime}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading weather data...</span>
          </div>
        ) : !weatherData ? (
          <div className={`p-4 rounded-lg border-2 ${safetyInfo?.color || 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Weather data not available yet</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Weather forecasts are available for dates within the next 7 days. Check back closer to your booking date for more accurate data.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Safety Status */}
            {safetyInfo && (
              <div className={`p-4 rounded-lg border-2 ${safetyInfo.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{safetyInfo.icon}</span>
                  <p className={`font-semibold ${safetyInfo.textColor}`}>
                    {safetyInfo.status}
                  </p>
                </div>
              </div>
            )}

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Temperature */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Temperature</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {Math.round(weatherData.temperature)}°C
                </p>
              </div>

              {/* Wind */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Wind</p>
                <div className="flex items-center gap-1">
                  <span className="text-lg">{getWindDirectionEmoji(weatherData.windDirection)}</span>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {kmhToKnots(weatherData.windSpeed).toFixed(1)}kts
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {getWindDirection(weatherData.windDirection)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Waves */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Waves</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {weatherData.waveHeight.toFixed(1)}m
                </p>
              </div>

              {/* Rain Probability */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Rain</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {weatherData.precipitationProbability}%
                </p>
              </div>
            </div>

            {/* Recommendation Message */}
            {safetyInfo && (
              <div className="text-sm mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {safetyInfo.status === 'Good Conditions' && (
                  <p>🟢 Excellent conditions for boating. Proceed with confidence.</p>
                )}
                {safetyInfo.status === 'Caution Advised' && (
                  <p>🟡 Fair conditions. Monitor weather closely before departure and adjust trip if needed.</p>
                )}
                {safetyInfo.status === 'Not Recommended' && (
                  <p>🔴 Challenging conditions detected. Consider rescheduling to a different date or time.</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

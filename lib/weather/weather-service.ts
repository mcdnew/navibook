// Weather service using Open-Meteo Marine API
// Free, no API key required, perfect for marine weather data

interface WeatherForecast {
  date: string
  time: string
  waveHeight: number
  windSpeed: number
  windDirection: number
  temperature: number
  precipitationProbability: number
  weatherCode: number
}

interface WeatherSuitability {
  isSafe: boolean
  safetyScore: number
  warningLevel: 'green' | 'yellow' | 'red'
  warningMessage: string
  reasons: string[]
}

interface MarineWeatherData {
  latitude: number
  longitude: number
  hourly: {
    time: string[]
    wave_height: number[]
    wind_speed_10m: number[]
    wind_direction_10m: number[]
    temperature_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
  }
}

// Default coordinates (Mediterranean - can be configured per company)
const DEFAULT_COORDINATES = {
  latitude: 41.3851, // Barcelona area
  longitude: 2.1734,
}

export async function fetchMarineWeather(
  latitude: number = DEFAULT_COORDINATES.latitude,
  longitude: number = DEFAULT_COORDINATES.longitude,
  days: number = 7
): Promise<WeatherForecast[]> {
  try {
    // Fetch wave data from Marine API
    const marineUrl = 'https://marine-api.open-meteo.com/v1/marine'
    const marineParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: 'wave_height',
      forecast_days: days.toString(),
      timezone: 'auto',
    })

    // Fetch weather data from standard API
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast'
    const weatherParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: [
        'temperature_2m',
        'wind_speed_10m',
        'wind_direction_10m',
        'precipitation_probability',
        'weather_code',
      ].join(','),
      forecast_days: days.toString(),
      timezone: 'auto',
    })

    const [marineResponse, weatherResponse] = await Promise.all([
      fetch(`${marineUrl}?${marineParams}`),
      fetch(`${weatherUrl}?${weatherParams}`),
    ])

    if (!marineResponse.ok) {
      throw new Error(`Marine API error: ${marineResponse.statusText}`)
    }
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.statusText}`)
    }

    const marineData = await marineResponse.json()
    const weatherData = await weatherResponse.json()

    // Transform data into our format
    const forecasts: WeatherForecast[] = []

    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      const datetime = new Date(weatherData.hourly.time[i])

      forecasts.push({
        date: datetime.toISOString().split('T')[0],
        time: datetime.toTimeString().split(' ')[0].substring(0, 5),
        waveHeight: marineData.hourly.wave_height[i] || 0,
        windSpeed: weatherData.hourly.wind_speed_10m[i] || 0,
        windDirection: weatherData.hourly.wind_direction_10m[i] || 0,
        temperature: weatherData.hourly.temperature_2m[i] || 0,
        precipitationProbability: weatherData.hourly.precipitation_probability[i] || 0,
        weatherCode: weatherData.hourly.weather_code[i] || 0,
      })
    }

    return forecasts
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}

export function assessWeatherSuitability(
  forecast: WeatherForecast,
  boatType: string = 'motorboat'
): WeatherSuitability {
  const issues: string[] = []
  let safetyScore = 100

  // Wave height thresholds (meters) - aligned with Marine Weather Guidelines
  const waveThresholds = {
    sailboat: { good: 1.0, caution: 2.0, dangerous: 2.0 },
    motorboat: { good: 1.0, caution: 2.0, dangerous: 2.0 },
    jetski: { good: 0.5, caution: 1.0, dangerous: 1.0 },
  }

  const threshold = waveThresholds[boatType as keyof typeof waveThresholds] || waveThresholds.motorboat

  // Check wave height
  if (forecast.waveHeight > threshold.dangerous) {
    safetyScore -= 50
    issues.push(`High waves: ${forecast.waveHeight.toFixed(1)}m`)
  } else if (forecast.waveHeight >= threshold.caution) {
    safetyScore -= 25
    issues.push(`Moderate waves: ${forecast.waveHeight.toFixed(1)}m`)
  }

  // Check wind speed - convert km/h to knots for assessment (1 knot = 1.852 km/h)
  const windKnots = forecast.windSpeed / 1.852
  if (windKnots >= 19) { // > 35 km/h ≈ 19 knots
    safetyScore -= 40
    issues.push(`Strong winds: ${windKnots.toFixed(1)} knots (${forecast.windSpeed.toFixed(0)} km/h)`)
  } else if (windKnots >= 13.5) { // 25-35 km/h ≈ 13.5-19 knots
    safetyScore -= 20
    issues.push(`Moderate winds: ${windKnots.toFixed(1)} knots (${forecast.windSpeed.toFixed(0)} km/h)`)
  }

  // Check precipitation
  if (forecast.precipitationProbability >= 70) {
    safetyScore -= 15
    issues.push(`High rain probability: ${forecast.precipitationProbability}%`)
  } else if (forecast.precipitationProbability >= 50) {
    safetyScore -= 10
    issues.push(`Possible rain: ${forecast.precipitationProbability}%`)
  }

  // Check weather code (WMO codes)
  const severeWeatherCodes = [95, 96, 99] // Thunderstorms
  const badWeatherCodes = [61, 63, 65, 80, 81, 82] // Heavy rain/showers

  if (severeWeatherCodes.includes(forecast.weatherCode)) {
    safetyScore -= 30
    issues.push('Thunderstorm forecast')
  } else if (badWeatherCodes.includes(forecast.weatherCode)) {
    safetyScore -= 15
    issues.push('Poor weather conditions')
  }

  // Determine warning level
  let warningLevel: 'green' | 'yellow' | 'red'
  let warningMessage: string
  let isSafe: boolean

  if (safetyScore >= 70) {
    warningLevel = 'green'
    warningMessage = 'Good conditions for boating'
    isSafe = true
  } else if (safetyScore >= 40) {
    warningLevel = 'yellow'
    warningMessage = 'Caution advised - monitor conditions'
    isSafe = true
  } else {
    warningLevel = 'red'
    warningMessage = 'Not recommended for boating'
    isSafe = false
  }

  return {
    isSafe,
    safetyScore: Math.max(0, safetyScore),
    warningLevel,
    warningMessage,
    reasons: issues,
  }
}

export function getWeatherCodeDescription(code: number): string {
  // WMO Weather interpretation codes
  const codes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }

  return codes[code] || 'Unknown'
}

export function getWeatherIcon(code: number): string {
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

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function getWindDirectionEmoji(degrees: number): string {
  // Convert wind direction to arrow emoji
  const normalizedDegrees = ((degrees + 11.25) % 360)
  if (normalizedDegrees < 22.5) return '⬇️' // N (from north)
  if (normalizedDegrees < 67.5) return '↙️' // NE
  if (normalizedDegrees < 112.5) return '⬅️' // E
  if (normalizedDegrees < 157.5) return '↖️' // SE
  if (normalizedDegrees < 202.5) return '⬆️' // S
  if (normalizedDegrees < 247.5) return '↗️' // SW
  if (normalizedDegrees < 292.5) return '➡️' // W
  if (normalizedDegrees < 337.5) return '↘️' // NW
  return '⬇️' // N
}

export function kmhToKnots(kmh: number): number {
  return kmh / 1.852
}

export function knotsToKmh(knots: number): number {
  return knots * 1.852
}

// Get daily summary from hourly forecasts
export function getDailySummary(forecasts: WeatherForecast[]) {
  const dailyMap = new Map<string, WeatherForecast[]>()

  // Group by date
  forecasts.forEach((f) => {
    if (!dailyMap.has(f.date)) {
      dailyMap.set(f.date, [])
    }
    dailyMap.get(f.date)!.push(f)
  })

  // Create daily summaries
  const dailySummaries = Array.from(dailyMap.entries()).map(([date, hourlyData]) => {
    // Get daytime hours (8am - 6pm) for better representation
    const daytimeData = hourlyData.filter((h) => {
      const hour = parseInt(h.time.split(':')[0])
      return hour >= 8 && hour <= 18
    })

    const relevantData = daytimeData.length > 0 ? daytimeData : hourlyData

    const avgWaveHeight = relevantData.reduce((sum, h) => sum + h.waveHeight, 0) / relevantData.length
    const maxWaveHeight = Math.max(...relevantData.map((h) => h.waveHeight))
    const avgWindSpeed = relevantData.reduce((sum, h) => sum + h.windSpeed, 0) / relevantData.length
    const maxWindSpeed = Math.max(...relevantData.map((h) => h.windSpeed))
    const avgTemp = relevantData.reduce((sum, h) => sum + h.temperature, 0) / relevantData.length
    const maxPrecipProb = Math.max(...relevantData.map((h) => h.precipitationProbability))

    // Get most common weather code
    const weatherCodes = relevantData.map((h) => h.weatherCode)
    const mostCommonCode = weatherCodes.sort(
      (a, b) => weatherCodes.filter((v) => v === a).length - weatherCodes.filter((v) => v === b).length
    ).pop() || 0

    return {
      date,
      avgWaveHeight,
      maxWaveHeight,
      avgWindSpeed,
      maxWindSpeed,
      avgTemperature: avgTemp,
      maxPrecipitationProbability: maxPrecipProb,
      weatherCode: mostCommonCode,
      hourlyForecasts: hourlyData,
    }
  })

  return dailySummaries
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, MapPin, Loader2 } from 'lucide-react'

interface Location {
  latitude: number
  longitude: number
  location_name: string
}

interface LocationSettingsProps {
  isAdmin: boolean
}

export default function LocationSettings({ isAdmin }: LocationSettingsProps) {
  const [location, setLocation] = useState<Location | null>(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationName, setLocationName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch current location
  useEffect(() => {
    fetchLocation()
  }, [])

  const fetchLocation = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/company/location')
      if (!response.ok) throw new Error('Failed to fetch location')

      const data = await response.json()
      setLocation(data.location)
      setLatitude(data.location.latitude.toString())
      setLongitude(data.location.longitude.toString())
      setLocationName(data.location.location_name)
    } catch (err: any) {
      setError(err.message || 'Failed to load location')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Clear previous messages
    setError('')
    setSuccess('')

    // Validate
    if (!latitude || !longitude) {
      setError('Latitude and longitude are required')
      return
    }

    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lon)) {
      setError('Latitude and longitude must be valid numbers')
      return
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90')
      return
    }

    if (lon < -180 || lon > 180) {
      setError('Longitude must be between -180 and 180')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/company/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          location_name: locationName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update location')
      }

      const data = await response.json()
      setLocation(data.location)
      setSuccess('Location updated successfully!')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to update location')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="maritime-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Weather Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="maritime-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Weather Location
        </CardTitle>
        <CardDescription>
          Set your company's GPS coordinates for accurate marine weather forecasts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Location Display */}
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-2">Current Location</p>
          <p className="text-lg font-semibold">{location?.location_name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {location?.latitude.toFixed(4)}°, {location?.longitude.toFixed(4)}°
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {isAdmin ? (
          <>
            {/* Coordinate Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Latitude
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Range: -90 (South) to +90 (North)
                </p>
                <Input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="41.3851"
                  className="font-mono"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Examples: Barcelona: 41.3851, Miami: 25.7617, Athens: 37.9364
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Longitude
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Range: -180 (West) to +180 (East)
                </p>
                <Input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="2.1734"
                  className="font-mono"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Examples: Barcelona: 2.1734, Miami: -80.1918, Athens: 23.6932
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Location Name (Optional)</label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Display name for easy reference
                </p>
                <Input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., Barcelona, Spain"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">📍 How to find coordinates:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Search on Google Maps and copy the coordinates</li>
                <li>• Use OpenStreetMap.org</li>
                <li>• Positive latitude = North, Negative = South</li>
                <li>• Positive longitude = East, Negative = West</li>
              </ul>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Save Location
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              Only admins can modify the company location. Contact your administrator to update this setting.
            </p>
          </div>
        )}

        {/* Common Coordinates Reference */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-3 text-slate-900">Common Port Coordinates:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-medium text-slate-900">Mediterranean</p>
              <ul className="text-slate-700 space-y-1 mt-1">
                <li>Barcelona: 41.3851, 2.1734</li>
                <li>Athens: 37.9364, 23.6932</li>
                <li>Venice: 45.4408, 12.3155</li>
                <li>Split: 43.5081, 16.4402</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-900">Caribbean</p>
              <ul className="text-slate-700 space-y-1 mt-1">
                <li>Miami: 25.7617, -80.1918</li>
                <li>Nassau: 25.0657, -77.3403</li>
                <li>Virgin Is.: 18.3358, -64.8963</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

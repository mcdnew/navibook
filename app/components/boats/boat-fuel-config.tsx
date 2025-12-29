'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save, Fuel } from 'lucide-react'

interface BoatFuelConfigProps {
  boatId: string
  boatType: 'sailboat' | 'motorboat' | 'jetski'
  boatName: string
  isAdmin: boolean
  onConfigSaved?: () => void
}

export default function BoatFuelConfig({
  boatId,
  boatType,
  boatName,
  isAdmin,
  onConfigSaved,
}: BoatFuelConfigProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fuelConsumptionRate, setFuelConsumptionRate] = useState<string>('0')
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<string>('0')

  // Load fuel config
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        const response = await fetch(`/api/boats/fuel-config?boatId=${boatId}`, {
          method: 'GET',
        })

        if (!response.ok) {
          // It's OK if config doesn't exist yet
          if (response.status !== 404) {
            throw new Error('Failed to load fuel config')
          }
        } else {
          const data = await response.json()
          setFuelConsumptionRate((data.fuel_consumption_rate || 0).toString())
          setFuelPricePerLiter((data.fuel_price_per_liter || 0).toString())
        }
      } catch (error) {
        console.error('Error loading fuel config:', error)
        // Don't show error toast for initial load - it's OK if config doesn't exist
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [boatId])

  const handleSave = async () => {
    try {
      // Validation
      const consumptionNum = parseFloat(fuelConsumptionRate)
      const priceNum = parseFloat(fuelPricePerLiter)

      if (isNaN(consumptionNum) || consumptionNum < 0) {
        toast.error('Valid fuel consumption rate is required')
        return
      }

      if (isNaN(priceNum) || priceNum < 0) {
        toast.error('Valid fuel price per liter is required')
        return
      }

      setSaving(true)

      const response = await fetch('/api/boats/fuel-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boatId,
          fuelConsumptionRate: consumptionNum,
          fuelPricePerLiter: priceNum,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save fuel config')
      }

      toast.success('Fuel configuration saved!')
      onConfigSaved?.()
    } catch (error) {
      console.error('Error saving fuel config:', error)
      toast.error('Failed to save fuel configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setSaving(true)

      const response = await fetch(`/api/boats/fuel-config?boatId=${boatId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete fuel config')
      }

      setFuelConsumptionRate('0')
      setFuelPricePerLiter('0')
      toast.success('Fuel configuration reset to default')
    } catch (error) {
      console.error('Error deleting fuel config:', error)
      toast.error('Failed to reset fuel configuration')
    } finally {
      setSaving(false)
    }
  }

  // Only render for admin users
  if (!isAdmin) {
    return null
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Fuel className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Fuel Configuration
        </CardTitle>
        <CardDescription>
          Configure fuel consumption and pricing for {boatName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading configuration...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fuel Consumption Rate */}
              <div className="space-y-2">
                <Label htmlFor="consumptionRate">Fuel Consumption (L/hour) *</Label>
                <Input
                  id="consumptionRate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={fuelConsumptionRate}
                  onChange={(e) => setFuelConsumptionRate(e.target.value)}
                  placeholder={boatType === 'sailboat' ? 'e.g., 1' : 'e.g., 20'}
                  disabled={saving}
                />
                {boatType === 'sailboat' ? (
                  <p className="text-xs text-muted-foreground">
                    <strong>Pondered consumption:</strong> Account for motor usage ratio. Example: Engine consumes 2 L/h, but assumed 50% motoring + 50% sailing = 1 L/h (2 × 0.5).
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Liters of fuel consumed per hour of operation
                  </p>
                )}
              </div>

              {/* Fuel Price Per Liter */}
              <div className="space-y-2">
                <Label htmlFor="pricePerLiter">Fuel Price (€/liter) *</Label>
                <Input
                  id="pricePerLiter"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fuelPricePerLiter}
                  onChange={(e) => setFuelPricePerLiter(e.target.value)}
                  placeholder="e.g., 1.50"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Current or average fuel price per liter
                </p>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>How it works:</strong> The fuel cost for each charter is automatically calculated as:
                <br />
                <span className="font-mono mt-2 block">
                  Fuel Cost = Consumption Rate × Duration (hours) × Price per Liter
                </span>
                <br />
                This cost is tracked as an operational expense and reduces your profitability. It is NOT added to the customer price.
              </p>
            </div>

            {/* Sailboat-specific guidance */}
            {boatType === 'sailboat' && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Sailboat fuel consumption:</strong> Enter a pondered (weighted average) consumption rate that accounts for your typical motor usage ratio. This ensures costs are close to real-world consumption.
                  <br />
                  <br />
                  <strong>Example calculation:</strong>
                  <br />
                  • Engine specs: 2 L/hour when motoring at full throttle
                  <br />
                  • Typical usage: 50% motoring, 50% sailing
                  <br />
                  • Pondered consumption: 2 L/h × 0.5 = <span className="font-mono">1 L/h</span>
                  <br />
                  <br />
                  For a 10-hour charter with 1 L/h input and €1.50/L price = €15 fuel cost
                </p>
              </div>
            )}


            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 md:flex-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={saving}
                variant="outline"
                className="flex-1 md:flex-none"
              >
                Reset to Default
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

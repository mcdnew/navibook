'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PackageConfigSettingsProps {
  isAdmin: boolean
}

export default function PackageConfigSettings({ isAdmin }: PackageConfigSettingsProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drinksCost, setDrinksCost] = useState<string>('0')
  const [foodCost, setFoodCost] = useState<string>('0')

  // Load package config
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        const response = await fetch('/api/company/package-config', {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error('Failed to load package config')
        }

        const data = await response.json()
        setDrinksCost((data.drinks_cost_per_person || 0).toString())
        setFoodCost((data.food_cost_per_person || 0).toString())
      } catch (error) {
        console.error('Error loading package config:', error)
        toast.error('Failed to load package configuration')
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      loadConfig()
    }
  }, [isAdmin])

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch('/api/company/package-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drinksCostPerPerson: parseFloat(drinksCost) || 0,
          foodCostPerPerson: parseFloat(foodCost) || 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save package config')
      }

      toast.success('Package configuration saved!')
    } catch (error) {
      console.error('Error saving package config:', error)
      toast.error('Failed to save package configuration')
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Card className="maritime-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Package Add-on Pricing
        </CardTitle>
        <CardDescription>
          Configure per-person costs for charter add-ons (drinks, food, etc.)
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
              {/* Drinks Cost */}
              <div className="space-y-2">
                <Label htmlFor="drinksCost">Drinks Cost per Person (€)</Label>
                <Input
                  id="drinksCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={drinksCost}
                  onChange={(e) => setDrinksCost(e.target.value)}
                  placeholder="0.00"
                  disabled={!isAdmin}
                />
                <p className="text-xs text-muted-foreground">
                  Applied to "Charter + Drinks" and "Full Package" bookings
                </p>
              </div>

              {/* Food Cost */}
              <div className="space-y-2">
                <Label htmlFor="foodCost">Food Cost per Person (€)</Label>
                <Input
                  id="foodCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={foodCost}
                  onChange={(e) => setFoodCost(e.target.value)}
                  placeholder="0.00"
                  disabled={!isAdmin}
                />
                <p className="text-xs text-muted-foreground">
                  Applied to "Charter + Food" and "Full Package" bookings
                </p>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>How it works:</strong> These per-person costs are automatically calculated and tracked as operational expenses for each booking. They are NOT added to the customer price but reduce your profitability. For example, if a 5-person booking has drinks at €5/person, the system tracks €25 as an operational cost.
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto"
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
          </>
        )}
      </CardContent>
    </Card>
  )
}

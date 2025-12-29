'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle, AlertCircle, Settings2 } from 'lucide-react'
import BoatFuelConfig from '@/app/components/boats/boat-fuel-config'

interface Boat {
  id: string
  name: string
  boat_type: 'motorboat' | 'jetski'
  is_active: boolean
}

interface FuelConfig {
  fuel_consumption_rate: number
  fuel_price_per_liter: number
}

interface FuelConfigManagerClientProps {
  boats: Boat[]
  fuelConfigMap: Record<string, FuelConfig>
  isAdmin: boolean
}

export default function FuelConfigManagerClient({
  boats,
  fuelConfigMap,
  isAdmin,
}: FuelConfigManagerClientProps) {
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null)
  const [fuelConfigDialogOpen, setFuelConfigDialogOpen] = useState(false)

  const handleConfigureClick = (boat: Boat) => {
    setSelectedBoat(boat)
    setFuelConfigDialogOpen(true)
  }

  const handleConfigSaved = () => {
    setFuelConfigDialogOpen(false)
    setSelectedBoat(null)
  }

  const configuredCount = boats.filter(boat => fuelConfigMap[boat.id]).length
  const totalMotorBoats = boats.length

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Motorboats & Jet Skis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMotorBoats}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-700 dark:text-green-400">Configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{configuredCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((configuredCount / Math.max(totalMotorBoats, 1)) * 100)}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-700 dark:text-amber-400">Missing Config</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{totalMotorBoats - configuredCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Need configuration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Configuration Table */}
      <Card>
        <CardHeader>
          <CardTitle>Boat Fuel Configurations</CardTitle>
          <CardDescription>
            Configure fuel consumption rates and pricing for each boat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-semibold">Boat Name</th>
                  <th className="text-left py-3 px-3 font-semibold">Type</th>
                  <th className="text-center py-3 px-3 font-semibold">Status</th>
                  <th className="text-right py-3 px-3 font-semibold">Consumption (L/h)</th>
                  <th className="text-right py-3 px-3 font-semibold">Price (€/L)</th>
                  <th className="text-center py-3 px-3 font-semibold">Hourly Cost</th>
                  <th className="text-center py-3 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {boats.map((boat) => {
                  const config = fuelConfigMap[boat.id]
                  const hourlyFuelCost = config
                    ? (config.fuel_consumption_rate * config.fuel_price_per_liter).toFixed(2)
                    : '—'

                  return (
                    <tr key={boat.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-3 font-medium">{boat.name}</td>
                      <td className="py-3 px-3">
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {boat.boat_type === 'motorboat' ? 'Motorboat' : 'Jet Ski'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {config ? (
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium text-xs">Configured</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-600 font-medium text-xs">Missing</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-medium">
                        {config ? config.fuel_consumption_rate.toFixed(2) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-medium">
                        {config ? config.fuel_price_per_liter.toFixed(2) : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-orange-600">
                        €{hourlyFuelCost}/h
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigureClick(boat)}
                          disabled={!isAdmin}
                          className="text-orange-600 hover:bg-orange-50 border-orange-200"
                        >
                          <Settings2 className="w-4 h-4 mr-1" />
                          {config ? 'Edit' : 'Configure'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {boats.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No motorboats or jet skis found in your fleet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fuel configuration is only available for motorboats and jet skis.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fuel Config Dialog */}
      {selectedBoat && (
        <Dialog open={fuelConfigDialogOpen} onOpenChange={setFuelConfigDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Fuel Configuration - {selectedBoat.name}</DialogTitle>
              <DialogDescription>
                Configure fuel consumption rate and pricing for this {selectedBoat.boat_type}
              </DialogDescription>
            </DialogHeader>
            <BoatFuelConfig
              boatId={selectedBoat.id}
              boatType={selectedBoat.boat_type}
              boatName={selectedBoat.name}
              isAdmin={isAdmin}
              onConfigSaved={handleConfigSaved}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Fuel } from 'lucide-react'
import FuelConfigManagerClient from './fuel-config-manager-client'

export default async function FuelConfigPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company
  const { data: userData } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/login')

  // Get all motorboats and jetskis for the company
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, boat_type, is_active')
    .eq('company_id', userData.company_id)
    .in('boat_type', ['motorboat', 'jetski'])
    .order('name')

  // Get all fuel configs
  const { data: fuelConfigs } = await supabase
    .from('boat_fuel_config')
    .select('boat_id, fuel_consumption_rate, fuel_price_per_liter')

  // Create a map of boat_id -> fuel_config
  const fuelConfigMap = new Map((fuelConfigs || []).map(config => [config.boat_id, config]))

  const isAdmin = userData.role === 'admin' || userData.role === 'manager' || userData.role === 'office_staff'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/fleet">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fleet
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Fuel className="w-8 h-8 text-orange-600" />
                Fuel Configuration Manager
              </h1>
              <p className="text-muted-foreground">Configure fuel settings for all motorboats and jet skis</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base">About Fuel Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Fuel Consumption Rate:</strong> Average fuel consumed per hour (in liters). For example: a motorboat might consume 20 L/hour.</p>
            <p><strong>Fuel Price:</strong> Current cost per liter of fuel (in €). This determines the operational cost for each booking.</p>
            <p><strong>Auto Calculation:</strong> Fuel costs are automatically calculated for each booking based on duration and these settings. Fuel costs are tracked as operational expenses, not added to customer pricing.</p>
          </CardContent>
        </Card>

        {/* Fuel Config Manager */}
        <FuelConfigManagerClient
          boats={boats || []}
          fuelConfigMap={Object.fromEntries(fuelConfigMap)}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}

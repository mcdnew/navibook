import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import FleetManagementClient from './fleet-management-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { Info, Fuel } from 'lucide-react'

export default async function FleetPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: boats } = await supabase
    .from('boats')
    .select(`
      *,
      default_captain:users!boats_default_captain_id_fkey(
        id,
        first_name,
        last_name
      )
    `)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">Manage your boats and vessels</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/fleet/fuel-config">
                <Fuel className="w-4 h-4 mr-2" />
                Manage Fuel Config
              </Link>
            </Button>
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Fuel Configuration Info */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Fuel className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Fuel Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>For motorboats and jet skis, click the <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">⚙️</span> button to configure fuel consumption rate (L/hour) and fuel price per liter. These settings will automatically calculate fuel costs for bookings.</p>
          </CardContent>
        </Card>

        <FleetManagementClient boats={boats || []} />
      </div>
    </div>
  )
}

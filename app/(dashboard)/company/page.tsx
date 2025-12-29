import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowLeft, Info, Fuel, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

const LocationSettings = dynamic(() => import('@/app/components/company/location-settings'), {
  ssr: false,
  loading: () => (
    <Card className="maritime-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading location settings...</p>
        </div>
      </CardContent>
    </Card>
  ),
})

const CompanyInfoEditor = dynamic(() => import('@/app/components/company/company-info-editor'), {
  ssr: false,
  loading: () => (
    <Card className="maritime-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading company information...</p>
        </div>
      </CardContent>
    </Card>
  ),
})

const PackageConfigSettings = dynamic(() => import('@/app/components/company/package-config-settings'), {
  ssr: false,
  loading: () => (
    <Card className="maritime-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading package configuration...</p>
        </div>
      </CardContent>
    </Card>
  ),
})

export default async function CompanySettingsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user role to check if admin
  const { data: userRecord } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) redirect('/login')

  const isAdmin = userRecord.role === 'admin'

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary" />
                Company Settings
              </h1>
            </div>
          </div>
        </div>

        {/* Configuration Guide */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Configuration Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <div className="flex gap-3">
                <Fuel className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Fuel Pricing (Per Boat)</p>
                  <p className="text-muted-foreground">Configure fuel consumption rate and price for each motorboat and jet ski in <Link href="/fleet" className="text-blue-600 hover:underline dark:text-blue-400">Fleet Settings</Link></p>
                </div>
              </div>
              <div className="flex gap-3">
                <UtensilsCrossed className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Add-on Costs (Company-wide)</p>
                  <p className="text-muted-foreground">Set per-person costs for food and drinks below. These are applied to bookings based on package type.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info Editor Component */}
        <CompanyInfoEditor isAdmin={isAdmin} />

        {/* Location Settings Component */}
        <LocationSettings isAdmin={isAdmin} />

        {/* Package Configuration Settings Component */}
        <PackageConfigSettings isAdmin={isAdmin} />

        {/* Admin Info */}
        {!isAdmin && (
          <Card className="maritime-card border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Only administrators can modify company settings.
                If you need to update the company location, please contact your administrator.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

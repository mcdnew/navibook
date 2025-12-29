import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Settings, Building2, Ship, Fuel, Zap, Banknote, AlertCircle, Users, Calendar } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user info including role and company
  const { data: userData } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/login')

  const isAdmin = userData.role === 'admin' || userData.role === 'manager' || userData.role === 'office_staff'

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Settings & Configuration
            </h1>
            <p className="text-muted-foreground mt-1">Manage your business configuration and operations</p>
          </div>
        </div>

        {/* Admin-Only Warning */}
        {!isAdmin && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>Admin Access Required:</strong> Many configuration options below are only available to administrators and managers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Settings Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Company Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Info */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Update company details, contact info, and location</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/company">Configure</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Package Configuration */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Add-on Pricing
                </CardTitle>
                <CardDescription>Set per-person costs for food and drinks</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" disabled={!isAdmin} variant={!isAdmin ? 'outline' : 'default'}>
                  <Link href="/company">Configure</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fleet & Boats Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Ship className="w-6 h-6" />
            Fleet Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manage Fleet */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  Manage Boats
                </CardTitle>
                <CardDescription>Add, edit, deactivate boats and assign captains</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/fleet">Manage</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Fuel Configuration */}
            <Card className="hover:shadow-lg transition-shadow border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Fuel Configuration
                </CardTitle>
                <CardDescription>Set fuel consumption rates and pricing per boat</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700" disabled={!isAdmin}>
                  <Link href="/fleet/fuel-config">Configure</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Operations Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pricing Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Pricing Tables
                </CardTitle>
                <CardDescription>Manage booking prices and pricing rules</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" disabled={!isAdmin} variant={!isAdmin ? 'outline' : 'default'}>
                  <Link href="/pricing">Manage</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Blocked Slots */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Blocked Slots
                </CardTitle>
                <CardDescription>Block dates when boats are unavailable</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" disabled={!isAdmin} variant={!isAdmin ? 'outline' : 'default'}>
                  <Link href="/blocked-slots">Manage</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Agents */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Agents & Staff
                </CardTitle>
                <CardDescription>Manage booking agents and team members</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" disabled={!isAdmin} variant={!isAdmin ? 'outline' : 'default'}>
                  <Link href="/agents">Manage</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Waitlist */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Waitlist
                </CardTitle>
                <CardDescription>Manage customer waitlist and availability notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" disabled={!isAdmin} variant={!isAdmin ? 'outline' : 'default'}>
                  <Link href="/waitlist">Manage</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>💡 <strong>Fuel Configuration:</strong> Set up fuel costs for your motorboats and jet skis to automatically track operational costs.</p>
            <p>💡 <strong>Add-on Pricing:</strong> Configure per-person food and drinks costs in Company Settings for accurate cost tracking.</p>
            <p>💡 <strong>Fleet Management:</strong> Keep your boat information updated including default captain assignments and specifications.</p>
            <p>💡 <strong>Pricing Tables:</strong> Create and manage different pricing options for various boat types and charter durations.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

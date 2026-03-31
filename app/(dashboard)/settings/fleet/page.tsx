/**
 * /settings/fleet — Fleet module toggle and configuration
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Wrench } from 'lucide-react'
import FleetModuleToggle from './fleet-module-toggle'

export default async function FleetSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users').select('role, company_id').eq('id', user.id).single()
  if (!userData) redirect('/login')

  const isAdmin = ['admin', 'company_admin', 'manager'].includes(userData.role)
  if (!isAdmin) redirect('/settings')

  const { data: company } = await supabase
    .from('companies').select('fleet_module_enabled').eq('id', userData.company_id).single()

  const enabled = company?.fleet_module_enabled ?? false

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/settings"><ArrowLeft className="w-4 h-4 mr-1" />Settings</Link>
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Fleet Operations Module
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Status</CardTitle>
            <CardDescription>
              The Fleet Operations Module adds maintenance scheduling, fuel logging, expense tracking,
              safety equipment management, and P&L reporting to your NaviBook account.
              When a maintenance event is scheduled, it automatically blocks that date range in the
              booking calendar so no charter can be booked while the boat is in service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FleetModuleToggle enabled={enabled} />
          </CardContent>
        </Card>

        {enabled && (
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>✓ <strong>Maintenance scheduling</strong> — auto-blocks availability in the booking calendar</p>
              <p>✓ <strong>Fuel logs</strong> — track fills and engine hours per boat</p>
              <p>✓ <strong>Expenses</strong> — log operational costs (insurance, mooring, equipment, etc.)</p>
              <p>✓ <strong>Safety equipment</strong> — track gear with expiry date alerts</p>
              <p>✓ <strong>Documents</strong> — store certificates, licenses and survey reports</p>
              <p>✓ <strong>P&L reporting</strong> — charter revenue minus fleet costs per boat per month</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/fleet/boats">Open Fleet Intelligence →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

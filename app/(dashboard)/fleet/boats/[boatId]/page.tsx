/**
 * /fleet/boats/[boatId] — Fleet module hub for a specific boat.
 * Shows tabs: Maintenance, Fuel, Expenses, Safety, Documents.
 * Requires fleet_module_enabled.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Wrench,
  Fuel,
  Receipt,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ChevronRight,
  Ship,
} from 'lucide-react'

export default async function FleetBoatPage({
  params,
}: {
  params: { boatId: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()
  if (!userRecord) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('fleet_module_enabled')
    .eq('id', userRecord.company_id)
    .single()

  if (!company?.fleet_module_enabled) {
    redirect('/fleet?fleet_module=disabled')
  }

  const { data: boat } = await supabase
    .from('boats')
    .select('id, name, boat_type, capacity, current_engine_hours, engine_hours_alert_threshold, model, home_port, insurance_expiry')
    .eq('id', params.boatId)
    .eq('company_id', userRecord.company_id)
    .single()

  if (!boat) redirect('/fleet')

  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: maintenanceDue }, { data: expiringEquipment }, { data: expiringDocs }] =
    await Promise.all([
      supabase
        .from('maintenance_logs')
        .select('id, title, scheduled_date, priority, status')
        .eq('boat_id', params.boatId)
        .in('status', ['scheduled', 'approved_to_start', 'in_progress'])
        .order('scheduled_date')
        .limit(3),

      supabase
        .from('safety_equipment')
        .select('id, name, expiry_date')
        .eq('boat_id', params.boatId)
        .eq('status', 'active')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', endDate),

      supabase
        .from('fleet_documents')
        .select('id, name, expiry_date')
        .eq('boat_id', params.boatId)
        .eq('status', 'active')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', endDate),
    ])

  const engineAlert =
    boat.engine_hours_alert_threshold != null &&
    boat.current_engine_hours >= boat.engine_hours_alert_threshold

  const sections = [
    {
      href: `/fleet/boats/${params.boatId}/maintenance`,
      icon: Wrench,
      label: 'Maintenance',
      description: 'Scheduled and completed maintenance records',
      badge: maintenanceDue?.length ? `${maintenanceDue.length} pending` : null,
      badgeVariant: 'destructive' as const,
    },
    {
      href: `/fleet/boats/${params.boatId}/fuel`,
      icon: Fuel,
      label: 'Fuel Logs',
      description: 'Fuel fills and engine hours tracking',
      badge: engineAlert ? 'Service due' : null,
      badgeVariant: 'outline' as const,
    },
    {
      href: `/fleet/boats/${params.boatId}/expenses`,
      icon: Receipt,
      label: 'Expenses',
      description: 'Operational expenses and costs',
      badge: null,
      badgeVariant: 'outline' as const,
    },
    {
      href: `/fleet/boats/${params.boatId}/safety`,
      icon: ShieldCheck,
      label: 'Safety Equipment',
      description: 'Safety gear, expiry dates and inspections',
      badge: expiringEquipment?.length ? `${expiringEquipment.length} expiring` : null,
      badgeVariant: 'destructive' as const,
    },
    {
      href: `/fleet/boats/${params.boatId}/documents`,
      icon: FileText,
      label: 'Documents',
      description: 'Vessel certificates, licenses and documents',
      badge: expiringDocs?.length ? `${expiringDocs.length} expiring` : null,
      badgeVariant: 'destructive' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/fleet">
            <Button variant="outline" size="sm">← Fleet</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">{boat.name}</h1>
          </div>
        </div>

        {/* Boat summary */}
        <Card>
          <CardContent className="py-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{boat.boat_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Capacity</p>
              <p className="font-medium">{boat.capacity} pax</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Engine Hours</p>
              <p className={`font-medium flex items-center gap-1 ${engineAlert ? 'text-amber-500' : ''}`}>
                {engineAlert && <AlertTriangle className="w-3.5 h-3.5" />}
                {boat.current_engine_hours ?? 0}h
                {boat.engine_hours_alert_threshold && (
                  <span className="text-muted-foreground font-normal">/ {boat.engine_hours_alert_threshold}h threshold</span>
                )}
              </p>
            </div>
            {boat.home_port && (
              <div>
                <p className="text-xs text-muted-foreground">Home Port</p>
                <p className="font-medium">{boat.home_port}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section links */}
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.href} href={section.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{section.label}</p>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {section.badge && (
                        <Badge variant={section.badgeVariant} className="text-xs">
                          {section.badge}
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

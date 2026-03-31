/**
 * /fleet/boats/[boatId]/maintenance
 * Lists maintenance records; blocked slots are auto-managed by DB trigger.
 * New maintenance with scheduled_date automatically blocks that date range in bookings.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, Plus, Calendar, AlertTriangle } from 'lucide-react'
import MaintenanceActions from './maintenance-actions'

export default async function MaintenancePage({
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
  if (!company?.fleet_module_enabled) redirect('/fleet')

  const { data: boat } = await supabase
    .from('boats')
    .select('id, name')
    .eq('id', params.boatId)
    .eq('company_id', userRecord.company_id)
    .single()
  if (!boat) redirect('/fleet')

  const { data: logs } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('boat_id', params.boatId)
    .order('scheduled_date', { ascending: false })

  const statusColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
    draft: 'bg-gray-100 text-gray-600',
    pending_approval: 'bg-purple-100 text-purple-700',
    approved_to_start: 'bg-cyan-100 text-cyan-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const priorityIcon = (p: string) =>
    p === 'urgent' || p === 'high' ? (
      <AlertTriangle className="w-3 h-3 text-red-500" />
    ) : null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/fleet/boats/${params.boatId}`}>
              <Button variant="outline" size="sm">← {boat.name}</Button>
            </Link>
            <Wrench className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Maintenance</h1>
          </div>
          <MaintenanceActions boatId={params.boatId} />
        </div>

        <p className="text-xs text-muted-foreground">
          Scheduling maintenance automatically blocks that date range in the booking calendar.
        </p>

        {logs && logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {priorityIcon(log.priority)}
                        <p className="font-medium text-sm">{log.title}</p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            statusColor[log.status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {log.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {log.scheduled_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {log.scheduled_date}
                            {log.estimated_end_date && log.estimated_end_date !== log.scheduled_date
                              ? ` → ${log.estimated_end_date}`
                              : ''}
                          </span>
                        )}
                        {log.type && <span className="capitalize">{log.type}</span>}
                        {log.actual_cost != null && (
                          <span className="text-green-600 font-medium">€{log.actual_cost}</span>
                        )}
                        {log.estimated_cost != null && log.actual_cost == null && (
                          <span>~€{log.estimated_cost} est.</span>
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No maintenance records yet.</p>
              <p className="text-xs mt-1">Schedule maintenance to automatically block availability.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

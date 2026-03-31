/**
 * /fleet/boats/[boatId]/fuel — Fuel logs and engine hours tracking
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Fuel } from 'lucide-react'
import FuelLogActions from './fuel-log-actions'

export default async function FuelPage({ params }: { params: { boatId: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users').select('company_id').eq('id', user.id).single()
  if (!userRecord) redirect('/login')

  const { data: company } = await supabase
    .from('companies').select('fleet_module_enabled').eq('id', userRecord.company_id).single()
  if (!company?.fleet_module_enabled) redirect('/fleet')

  const { data: boat } = await supabase
    .from('boats').select('id, name, current_engine_hours').eq('id', params.boatId).eq('company_id', userRecord.company_id).single()
  if (!boat) redirect('/fleet')

  const { data: logs } = await supabase
    .from('fuel_logs').select('*').eq('boat_id', params.boatId).order('log_date', { ascending: false })

  const totalLiters = (logs ?? []).reduce((s, l) => s + (l.liters ?? 0), 0)
  const totalCost = (logs ?? []).reduce((s, l) => s + (l.total_cost ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/fleet/boats/${params.boatId}`}>
              <Button variant="outline" size="sm">← {boat.name}</Button>
            </Link>
            <Fuel className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Fuel Logs</h1>
          </div>
          <FuelLogActions boatId={params.boatId} />
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Engine Hours</p>
            <p className="text-xl font-bold">{boat.current_engine_hours ?? 0}h</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Liters</p>
            <p className="text-xl font-bold">{totalLiters.toFixed(1)}L</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-xl font-bold">€{totalCost.toFixed(2)}</p>
          </CardContent></Card>
        </div>

        {logs && logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{log.log_date}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.liters}L · €{log.total_cost}
                      {log.engine_hours_at_entry != null && ` · ${log.engine_hours_at_entry}h at fill`}
                    </p>
                    {log.notes && <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground shrink-0">
                    €{(log.total_cost / log.liters).toFixed(2)}/L
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Fuel className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No fuel logs yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

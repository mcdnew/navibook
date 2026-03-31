/**
 * /fleet/boats/[boatId]/expenses — Fleet operational expenses
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt } from 'lucide-react'
import ExpenseActions from './expense-actions'

export default async function ExpensesPage({ params }: { params: { boatId: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRecord } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!userRecord) redirect('/login')

  const { data: company } = await supabase.from('companies').select('fleet_module_enabled').eq('id', userRecord.company_id).single()
  if (!company?.fleet_module_enabled) redirect('/fleet')

  const { data: boat } = await supabase.from('boats').select('id, name').eq('id', params.boatId).eq('company_id', userRecord.company_id).single()
  if (!boat) redirect('/fleet')

  const { data: expenses } = await supabase
    .from('fleet_expenses').select('*').eq('boat_id', params.boatId).order('expense_date', { ascending: false })

  const total = (expenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/fleet/boats/${params.boatId}`}><Button variant="outline" size="sm">← {boat.name}</Button></Link>
            <Receipt className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Expenses</h1>
          </div>
          <ExpenseActions boatId={params.boatId} />
        </div>

        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Expenses (all time)</p>
            <p className="text-2xl font-bold text-red-500">€{total.toFixed(2)}</p>
          </CardContent>
        </Card>

        {expenses && expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{exp.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{exp.category} · {exp.expense_date}</p>
                  </div>
                  <p className="font-semibold text-red-500 shrink-0">€{exp.amount}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No expenses recorded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PricingClient from './pricing-client'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function PricingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company
  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  // Only admin and manager can access pricing
  if (userRecord?.role !== 'admin' && userRecord?.role !== 'operations_manager') {
    redirect('/dashboard')
  }

  // Get all boats
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, boat_type')
    .eq('company_id', userRecord.company_id)
    .eq('is_active', true)
    .order('name')

  // Get all pricing
  const { data: pricing } = await supabase
    .from('pricing')
    .select('*, boats(name, boat_type)')
    .eq('boats.company_id', userRecord.company_id)
    .order('boats(name)', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pricing Management</h1>
            <p className="text-muted-foreground">Manage pricing for all boats and packages</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <PricingClient boats={boats || []} pricing={pricing || []} />
      </div>
    </div>
  )
}

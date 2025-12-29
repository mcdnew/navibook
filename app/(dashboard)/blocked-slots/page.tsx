import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BlockedSlotsClient from './blocked-slots-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Ban, ArrowLeft } from 'lucide-react'

export default async function BlockedSlotsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  // Only admin, operations_manager, and sales_agent can access this page
  if (!userRecord || !['admin', 'operations_manager', 'sales_agent'].includes(userRecord.role)) {
    redirect('/dashboard')
  }

  // Get all boats for the company
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name')
    .eq('company_id', userRecord.company_id)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Ban className="w-8 h-8 text-destructive" />
              Blocked Slots
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage maintenance and unavailable time slots
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild className="gap-2 hide-mobile">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>

        <BlockedSlotsClient boats={boats || []} />
      </div>
    </div>
  )
}

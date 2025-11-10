import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import AdvancedBookingClient from './advanced-booking-client'

export default async function AdvancedBookingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company and role
  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (!userRecord) redirect('/login')

  // Only admin, manager, and power_agent can access advanced booking
  if (!['admin', 'manager', 'power_agent'].includes(userRecord.role)) {
    redirect('/dashboard')
  }

  // Get boats for the company
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name')
    .eq('company_id', userRecord.company_id)
    .eq('is_active', true)
    .order('name')

  // Get waitlist entries
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select(`
      *,
      boats(name)
    `)
    .eq('company_id', userRecord.company_id)
    .order('created_at', { ascending: false })

  // Get cancellation policies
  const { data: cancellationPolicies } = await supabase
    .from('cancellation_policies')
    .select('*')
    .eq('company_id', userRecord.company_id)
    .order('is_default', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Advanced Booking</h1>
            <p className="text-muted-foreground">
              Manage recurring bookings, templates, waitlist, and cancellation policies
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <AdvancedBookingClient
          boats={boats || []}
          waitlist={waitlist || []}
          cancellationPolicies={cancellationPolicies || []}
        />
      </div>
    </div>
  )
}

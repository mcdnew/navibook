import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import ReportsClient from './reports-client'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company
  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (!userRecord) redirect('/login')

  // Only admin, manager, and office_staff can access reports
  if (userRecord.role !== 'admin' && userRecord.role !== 'manager' && userRecord.role !== 'office_staff') {
    redirect('/dashboard')
  }

  // Get all bookings with agent and boat info
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      agents:users!agent_id(first_name, last_name, commission_percentage),
      boats(name, boat_type)
    `)
    .eq('company_id', userRecord.company_id)
    .order('booking_date', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive business insights and statistics</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <ReportsClient bookings={bookings || []} />
      </div>
    </div>
  )
}

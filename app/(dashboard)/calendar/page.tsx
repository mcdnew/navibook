import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import CalendarClient from './calendar-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { cleanupExpiredHolds } from '@/lib/bookings/cleanup'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company
  const { data: userRecord } = await supabase
    .from('users')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  // Clean up expired holds before fetching bookings
  await cleanupExpiredHolds(supabase)

  // Get all bookings for the calendar (exclude cancelled bookings)
  let bookingsQuery = supabase
    .from('bookings')
    .select('*, boats(id, name, boat_type)')
    .neq('status', 'cancelled')
    .order('booking_date', { ascending: true })

  // Filter by agent if not admin/manager
  if (userRecord?.role === 'regular_agent' || userRecord?.role === 'power_agent') {
    bookingsQuery = bookingsQuery.eq('agent_id', user.id)
  }

  const { data: bookings } = await bookingsQuery

  // Get boats for filters
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name')
    .eq('company_id', userRecord!.company_id)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Interactive booking calendar with drag-and-drop</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <CalendarClient bookings={bookings || []} boats={boats || []} />
      </div>
    </div>
  )
}

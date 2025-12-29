import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import BookingsListClient from './bookings-list-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { Anchor, Plus, ArrowLeft } from 'lucide-react'
import { cleanupExpiredHolds } from '@/lib/bookings/cleanup'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('role, first_name, company_id')
    .eq('id', user.id)
    .single()

  // Clean up expired holds before fetching bookings
  await cleanupExpiredHolds(supabase)

  // Get bookings based on role
  let query = supabase
    .from('bookings')
    .select('*, boats(name)')
    .order('booking_date', { ascending: false })

  // Agents see only their bookings
  if (userRecord?.role === 'sales_agent') {
    query = query.eq('agent_id', user.id)
  }

  const { data: bookings } = await query

  // Get all boats for filter dropdown
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name')
    .eq('company_id', userRecord!.company_id)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Anchor className="w-8 h-8 text-primary" />
              Bookings
            </h1>
            <p className="text-muted-foreground mt-1">View and manage all bookings</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild className="gap-2">
              <Link href="/quick-book">
                <Plus className="w-4 h-4" />
                <span>New Booking</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 hide-mobile">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>

        {bookings && bookings.length > 0 ? (
          <BookingsListClient bookings={bookings} boats={boats || []} />
        ) : (
          <Card className="maritime-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-primary" />
                No Bookings Yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Anchor className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
                <p className="text-muted-foreground mb-6 text-lg">No bookings found</p>
                <Button asChild className="gap-2">
                  <Link href="/quick-book">
                    <Plus className="w-4 h-4" />
                    Create First Booking
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

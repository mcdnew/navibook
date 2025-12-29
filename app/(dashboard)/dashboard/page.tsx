import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { ManualCleanupButton } from '@/components/manual-cleanup-button'
import DashboardBookingsTabs from './dashboard-bookings-tabs'
import {
  Anchor,
  Calendar,
  Ship,
  Users,
  DollarSign,
  CreditCard,
  Bell,
  CloudSun,
  BarChart3,
  UserCircle2,
  LayoutGrid,
  Zap,
  LogOut,
  Ban,
  Clock,
  Building2
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('*, companies(name)')
    .eq('id', user.id)
    .single()

  // Check if user is a captain
  const isCaptain = userRecord?.role === 'captain'

  // Fetch captain-specific data if captain
  let captainCharters = null
  if (isCaptain) {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('bookings')
      .select('*, boats(name, boat_type), agent:users!bookings_agent_id_fkey(first_name, last_name)')
      .eq('captain_id', user.id)
      .gte('booking_date', today)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(10)

    captainCharters = data
  }

  const { data: boats } = await supabase
    .from('boats')
    .select('*')
    .eq('is_active', true)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .neq('status', 'cancelled')
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })
    .limit(10)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {userRecord?.first_name}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {(userRecord.role === 'admin' || userRecord.role === 'office_staff') && (
              <ManualCleanupButton />
            )}
            <form action={logout}>
              <Button variant="outline" type="submit" className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hide-mobile">Logout</span>
              </Button>
            </form>
          </div>
        </div>

        {/* User Info */}
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-primary" />
              Your Account
            </CardTitle>
            <CardDescription>Account information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mobile-stack">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Name</p>
                <p className="font-semibold text-foreground">{userRecord?.first_name} {userRecord?.last_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="font-semibold text-foreground">{userRecord?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Role</p>
                <p className="font-semibold text-foreground capitalize">{userRecord?.role.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Company</p>
                <p className="font-semibold text-foreground">{userRecord?.companies?.name}</p>
              </div>
              {userRecord?.commission_percentage && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Commission</p>
                  <p className="font-semibold text-foreground">{userRecord.commission_percentage}%</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                  userRecord?.is_active
                    ? 'bg-secondary/20 text-secondary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {userRecord?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Captain-Specific Section */}
        {isCaptain && (
          <>
            {/* Today's Charters */}
            <Card className="maritime-card border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-blue-600" />
                  Your Upcoming Charters
                </CardTitle>
                <CardDescription>Your assigned charters for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {captainCharters && captainCharters.length > 0 ? (
                  <div className="space-y-3">
                    {captainCharters.map((charter) => {
                      const isToday = charter.booking_date === new Date().toISOString().split('T')[0]
                      return (
                        <div
                          key={charter.id}
                          className={`p-4 border-2 rounded-lg hover:border-primary/50 transition-colors ${
                            isToday ? 'bg-blue-50 border-blue-300' : 'border-border'
                          }`}
                        >
                          {isToday && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                TODAY
                              </span>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                              <p className="font-semibold text-sm">
                                {new Date(charter.booking_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {charter.start_time} - {charter.end_time}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Boat & Passengers</p>
                              <p className="font-semibold text-sm flex items-center gap-1">
                                <Ship className="w-3 h-3" />
                                {charter.boats?.name}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {charter.passengers} passengers
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Customer</p>
                              <p className="font-semibold text-sm">{charter.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{charter.customer_phone}</p>
                            </div>
                          </div>
                          {charter.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground mb-1">Special Requests</p>
                              <p className="text-sm">{charter.notes}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Anchor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming charters assigned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Stats */}
        {!isCaptain && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mobile-stack">
          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Active Boats
                  </p>
                  <p className="text-4xl font-bold text-primary">{boats?.length || 0}</p>
                </div>
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <Ship className="w-7 h-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Upcoming Bookings
                  </p>
                  <p className="text-4xl font-bold text-primary">{bookings?.length || 0}</p>
                </div>
                <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Anchor className="w-7 h-7 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Today&apos;s Charters
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    {bookings?.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length || 0}
                  </p>
                </div>
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Bookings Overview - Tabbed Interface */}
        {!isCaptain && <DashboardBookingsTabs />}

        {/* Quick Actions */}
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mobile-stack">
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/quick-book">
                <Anchor className="w-4 h-4" />
                <span>New Booking</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/bookings">
                <LayoutGrid className="w-4 h-4" />
                <span>View All Bookings</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/calendar">
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/advanced-booking">
                <Zap className="w-4 h-4" />
                <span>Advanced Booking</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/fleet">
                <Ship className="w-4 h-4" />
                <span>Manage Fleet</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/blocked-slots">
                <Ban className="w-4 h-4" />
                <span>Blocked Slots</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/waitlist">
                <Clock className="w-4 h-4" />
                <span>Waitlist</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/pricing">
                <DollarSign className="w-4 h-4" />
                <span>Pricing</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/payments">
                <CreditCard className="w-4 h-4" />
                <span>Payments</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/customers">
                <UserCircle2 className="w-4 h-4" />
                <span>Guests</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/agents">
                <Users className="w-4 h-4" />
                <span>Agents</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/reports">
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/notifications">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/weather">
                <CloudSun className="w-4 h-4" />
                <span>Weather</span>
              </a>
            </Button>
            <Button variant="outline" className="justify-start gap-2 h-auto py-3" asChild>
              <a href="/company">
                <Building2 className="w-4 h-4" />
                <span>Company Settings</span>
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground py-4">
          <p className="font-semibold">NaviBook Day-Charter Management System</p>
          <p className="text-xs mt-1">Real-time booking management for Mediterranean charters</p>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ship, Calendar, Clock, Euro, User } from 'lucide-react'
import { format } from 'date-fns'

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single()

  if (!userRecord) {
    redirect('/login')
  }

  // Fetch bookings based on role
  let bookings: any[] = []

  if (userRecord.role === 'captain') {
    // Fetch bookings where user is captain
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booking_time,
        duration_hours,
        total_price,
        captain_fee,
        status,
        package_type,
        boats (name),
        agents (first_name, last_name)
      `)
      .eq('captain_id', user.id)
      .order('booking_date', { ascending: true })

    bookings = data || []
  } else if (userRecord.role === 'sailor') {
    // Fetch bookings where user is a sailor via junction table
    const { data } = await supabase
      .from('booking_sailors')
      .select(`
        fee,
        bookings (
          id,
          booking_date,
          booking_time,
          duration_hours,
          total_price,
          status,
          package_type,
          boats (name),
          agents (first_name, last_name)
        )
      `)
      .eq('sailor_id', user.id)
      .order('bookings(booking_date)', { ascending: true })

    // Flatten the data structure
    bookings = (data || []).map((bs: any) => ({
      ...bs.bookings,
      sailor_fee: bs.fee
    }))
  }

  const roleLabel = userRecord.role === 'captain' ? 'Captain' : 'Sailor'
  const upcomingBookings = bookings.filter(b =>
    new Date(b.booking_date) >= new Date() && (b.status === 'confirmed' || b.status === 'pending')
  )
  const pastBookings = bookings.filter(b =>
    new Date(b.booking_date) < new Date() || b.status === 'completed' || b.status === 'cancelled'
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <p className="text-sm text-muted-foreground">
              {roleLabel} {userRecord?.first_name} {userRecord?.last_name}
            </p>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Logout
            </Button>
          </form>
        </div>

        {/* Upcoming Bookings */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Upcoming Assignments</h2>
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No upcoming bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        {booking.boats?.name || 'Unknown Boat'}
                      </CardTitle>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.booking_time} ({booking.duration_hours}h)</span>
                      </div>
                      {booking.agents && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Agent: {booking.agents.first_name} {booking.agents.last_name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {userRecord.role === 'captain'
                            ? `€${(booking.captain_fee || 0).toFixed(2)}`
                            : `€${(booking.sailor_fee || 0).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Package: {booking.package_type}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Past Assignments</h2>
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        {booking.boats?.name || 'Unknown Boat'}
                      </CardTitle>
                      <Badge variant="outline">
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.booking_time} ({booking.duration_hours}h)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {userRecord.role === 'captain'
                            ? `€${(booking.captain_fee || 0).toFixed(2)}`
                            : `€${(booking.sailor_fee || 0).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

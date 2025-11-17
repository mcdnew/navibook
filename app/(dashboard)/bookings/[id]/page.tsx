import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  User,
  Phone,
  Mail,
  FileText,
  Ship,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock3,
  UserCheck,
  UserX,
} from 'lucide-react'
import BookingActions from './booking-actions'
import BookingHistoryTimeline from './booking-history-timeline'

interface BookingHistoryEntry {
  id: string
  action: string
  created_at: string
  user_id: string | null
  notes: string | null
  old_data: any
  new_data: any
  users?: {
    first_name: string
    last_name: string
    email: string
  } | null
}

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user record to check permissions
  const { data: userRecord } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) redirect('/login')

  // Fetch booking with related data
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      boats (
        id,
        name,
        boat_type,
        capacity,
        image_url
      ),
      agent:users!bookings_agent_id_fkey (
        id,
        first_name,
        last_name,
        email
      ),
      captain:users!bookings_captain_id_fkey (
        id,
        first_name,
        last_name
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !booking) {
    notFound()
  }

  // Check if user has permission to view this booking
  const isAgent = userRecord.role === 'regular_agent' || userRecord.role === 'power_agent'
  if (isAgent && booking.agent_id !== user.id) {
    redirect('/bookings')
  }

  // Fetch booking history with user information
  const { data: history } = await supabase
    .from('booking_history')
    .select(`
      *,
      users:user_id (
        first_name,
        last_name,
        email
      )
    `)
    .eq('booking_id', params.id)
    .order('created_at', { ascending: false })

  // Helper function to format status
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending_hold: { color: 'bg-orange-100 text-orange-700', icon: Clock3 },
      confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      completed: { color: 'bg-blue-100 text-blue-700', icon: UserCheck },
      cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
      no_show: { color: 'bg-gray-100 text-gray-700', icon: UserX },
    }

    const variant = variants[status] || variants.pending_hold
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} flex items-center gap-1 px-3 py-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`

  // Format package type
  const formatPackage = (pkg: string) => {
    const packages: Record<string, string> = {
      charter_only: 'Charter Only',
      charter_drinks: 'Charter + Drinks',
      charter_food: 'Charter + Food',
      charter_full: 'Full Package',
    }
    return packages[pkg] || pkg
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/bookings">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bookings
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Booking Details</h1>
              <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>

        {/* Action Buttons (Client Component) */}
        <BookingActions booking={booking} userRole={userRecord.role} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-semibold">{booking.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {booking.customer_phone}
                    </p>
                  </div>
                  {booking.customer_email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {booking.customer_email}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Passengers</label>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {booking.passengers}
                    </p>
                  </div>
                </div>
                {booking.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Special Requests</label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-lg font-semibold">
                      {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="text-lg font-semibold">{booking.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Boat</label>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Ship className="w-4 h-4" />
                      {booking.boats?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Boat Type</label>
                    <p className="text-lg font-semibold capitalize">{booking.boats?.boat_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                    <p className="text-lg font-semibold">{booking.boats?.capacity} passengers</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Package</label>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {formatPackage(booking.package_type)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Source</label>
                    <p className="text-lg font-semibold capitalize">{booking.source}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking History Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Booking History
                </CardTitle>
                <CardDescription>Timeline of all changes to this booking</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingHistoryTimeline history={history || []} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Financial & Agent Info */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Total Price</span>
                    <span className="text-2xl font-bold">{formatCurrency(booking.total_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Deposit Required</span>
                    <span className="font-semibold">{formatCurrency(booking.deposit_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Deposit Status</span>
                    <Badge variant={booking.deposit_paid ? 'default' : 'secondary'}>
                      {booking.deposit_paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Outstanding Balance</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(booking.total_price - (booking.deposit_paid ? booking.deposit_amount : 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Commission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Agent Commission</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(booking.agent_commission)}
                    </span>
                  </div>
                  {booking.captain_fee > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Captain Fee</span>
                      <span className="font-semibold">
                        {formatCurrency(booking.captain_fee)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Agent Information */}
            {booking.agent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Agent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {booking.agent.first_name} {booking.agent.last_name}
                    </p>
                    {booking.agent.email && (
                      <p className="text-sm text-muted-foreground">{booking.agent.email}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Captain Information */}
            {booking.captain && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Captain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {booking.captain.first_name} {booking.captain.last_name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">
                    {format(new Date(booking.created_at), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                {booking.hold_until && booking.status === 'pending_hold' && (
                  <div className="bg-orange-50 p-2 rounded">
                    <span className="text-muted-foreground">Hold Until:</span>
                    <p className="font-medium text-orange-700">
                      {format(new Date(booking.hold_until), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                )}
                {booking.completed_at && (
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <p className="font-medium">
                      {format(new Date(booking.completed_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                )}
                {booking.cancelled_at && (
                  <div className="bg-red-50 p-2 rounded">
                    <span className="text-muted-foreground">Cancelled:</span>
                    <p className="font-medium text-red-700">
                      {format(new Date(booking.cancelled_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                    {booking.cancellation_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        Reason: {booking.cancellation_reason}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

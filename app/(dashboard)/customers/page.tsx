import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import CustomersClient from './customers-client'

export default async function CustomersPage() {
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

  // Get all bookings with customer info
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, booking_date, start_time, status, total_price, package_type, customer_name, customer_email, customer_phone, boats(name)')
    .eq('company_id', userRecord.company_id)
    .order('booking_date', { ascending: false })

  // Group bookings by customer (using email as unique identifier)
  const customerMap = new Map()

  bookings?.forEach(booking => {
    // Use email as primary key, fallback to phone if no email
    const customerId = booking.customer_email || booking.customer_phone

    if (!customerId) return // Skip if neither email nor phone

    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        id: customerId,
        name: booking.customer_name,
        email: booking.customer_email || '',
        phone: booking.customer_phone || '',
        bookings: [],
        totalSpent: 0,
        lastBooking: booking.booking_date,
        notes: '',
        preferences: '',
      })
    }

    const customer = customerMap.get(customerId)
    customer.bookings.push({
      id: booking.id,
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      status: booking.status,
      total_price: booking.total_price,
      package_type: booking.package_type,
      boats: booking.boats,
    })

    // Update total spent (only for confirmed/completed bookings)
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      customer.totalSpent += booking.total_price
    }

    // Update last booking date
    if (booking.booking_date > customer.lastBooking) {
      customer.lastBooking = booking.booking_date
    }
  })

  // Convert map to array and sort by total spent
  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)

  // TODO: Fetch customer notes from a customer_notes table
  // For now, we'll handle this in the API endpoint

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">Track customers, history, and preferences</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <CustomersClient customers={customers} />
      </div>
    </div>
  )
}

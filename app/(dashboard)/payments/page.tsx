import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import PaymentsClient from './payments-client'

export default async function PaymentsPage() {
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

  // Only admin, manager, office_staff, and accountant can access payments
  if (!['admin', 'operations_manager', 'office_staff', 'accounting_manager'].includes(userRecord.role)) {
    redirect('/dashboard')
  }

  // Get all bookings with payment transactions
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_date,
      start_time,
      customer_name,
      customer_email,
      customer_phone,
      total_price,
      status,
      boats(name),
      payment_transactions(
        id,
        amount,
        payment_type,
        payment_method,
        transaction_reference,
        notes,
        payment_date,
        created_at
      )
    `)
    .eq('company_id', userRecord.company_id)
    .in('status', ['pending_hold', 'confirmed', 'completed'])
    .order('booking_date', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment Tracking</h1>
            <p className="text-muted-foreground">
              Track deposits, final payments, and outstanding balances
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <PaymentsClient bookings={(bookings as any) || []} />
      </div>
    </div>
  )
}

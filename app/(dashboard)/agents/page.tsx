import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import AgentsClient from './agents-client'

export default async function AgentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current user's role
  const { data: currentUser } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!currentUser) redirect('/login')

  // Only admin and manager can access agent management
  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    redirect('/dashboard')
  }

  // Get all agents with performance metrics
  const { data: agents } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', currentUser.company_id)
    .in('role', ['regular_agent', 'power_agent', 'admin', 'office_staff', 'manager', 'captain'])
    .order('created_at', { ascending: false })

  // Get performance metrics for each agent
  const agentsWithMetrics = await Promise.all(
    (agents || []).map(async (agent) => {
      // Get total bookings
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id)

      // Get total revenue
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('agent_id', agent.id)
        .eq('status', 'confirmed')

      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

      // Calculate pending commission
      const pendingCommission = (totalRevenue * agent.commission_percentage) / 100

      return {
        ...agent,
        total_bookings: totalBookings || 0,
        total_revenue: totalRevenue,
        pending_commission: pendingCommission,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agent Management</h1>
            <p className="text-muted-foreground">Manage team members and track performance</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <AgentsClient agents={agentsWithMetrics} currentUserRole={currentUser.role} />
      </div>
    </div>
  )
}

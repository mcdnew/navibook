import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import WaitlistClient from './waitlist-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Clock } from 'lucide-react'

export default async function WaitlistPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) redirect('/login')

  // Fetch all waitlist entries
  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*, boats(id, name)')
    .eq('company_id', userRecord.company_id)
    .order('created_at', { ascending: false })

  // Fetch boats for the convert form
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, boat_type, capacity')
    .eq('company_id', userRecord.company_id)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              Waitlist
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage customer waiting list for unavailable dates
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild className="gap-2">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>

        <WaitlistClient waitlist={waitlist || []} boats={boats || []} />
      </div>
    </div>
  )
}

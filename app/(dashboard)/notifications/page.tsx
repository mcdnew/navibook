import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import NotificationsClient from './notifications-client'

export default async function NotificationsPage() {
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

  // Get notification history for the user's company
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('company_id', userRecord.company_id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Manage notification settings and view notification history
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <NotificationsClient notifications={notifications || []} />
      </div>
    </div>
  )
}

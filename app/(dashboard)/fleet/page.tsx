import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import FleetManagementClient from './fleet-management-client'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function FleetPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: boats } = await supabase
    .from('boats')
    .select(`
      *,
      default_captain:users!boats_default_captain_id_fkey(
        id,
        first_name,
        last_name
      )
    `)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">Manage your boats and vessels</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <FleetManagementClient boats={boats || []} />
      </div>
    </div>
  )
}

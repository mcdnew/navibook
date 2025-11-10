import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <p className="text-sm text-muted-foreground">
              Captain {userRecord?.first_name}
            </p>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Logout
            </Button>
          </form>
        </div>

        <div className="p-8 bg-white rounded-lg border-2 border-dashed border-gray-300 text-center space-y-4">
          <p className="text-4xl">⛵</p>
          <h2 className="text-xl font-semibold">Captain's View</h2>
          <p className="text-muted-foreground">
            View and manage your assigned charters.
          </p>
          <p className="text-sm text-muted-foreground">
            Coming soon!
          </p>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" asChild>
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

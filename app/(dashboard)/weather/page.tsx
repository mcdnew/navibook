import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import WeatherClient from './weather-client'

export default async function WeatherPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Weather Forecast</h1>
            <p className="text-muted-foreground">
              Marine weather conditions and forecasts for safe boating
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        <WeatherClient />
      </div>
    </div>
  )
}

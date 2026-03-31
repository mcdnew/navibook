import { createClient } from '@/lib/supabase/server'
import LandingClient from '@/components/landing-client'

// NaviBook landing page
export default async function Home() {
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .single()

  return <LandingClient companyName={company?.name} />
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This endpoint can be called by a cron job to clean up expired holds
export const dynamic = 'force-dynamic'
export const revalidate = 0

// It can also be protected with a secret token for security
export async function GET(request: Request) {
  try {
    // Optional: Add authorization check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_expired_holds')

    if (error) {
      console.error('Error cleaning up expired holds:', error)
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${data} expired hold(s)`,
      count: data,
    })
  } catch (error: any) {
    console.error('Cleanup cron error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

// Also allow POST for easier testing
export async function POST(request: Request) {
  return GET(request)
}

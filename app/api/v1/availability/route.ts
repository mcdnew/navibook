import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

const VALID_DURATIONS = ['2h', '3h', '4h', '8h'] as const
type Duration = typeof VALID_DURATIONS[number]

function parseDurationHours(duration: Duration): number {
  return parseInt(duration.replace('h', ''), 10)
}

function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + hours * 60
  const endH = Math.floor(totalMinutes / 60) % 24
  const endM = totalMinutes % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

function isValidTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time)
}

function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

export async function GET(request: Request) {
  try {
    // Authenticate
    const apiKeyResult = await validateApiKey(request)
    if (!apiKeyResult) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }
    if (apiKeyResult.revoked) {
      return NextResponse.json({ error: 'API key has been revoked' }, { status: 401 })
    }

    // Rate limit
    if (!checkRateLimit(apiKeyResult.keyId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Maximum 60 requests per minute.' }, { status: 429 })
    }

    const { companyId } = apiKeyResult
    const { searchParams } = new URL(request.url)

    const date = searchParams.get('date')
    const startTime = searchParams.get('start_time')
    const duration = searchParams.get('duration') as Duration | null
    const passengersParam = searchParams.get('passengers')
    const passengers = passengersParam ? parseInt(passengersParam, 10) : 1

    // Validate required params
    if (!date || !startTime || !duration) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, start_time, duration' },
        { status: 400 }
      )
    }

    if (!isValidDateFormat(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    if (!isValidTimeFormat(startTime)) {
      return NextResponse.json({ error: 'Invalid start_time format. Use HH:MM' }, { status: 400 })
    }

    if (!VALID_DURATIONS.includes(duration)) {
      return NextResponse.json(
        { error: `Invalid duration. Must be one of: ${VALID_DURATIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Date not in past
    const today = new Date().toISOString().split('T')[0]
    if (date < today) {
      return NextResponse.json({ error: 'Date cannot be in the past' }, { status: 400 })
    }

    if (isNaN(passengers) || passengers < 1) {
      return NextResponse.json({ error: 'passengers must be a positive integer' }, { status: 400 })
    }

    const endTime = addHoursToTime(startTime, parseDurationHours(duration))

    const supabase = createAdminClient()

    // Get available boats via RPC
    const { data: boats, error: boatsError } = await supabase.rpc('get_available_boats', {
      p_company_id: companyId,
      p_booking_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_min_capacity: passengers,
    })

    if (boatsError) {
      console.error('get_available_boats error:', boatsError)
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }

    if (!boats || boats.length === 0) {
      return NextResponse.json({
        available: false,
        date,
        start_time: startTime,
        end_time: endTime,
        duration,
        boats: [],
      })
    }

    // Fetch pricing for each available boat
    const boatIds = boats.map((b: { boat_id: string }) => b.boat_id)
    const { data: pricing, error: pricingError } = await supabase
      .from('pricing')
      .select('boat_id, duration, package_type, price')
      .in('boat_id', boatIds)
      .eq('duration', duration)

    if (pricingError) {
      console.error('pricing fetch error:', pricingError)
    }

    const pricingByBoat: Record<string, Array<{ package_type: string; price: number }>> = {}
    if (pricing) {
      for (const p of pricing) {
        if (!pricingByBoat[p.boat_id]) pricingByBoat[p.boat_id] = []
        pricingByBoat[p.boat_id].push({ package_type: p.package_type, price: p.price })
      }
    }

    const result = boats.map((boat: { boat_id: string; boat_name: string; boat_type: string; capacity: number; image_url: string | null }) => ({
      boat_id: boat.boat_id,
      name: boat.boat_name,
      type: boat.boat_type,
      capacity: boat.capacity,
      image_url: boat.image_url,
      pricing: pricingByBoat[boat.boat_id] || [],
    }))

    return NextResponse.json({
      available: result.length > 0,
      date,
      start_time: startTime,
      end_time: endTime,
      duration,
      boats: result,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('v1/availability error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

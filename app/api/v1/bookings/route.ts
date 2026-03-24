import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

const VALID_DURATIONS = ['2h', '3h', '4h', '8h'] as const
type Duration = typeof VALID_DURATIONS[number]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

async function calculateCostsServerSide(
  supabase: ReturnType<typeof createAdminClient>,
  boatId: string,
  companyId: string,
  duration: string,
  packageType: string,
  passengers: number
): Promise<{ fuel_cost: number; package_addon_cost: number }> {
  const durationHours = parseDurationHours(duration as Duration)

  // Fuel cost
  let fuel_cost = 0
  const { data: fuelConfig } = await supabase
    .from('boat_fuel_config')
    .select('fuel_consumption_rate, fuel_price_per_liter')
    .eq('boat_id', boatId)
    .single()

  if (fuelConfig && durationHours > 0) {
    fuel_cost = Math.round(fuelConfig.fuel_consumption_rate * durationHours * fuelConfig.fuel_price_per_liter * 100) / 100
  }

  // Package addon cost
  let package_addon_cost = 0
  if (packageType !== 'charter_only') {
    const { data: pkgConfig } = await supabase
      .from('company_package_config')
      .select('drinks_cost_per_person, food_cost_per_person')
      .eq('company_id', companyId)
      .single()

    if (pkgConfig) {
      switch (packageType) {
        case 'charter_drinks':
          package_addon_cost = (pkgConfig.drinks_cost_per_person || 0) * passengers
          break
        case 'charter_food':
          package_addon_cost = (pkgConfig.food_cost_per_person || 0) * passengers
          break
        case 'charter_full':
          package_addon_cost = ((pkgConfig.drinks_cost_per_person || 0) + (pkgConfig.food_cost_per_person || 0)) * passengers
          break
      }
      package_addon_cost = Math.round(package_addon_cost * 100) / 100
    }
  }

  return { fuel_cost, package_addon_cost }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const {
      boat_id,
      date,
      start_time,
      duration,
      passengers,
      customer_name,
      customer_phone,
      customer_email,
      package_type = 'charter_only',
      notes,
      partner_reference,
    } = body

    // Validate required fields
    const missing: string[] = []
    if (!boat_id) missing.push('boat_id')
    if (!date) missing.push('date')
    if (!start_time) missing.push('start_time')
    if (!duration) missing.push('duration')
    if (passengers === undefined || passengers === null) missing.push('passengers')
    if (!customer_name) missing.push('customer_name')
    if (!customer_phone) missing.push('customer_phone')

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate boat_id UUID format
    if (!UUID_REGEX.test(boat_id)) {
      return NextResponse.json({ error: 'boat_id must be a valid UUID' }, { status: 400 })
    }

    // Validate duration
    if (!VALID_DURATIONS.includes(duration)) {
      return NextResponse.json(
        { error: `Invalid duration. Must be one of: ${VALID_DURATIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate date not in past
    const today = new Date().toISOString().split('T')[0]
    if (date < today) {
      return NextResponse.json({ error: 'Booking date cannot be in the past' }, { status: 400 })
    }

    const passengersNum = parseInt(passengers, 10)
    if (isNaN(passengersNum) || passengersNum < 1) {
      return NextResponse.json({ error: 'passengers must be a positive integer' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify boat belongs to company and is active
    const { data: boat, error: boatError } = await supabase
      .from('boats')
      .select('id, name, is_active')
      .eq('id', boat_id)
      .eq('company_id', companyId)
      .single()

    if (boatError || !boat) {
      return NextResponse.json({ error: 'Boat not found for this company' }, { status: 404 })
    }

    if (!boat.is_active) {
      return NextResponse.json({ error: 'Boat is not active' }, { status: 422 })
    }

    // Lookup pricing
    const { data: pricingRow, error: pricingError } = await supabase
      .from('pricing')
      .select('price')
      .eq('boat_id', boat_id)
      .eq('duration', duration)
      .eq('package_type', package_type)
      .single()

    if (pricingError || !pricingRow) {
      return NextResponse.json(
        { error: `No pricing found for boat, duration "${duration}", and package "${package_type}"` },
        { status: 422 }
      )
    }

    const totalPrice = pricingRow.price

    // Calculate costs
    const { fuel_cost, package_addon_cost } = await calculateCostsServerSide(
      supabase,
      boat_id,
      companyId,
      duration,
      package_type,
      passengersNum
    )

    const endTime = addHoursToTime(start_time, parseDurationHours(duration as Duration))

    // Build notes with partner reference
    const finalNotes = partner_reference
      ? `[REF: ${partner_reference}] ${notes || ''}`.trim()
      : (notes || null)

    // Call create_booking_with_hold RPC
    const { data: bookingId, error: rpcError } = await supabase.rpc('create_booking_with_hold', {
      p_company_id: companyId,
      p_boat_id: boat_id,
      p_agent_id: null,
      p_booking_date: date,
      p_start_time: start_time,
      p_duration: duration,
      p_customer_name: customer_name,
      p_customer_phone: customer_phone,
      p_passengers: passengersNum,
      p_package_type: package_type,
      p_total_price: totalPrice,
      p_captain_fee: 0,
      p_deposit_amount: 0,
      p_captain_id: null,
      p_customer_email: customer_email || null,
      p_notes: finalNotes,
      p_booking_category: 'commercial',
      p_discount_percentage: 0,
      p_is_bare_boat: false,
      p_fuel_cost: fuel_cost,
      p_package_addon_cost: package_addon_cost,
      p_cancellation_policy_id: null,
      p_instructor_id: null,
    })

    if (rpcError) {
      const msg = rpcError.message || ''
      if (
        msg.includes('not available') ||
        msg.includes('overlap') ||
        msg.includes('conflict') ||
        msg.includes('already booked')
      ) {
        return NextResponse.json({ error: 'Boat is not available for the selected time slot' }, { status: 409 })
      }
      console.error('create_booking_with_hold error:', rpcError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Update source to 'api'
    await supabase
      .from('bookings')
      .update({ source: 'api' })
      .eq('id', bookingId)

    return NextResponse.json(
      {
        booking_id: bookingId,
        status: 'pending_hold',
        boat_id,
        boat_name: boat.name,
        date,
        start_time,
        end_time: endTime,
        duration,
        passengers: passengersNum,
        package_type,
        total_price: totalPrice,
        fuel_cost,
        package_addon_cost,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        notes: finalNotes,
        partner_reference: partner_reference || null,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('v1/bookings POST error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

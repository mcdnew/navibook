import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateFuelCost, calculatePackageAddonCost } from '@/lib/booking/cost-calculator'

export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function POST(request: Request) {
  try {
    const {
      bookingId,
      customerName,
      customerPhone,
      customerEmail,
      passengers,
      packageType,
      captainId,
      captainFee,
      totalPrice,
      depositAmount,
      notes,
    } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Customer name and phone are required' },
        { status: 400 }
      )
    }

    if (!passengers || passengers < 1) {
      return NextResponse.json(
        { error: 'Valid passenger count is required' },
        { status: 400 }
      )
    }

    if (totalPrice !== undefined && (typeof totalPrice !== 'number' || totalPrice < 0)) {
      return NextResponse.json(
        { error: 'Valid total price is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's role for permission checks
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user can modify captain/sailor assignments
    const canModifyCrew = ['admin', 'manager', 'office_staff'].includes(userRecord.role)

    // Get current booking to check capacity
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, boats(capacity)')
      .eq('id', bookingId)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking can be edited
    if (currentBooking.status === 'completed' || currentBooking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot edit completed or cancelled bookings' },
        { status: 400 }
      )
    }

    // Check passenger capacity
    if (passengers > currentBooking.boats?.capacity) {
      return NextResponse.json(
        { error: `Passenger count exceeds boat capacity of ${currentBooking.boats?.capacity}` },
        { status: 400 }
      )
    }

    // Recalculate costs if package_type or passengers changed
    let fuelCost = currentBooking.fuel_cost || 0
    let packageAddonCost = currentBooking.package_addon_cost || 0

    try {
      // Recalculate fuel cost (unchanged booking date/duration so fuel cost stays same)
      fuelCost = await calculateFuelCost(currentBooking.boat_id, currentBooking.duration)

      // Recalculate package addon cost (may change if passengers or packageType changed)
      const newPackageType = packageType || currentBooking.package_type
      const newPassengers = passengers || currentBooking.passengers
      packageAddonCost = await calculatePackageAddonCost(
        userRecord.company_id,
        newPackageType,
        newPassengers
      )
    } catch (costError) {
      console.error('Error recalculating costs:', costError)
      // Continue with update even if cost calculation fails
    }

    // Prepare update data
    const updateData: any = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      passengers: passengers,
      package_type: packageType,
      deposit_amount: depositAmount,
      notes: notes,
      fuel_cost: fuelCost,
      package_addon_cost: packageAddonCost,
    }

    // Only update captain if user has permission
    if (canModifyCrew && captainId !== undefined) {
      updateData.captain_id = captainId || null
    }

    // Only update captain_fee if user has permission and value provided
    if (canModifyCrew && captainFee !== undefined) {
      updateData.captain_fee = captainFee || 0
    }

    // Only update total_price if provided
    if (totalPrice !== undefined) {
      updateData.total_price = totalPrice
    }

    // Update booking
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Edit booking error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update booking' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: data,
    })
  } catch (error: any) {
    console.error('Edit booking API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

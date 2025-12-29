/**
 * Booking Cost Calculator Utility
 * Calculates fuel costs and add-on costs for bookings
 */

import { createClient } from '@/lib/supabase/client'

export interface BookingCosts {
  fuel_cost: number
  package_addon_cost: number
}

/**
 * Convert duration string to hours
 * Handles: '2h', '3h', '4h', '8h'
 */
function getDurationInHours(duration: string): number {
  const match = duration.match(/(\d+)h/)
  return match ? parseInt(match[1]) : 0
}

/**
 * Calculate fuel cost for a booking
 * Formula: consumption_rate × duration_hours × price_per_liter
 */
export async function calculateFuelCost(
  boatId: string,
  duration: string
): Promise<number> {
  try {
    const supabase = createClient()

    // Get fuel config for boat
    const { data: fuelConfig, error } = await supabase
      .from('boat_fuel_config')
      .select('fuel_consumption_rate, fuel_price_per_liter')
      .eq('boat_id', boatId)
      .single()

    if (error || !fuelConfig) {
      console.log(`No fuel config found for boat ${boatId}`)
      return 0
    }

    // Calculate duration in hours
    const durationHours = getDurationInHours(duration)
    if (durationHours === 0) {
      console.warn(`Invalid duration format: ${duration}`)
      return 0
    }

    // Calculate fuel cost
    const fuelCost = fuelConfig.fuel_consumption_rate * durationHours * fuelConfig.fuel_price_per_liter

    return Math.round(fuelCost * 100) / 100 // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating fuel cost:', error)
    return 0
  }
}

/**
 * Calculate package add-on cost for a booking
 * Based on package type and number of passengers
 */
export async function calculatePackageAddonCost(
  companyId: string,
  packageType: string,
  passengers: number
): Promise<number> {
  try {
    const supabase = createClient()

    // If no package or only charter, no add-on cost
    if (packageType === 'charter_only' || !packageType) {
      return 0
    }

    // Get package config for company
    const { data: packageConfig, error } = await supabase
      .from('company_package_config')
      .select('drinks_cost_per_person, food_cost_per_person')
      .eq('company_id', companyId)
      .single()

    if (error || !packageConfig) {
      console.log(`No package config found for company ${companyId}`)
      return 0
    }

    let addonCost = 0

    switch (packageType) {
      case 'charter_drinks':
        addonCost = (packageConfig.drinks_cost_per_person || 0) * passengers
        break
      case 'charter_food':
        addonCost = (packageConfig.food_cost_per_person || 0) * passengers
        break
      case 'charter_full':
        addonCost =
          ((packageConfig.drinks_cost_per_person || 0) + (packageConfig.food_cost_per_person || 0)) *
          passengers
        break
      default:
        addonCost = 0
    }

    return Math.round(addonCost * 100) / 100 // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating package addon cost:', error)
    return 0
  }
}

/**
 * Calculate all costs for a booking
 */
export async function calculateAllBookingCosts(
  boatId: string,
  companyId: string,
  duration: string,
  packageType: string,
  passengers: number
): Promise<BookingCosts> {
  const [fuel_cost, package_addon_cost] = await Promise.all([
    calculateFuelCost(boatId, duration),
    calculatePackageAddonCost(companyId, packageType, passengers),
  ])

  return {
    fuel_cost,
    package_addon_cost,
  }
}

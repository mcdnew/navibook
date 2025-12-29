#!/usr/bin/env node

/**
 * Migration Verification Script
 * Checks if the fuel and cost tracking migration was successfully applied
 *
 * Usage: node scripts/check-migration.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runQuery(name, query) {
  try {
    const { data, error } = await supabase.rpc('check_schema_item', { query })

    if (error) {
      console.log(`  ❌ ${name}: ${error.message}`)
      return false
    }

    console.log(`  ✅ ${name}: Found`)
    return true
  } catch (err) {
    console.log(`  ⚠️  ${name}: Could not verify`)
    return false
  }
}

async function checkMigration() {
  console.log('\n🔍 Verifying Migration: Fuel & Cost Tracking System\n')

  // Test 1: Try to select from new tables
  console.log('📋 Checking New Tables:')

  try {
    const { error: fuelError } = await supabase
      .from('boat_fuel_config')
      .select('id', { count: 'exact', head: true })

    if (!fuelError) {
      console.log('  ✅ boat_fuel_config table exists')
    } else {
      console.log('  ❌ boat_fuel_config table NOT FOUND')
    }
  } catch (err) {
    console.log('  ❌ boat_fuel_config table NOT FOUND')
  }

  try {
    const { error: packageError } = await supabase
      .from('company_package_config')
      .select('id', { count: 'exact', head: true })

    if (!packageError) {
      console.log('  ✅ company_package_config table exists')
    } else {
      console.log('  ❌ company_package_config table NOT FOUND')
    }
  } catch (err) {
    console.log('  ❌ company_package_config table NOT FOUND')
  }

  // Test 2: Check if bookings table has new columns
  console.log('\n📋 Checking Bookings Table Columns:')

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('fuel_cost, package_addon_cost, booking_category, discount_percentage, is_bare_boat')
      .limit(0)

    if (!error) {
      console.log('  ✅ fuel_cost column exists')
      console.log('  ✅ package_addon_cost column exists')
      console.log('  ✅ booking_category column exists')
      console.log('  ✅ discount_percentage column exists')
      console.log('  ✅ is_bare_boat column exists')
    } else {
      console.log(`  ❌ Missing columns: ${error.message}`)
    }
  } catch (err) {
    console.log('  ❌ Could not verify columns')
  }

  // Test 3: Sample data
  console.log('\n📊 Sample Data:')

  try {
    const { data: fuelConfigs, error: fuelError } = await supabase
      .from('boat_fuel_config')
      .select('boat_id, fuel_consumption_rate, fuel_price_per_liter')

    if (!fuelError && fuelConfigs) {
      console.log(`  ✅ boat_fuel_config: ${fuelConfigs.length} rows found`)
    } else {
      console.log(`  ⚠️  boat_fuel_config: Could not count rows`)
    }
  } catch (err) {
    console.log(`  ⚠️  boat_fuel_config: Could not read`)
  }

  try {
    const { data: packageConfigs, error: packageError } = await supabase
      .from('company_package_config')
      .select('company_id, drinks_cost_per_person, food_cost_per_person')

    if (!packageError && packageConfigs) {
      console.log(`  ✅ company_package_config: ${packageConfigs.length} rows found`)
    } else {
      console.log(`  ⚠️  company_package_config: Could not count rows`)
    }
  } catch (err) {
    console.log(`  ⚠️  company_package_config: Could not read`)
  }

  // Test 4: Check a sample booking
  console.log('\n📦 Sample Booking Check:')

  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, boat_id, fuel_cost, package_addon_cost, booking_category')
      .limit(1)

    if (!error && bookings && bookings.length > 0) {
      const booking = bookings[0]
      console.log(`  ✅ Sample booking found:`)
      console.log(`     - ID: ${booking.id}`)
      console.log(`     - Boat: ${booking.boat_id}`)
      console.log(`     - Fuel Cost: ${booking.fuel_cost || 'not set'}`)
      console.log(`     - Addon Cost: ${booking.package_addon_cost || 'not set'}`)
      console.log(`     - Category: ${booking.booking_category}`)
    } else {
      console.log(`  ⚠️  No bookings found in database`)
    }
  } catch (err) {
    console.log(`  ❌ Could not read booking data`)
  }

  console.log('\n✅ Verification Complete!\n')
}

checkMigration().catch(err => {
  console.error('❌ Verification failed:', err.message)
  process.exit(1)
})

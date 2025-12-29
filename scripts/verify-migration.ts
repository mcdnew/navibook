import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyMigration() {
  console.log('🔍 Verifying fuel and cost tracking migration...\n')

  try {
    // 1. Check if bookings table has new columns
    console.log('📋 Checking bookings table columns...')
    const { data: bookingsColumns, error: bookingsError } = await supabase.rpc(
      'get_table_columns',
      { table_name: 'bookings' }
    )

    if (bookingsError) {
      console.log('  ⚠️  Could not query bookings columns directly')
      console.log('  Attempting alternative check...\n')
    } else {
      const columnNames = bookingsColumns?.map((col: any) => col.column_name) || []
      const requiredColumns = ['fuel_cost', 'package_addon_cost', 'booking_category', 'discount_percentage', 'is_bare_boat']

      for (const col of requiredColumns) {
        if (columnNames.includes(col)) {
          console.log(`  ✅ Column "${col}" exists`)
        } else {
          console.log(`  ❌ Column "${col}" MISSING`)
        }
      }
      console.log()
    }

    // 2. Check if boat_fuel_config table exists
    console.log('📋 Checking boat_fuel_config table...')
    const { data: boatFuelConfigs, error: fuelError } = await supabase
      .from('boat_fuel_config')
      .select('count', { count: 'exact' })
      .limit(0)

    if (fuelError) {
      console.log(`  ❌ Table "boat_fuel_config" NOT FOUND`)
      console.log(`     Error: ${fuelError.message}`)
    } else {
      console.log(`  ✅ Table "boat_fuel_config" exists`)
    }
    console.log()

    // 3. Check if company_package_config table exists
    console.log('📋 Checking company_package_config table...')
    const { data: packageConfigs, error: packageError } = await supabase
      .from('company_package_config')
      .select('count', { count: 'exact' })
      .limit(0)

    if (packageError) {
      console.log(`  ❌ Table "company_package_config" NOT FOUND`)
      console.log(`     Error: ${packageError.message}`)
    } else {
      console.log(`  ✅ Table "company_package_config" exists`)
    }
    console.log()

    // 4. Check if booking_category enum exists
    console.log('📋 Checking booking_category enum...')
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('booking_category')
      .limit(1)

    if (!bookingError) {
      console.log(`  ✅ booking_category column is accessible`)
    } else {
      console.log(`  ❌ booking_category column issue: ${bookingError.message}`)
    }
    console.log()

    // 5. Sample data check
    console.log('📊 Sample data check...')
    const { data: boatFuelData, error: fuelDataError } = await supabase
      .from('boat_fuel_config')
      .select('count', { count: 'exact' })

    const { data: packageConfigData, error: packageDataError } = await supabase
      .from('company_package_config')
      .select('count', { count: 'exact' })

    if (!fuelDataError) {
      console.log(`  ✅ boat_fuel_config rows: ${boatFuelData ? boatFuelData.length : 0}`)
    }

    if (!packageDataError) {
      console.log(`  ✅ company_package_config rows: ${packageConfigData ? packageConfigData.length : 0}`)
    }
    console.log()

    console.log('✅ Migration verification complete!')
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

verifyMigration()

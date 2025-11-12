const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const PRESERVED_ADMIN_EMAIL = 'admin@navibook.com'

console.log('🧹 Database Cleanup Script')
console.log('===========================\n')

async function cleanDatabase() {
  try {
    // Step 1: Find and preserve admin user
    console.log('1️⃣  Finding preserved admin...')
    const { data: preservedAdmin } = await supabase
      .from('users')
      .select('id, email, company_id')
      .eq('email', PRESERVED_ADMIN_EMAIL)
      .single()

    if (!preservedAdmin) {
      throw new Error(`❌ Admin user ${PRESERVED_ADMIN_EMAIL} not found!`)
    }
    console.log(`✅ Found admin: ${preservedAdmin.email}`)

    // Step 2: Clear all auth users except admin
    console.log('\n2️⃣  Cleaning auth.users...')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
    } else {
      let deletedCount = 0
      for (const user of users) {
        if (user.email !== PRESERVED_ADMIN_EMAIL) {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
          if (!deleteError) {
            deletedCount++
          } else {
            console.error(`   ✗ Failed to delete ${user.email}:`, deleteError.message)
          }
        }
      }
      console.log(`✅ Deleted ${deletedCount} auth users`)
    }

    // Step 3: Clear existing data (except preserved admin)
    console.log('\n3️⃣  Clearing database tables...')

    // Delete in correct order due to foreign keys
    await supabase.from('payment_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared payment_transactions')

    await supabase.from('booking_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared booking_history')

    await supabase.from('customer_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared customer_notes')

    await supabase.from('waitlist').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared waitlist')

    await supabase.from('blocked_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared blocked_slots')

    // Clear bookings first (this allows boats to be deleted)
    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared bookings')

    // Now clear pricing (depends on boats)
    await supabase.from('pricing').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared pricing')

    // Now boats can be safely deleted
    await supabase.from('boats').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared boats (all deleted)')

    // Delete users except preserved admin
    await supabase.from('users').delete().neq('id', preservedAdmin.id)
    console.log('   ✓ Cleared users (except admin)')

    console.log('\n✅ Database cleaned successfully!')
    console.log('\n📝 Next step: Run `pnpm seed-demo` to create fresh demo data')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

cleanDatabase()

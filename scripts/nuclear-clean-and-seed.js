const { Client } = require('pg')
const { execSync } = require('child_process')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]

const connectionString = process.env.DATABASE_URL ||
  `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`

console.log('💣 NUCLEAR DATABASE CLEANUP')
console.log('============================\n')

async function nuclearClean() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('📡 Connected to database\n')

    // Get admin user ID first
    console.log('1️⃣  Finding admin user...')
    const adminResult = await client.query(
      "SELECT id FROM users WHERE email = 'admin@navibook.com' LIMIT 1"
    )

    if (adminResult.rows.length === 0) {
      throw new Error('Admin user not found!')
    }

    const adminId = adminResult.rows[0].id
    console.log(`✅ Found admin: ${adminId}\n`)

    // NUCLEAR DELETE - Delete EVERYTHING using TRUNCATE CASCADE
    console.log('2️⃣  NUCLEAR DELETE - Using TRUNCATE CASCADE for complete cleanup...\n')

    // TRUNCATE CASCADE - Most forceful deletion, ignores all foreign keys
    const tables = [
      'payment_transactions',
      'booking_history',
      'waitlist',
      'blocked_slots',
      'bookings',
      'pricing',
      'boats'
    ]

    for (const table of tables) {
      try {
        await client.query(`TRUNCATE TABLE ${table} CASCADE`)
        console.log(`   ✓ TRUNCATED ${table}`)
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ⊘ Skipped ${table} (doesn't exist)`)
        } else {
          console.log(`   ⚠️  Error with ${table}: ${error.message}`)
        }
      }
    }

    // Delete all users EXCEPT admin (can't TRUNCATE users because of auth)
    const userResult = await client.query(
      `DELETE FROM users WHERE id != $1`,
      [adminId]
    )
    console.log(`   ✓ Deleted ${userResult.rowCount} users (kept admin)\n`)

    // Verify boats are completely gone
    const boatCheck = await client.query('SELECT COUNT(*) as count FROM boats')
    console.log(`3️⃣  Verification: ${boatCheck.rows[0].count} boats remaining`)

    if (boatCheck.rows[0].count !== '0') {
      console.log('   ❌ Boats still exist! Something is wrong.')
    } else {
      console.log('   ✅ All boats completely removed\n')
    }

    await client.end()

    console.log('✅ Database completely cleaned!\n')
    console.log('🌱 Starting fresh seed...\n')
    console.log('='.repeat(60))

    // Now seed fresh data
    execSync('node scripts/seed-demo-data.js', {
      stdio: 'inherit',
      cwd: process.cwd()
    })

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    await client.end().catch(() => {})
    process.exit(1)
  }
}

nuclearClean()

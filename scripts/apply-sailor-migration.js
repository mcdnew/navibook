const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

console.log('🚢 Applying Sailor Personnel Migration (015)...\n')

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.log('❌ DATABASE_URL not found in .env.local')
    console.log('ℹ️  Please set DATABASE_URL in your .env.local file\n')
    console.log('Alternatively, copy and run this SQL in Supabase SQL Editor:')
    console.log('File: supabase/migrations/015_sailor_personnel.sql\n')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('📡 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!\n')

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/015_sailor_personnel.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📝 Applying migration 015_sailor_personnel.sql...')
    await client.query(migrationSQL)
    console.log('✅ Migration applied successfully!\n')

    // Verify the migration
    console.log('🔍 Verifying migration...')

    // Check if sailor role exists
    const roleCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'sailor'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
      );
    `)
    console.log(`  ✓ Sailor role: ${roleCheck.rows[0].exists ? 'EXISTS' : 'MISSING'}`)

    // Check if booking_sailors table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'booking_sailors'
      );
    `)
    console.log(`  ✓ booking_sailors table: ${tableCheck.rows[0].exists ? 'EXISTS' : 'MISSING'}`)

    // Check if sailor_fee column exists
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'sailor_fee'
      );
    `)
    console.log(`  ✓ sailor_fee column: ${columnCheck.rows[0].exists ? 'EXISTS' : 'MISSING'}`)

    // Check if default_captain_id column exists
    const captainCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'boats' AND column_name = 'default_captain_id'
      );
    `)
    console.log(`  ✓ default_captain_id column: ${captainCheck.rows[0].exists ? 'EXISTS' : 'MISSING'}`)

    console.log('\n🎉 Sailor personnel migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Go to /agents and create a sailor with hourly rate')
    console.log('2. Edit a booking and assign sailors')
    console.log('3. Check booking details to see sailors displayed')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigration()

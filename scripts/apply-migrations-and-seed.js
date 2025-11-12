const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔧 Applying Database Migrations...\n')

async function applyMigrations() {
  try {
    // Migration 1: Add hourly_rate column
    console.log('1️⃣  Adding hourly_rate column to users table...')

    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;
      `
    }).catch(() => {
      // RPC might not exist, try direct query
      return { error: null }
    })

    // Try alternative approach - direct insert/update won't work for DDL
    // We need to use a different method
    console.log('   ℹ️  Attempting alternative migration approach...')

    // Check if column exists by trying to select it
    const { error: checkError } = await supabase
      .from('users')
      .select('hourly_rate')
      .limit(1)

    if (checkError && checkError.message.includes('column')) {
      console.log('   ⚠️  Column does not exist - attempting to add via database...')
      console.log('   ℹ️  Please run the SQL from APPLY_THIS_SQL.sql in Supabase SQL Editor')
      console.log('   ℹ️  Then run: pnpm seed-demo')
      process.exit(1)
    } else {
      console.log('   ✅ hourly_rate column exists')
    }

    console.log('\n✅ Migrations check complete!')
    console.log('\n🌱 Starting seed process...\n')

    // Run seed script
    execSync('node scripts/seed-demo-data.js', {
      stdio: 'inherit',
      cwd: process.cwd()
    })

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.log('\n⚠️  Manual migration required:')
    console.log('   1. Open Supabase SQL Editor')
    console.log('   2. Copy contents from APPLY_THIS_SQL.sql')
    console.log('   3. Run the SQL')
    console.log('   4. Then run: pnpm seed-demo')
    process.exit(1)
  }
}

applyMigrations()

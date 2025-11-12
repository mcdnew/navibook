const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  console.log('🔧 Applying hourly_rate column migration...\n')

  // Add hourly_rate column to users table
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;
    `
  }).catch(() => ({ error: { message: 'RPC not available' } }))

  if (error) {
    console.log('ℹ️  Note: Could not execute via RPC.')
    console.log('Please run this SQL manually in Supabase SQL Editor:\n')
    console.log('ALTER TABLE users')
    console.log('ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;\n')
  } else {
    console.log('✅ Migration applied successfully!')
  }
}

applyMigration()

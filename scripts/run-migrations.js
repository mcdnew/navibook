const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try alternative method - direct query
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    }

    console.log(`✅ Migration ${filename} completed successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Migration ${filename} failed:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_functions.sql'
  ];

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error('\n❌ Migration process stopped due to error');
      process.exit(1);
    }
    // Wait a bit between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ All migrations completed successfully! 🎉');
  console.log('\nNext steps:');
  console.log('1. Check your Supabase dashboard - Table Editor to see the tables');
  console.log('2. Enable Realtime for the bookings table');
  console.log('3. Create your first admin user');
}

main().catch(console.error);

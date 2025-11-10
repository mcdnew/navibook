const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('📦 Connecting to Supabase database...');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '008_blocked_slots_fixed.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('⚡ Executing migration...\n');

    // Execute the migration
    const result = await pool.query(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('\nCreated:');
    console.log('  - blocked_slots table');
    console.log('  - is_slot_blocked() function');
    console.log('  - Updated check_boat_availability() function');
    console.log('  - get_blocked_slots_for_range() function');
    console.log('  - RLS policies');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();

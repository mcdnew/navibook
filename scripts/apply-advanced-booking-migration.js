const { readFileSync } = require('fs');
const { join } = require('path');

// Read the DATABASE_URL from .env.local
require('dotenv').config({ path: join(__dirname, '..', '.env.local') });

const { Client } = require('pg');

async function applyMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '006_advanced_booking_features.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('Applying advanced booking features migration...');
    await client.query(migrationSQL);

    console.log('✓ Migration applied successfully!');
    console.log('\nCreated:');
    console.log('  - cancellation_policies table');
    console.log('  - booking_templates table');
    console.log('  - recurring_bookings table');
    console.log('  - group_bookings table');
    console.log('  - waitlist table');
    console.log('  - Refund calculation function');
    console.log('  - Auto-expire waitlist function');
    console.log('  - Default cancellation policy');
    console.log('\n✓ Advanced booking features are now ready to use!');
  } catch (error) {
    console.error('Error applying migration:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n⚠ Migration already applied. No action needed.');
    } else {
      throw error;
    }
  } finally {
    await client.end();
  }
}

applyMigration().catch(console.error);

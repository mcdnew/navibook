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
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '004_payment_transactions.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('Applying payment_transactions migration...');
    await client.query(migrationSQL);

    console.log('✓ Migration applied successfully!');
    console.log('\nCreated:');
    console.log('  - payment_method enum');
    console.log('  - payment_type enum');
    console.log('  - payment_transactions table');
    console.log('  - get_total_paid() function');
    console.log('  - get_outstanding_balance() function');
    console.log('  - booking_payment_status view');
    console.log('\n✓ Payment tracking is now ready to use!');
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

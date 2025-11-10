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
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '005_notifications.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('Applying notifications migration...');
    await client.query(migrationSQL);

    console.log('✓ Migration applied successfully!');
    console.log('\nCreated:');
    console.log('  - notification_type enum');
    console.log('  - notification_channel enum');
    console.log('  - notification_status enum');
    console.log('  - notifications table');
    console.log('  - notification_preferences table');
    console.log('  - customer_notification_preferences table');
    console.log('  - scheduled_notifications table');
    console.log('  - Auto-reminder scheduling trigger');
    console.log('\n✓ Notification system is now ready to use!');
    console.log('\n⚠ Don\'t forget to:');
    console.log('  1. Sign up at https://resend.com');
    console.log('  2. Get your API key');
    console.log('  3. Add RESEND_API_KEY to .env.local');
    console.log('  4. Add RESEND_FROM_EMAIL to .env.local');
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

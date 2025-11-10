#!/usr/bin/env node

const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function enableRealtime() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    const tables = ['bookings', 'boats', 'boat_blocks'];

    console.log('📡 Enabling Realtime for tables...\n');

    for (const table of tables) {
      try {
        // Add table to the realtime publication
        await client.query(`
          ALTER PUBLICATION supabase_realtime ADD TABLE ${table};
        `);
        console.log(`✅ Realtime enabled for: ${table}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('already a member')) {
          console.log(`✅ Realtime already enabled for: ${table}`);
        } else {
          console.error(`❌ Failed to enable Realtime for ${table}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Realtime configuration complete!\n');
    console.log('📋 Real-time is now enabled for:');
    console.log('   - bookings (live booking updates)');
    console.log('   - boats (fleet changes)');
    console.log('   - boat_blocks (maintenance periods)\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

enableRealtime();

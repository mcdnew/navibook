#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Get database URL from environment or construct it
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\n❌ DATABASE_URL not found in .env.local');
  console.error('\n📋 To get your database URL:');
  console.error('   1. Go to Supabase Dashboard → Project Settings');
  console.error('   2. Click "Database" in the left menu');
  console.error('   3. Scroll to "Connection string" section');
  console.error('   4. Copy the "URI" connection string');
  console.error('   5. Add it to .env.local as: DATABASE_URL=your-connection-string');
  console.error('\n💡 It looks like: postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres\n');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    const migrations = [
      '001_initial_schema.sql',
      '002_rls_policies.sql',
      '003_functions.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📄 Running: ${migrationFile}`);

      const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      try {
        await client.query(sql);
        console.log(`✅ ${migrationFile} completed\n`);
      } catch (error) {
        console.error(`❌ ${migrationFile} failed:`);
        console.error(`   ${error.message}\n`);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Check Supabase Dashboard → Table Editor to see your tables');
    console.log('   2. Enable Realtime for the bookings table');
    console.log('   3. Create your first admin user\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

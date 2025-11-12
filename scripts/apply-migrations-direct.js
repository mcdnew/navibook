const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

// Extract database connection info from Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Parse Supabase URL to get project reference
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]

if (!projectRef) {
  console.error('Could not parse Supabase project reference from URL')
  process.exit(1)
}

console.log('🔧 Applying Database Migrations via Direct PostgreSQL Connection...\n')

async function applyMigrations() {
  // Note: This requires the database connection string
  // Supabase hosted databases need the connection pooler URL

  const connectionString = process.env.DATABASE_URL ||
    `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`

  if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_PASSWORD) {
    console.log('❌ Database password not found in environment')
    console.log('ℹ️  You can find it in Supabase Dashboard → Settings → Database')
    console.log('\nAlternatively, run this SQL manually in Supabase SQL Editor:\n')
    console.log('File: APPLY_THIS_SQL.sql')
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

    // Migration 1: Add hourly_rate column
    console.log('1️⃣  Adding hourly_rate column to users table...')
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;
    `)
    console.log('✅ Column added\n')

    // Migration 2: Add comment
    console.log('2️⃣  Adding column comment...')
    await client.query(`
      COMMENT ON COLUMN users.hourly_rate IS 'Hourly rate for captains in EUR. 0 for non-captain roles.';
    `)
    console.log('✅ Comment added\n')

    // Migration 3: Update create_booking_with_hold function
    console.log('3️⃣  Updating create_booking_with_hold function...')
    await client.query(`
      CREATE OR REPLACE FUNCTION create_booking_with_hold(
        p_company_id UUID,
        p_boat_id UUID,
        p_agent_id UUID,
        p_booking_date DATE,
        p_start_time TIME,
        p_duration duration_type,
        p_customer_name TEXT,
        p_customer_phone TEXT,
        p_captain_id UUID DEFAULT NULL,
        p_customer_email TEXT DEFAULT NULL,
        p_passengers INTEGER DEFAULT 1,
        p_package_type package_type DEFAULT 'charter_only',
        p_total_price DECIMAL(10,2) DEFAULT 0,
        p_captain_fee DECIMAL(10,2) DEFAULT 0,
        p_deposit_amount DECIMAL(10,2) DEFAULT 0,
        p_notes TEXT DEFAULT NULL
      )
      RETURNS UUID AS $$
      DECLARE
        v_booking_id UUID;
        v_end_time TIME;
        v_is_available BOOLEAN;
      BEGIN
        v_end_time := calculate_end_time(p_start_time, p_duration);
        v_is_available := check_boat_availability(p_boat_id, p_booking_date, p_start_time, v_end_time);

        IF NOT v_is_available THEN
          RAISE EXCEPTION 'Boat is not available for the selected time slot';
        END IF;

        INSERT INTO bookings (
          company_id, boat_id, agent_id, captain_id, booking_date, start_time, end_time,
          duration, customer_name, customer_phone, customer_email, passengers, package_type,
          total_price, captain_fee, deposit_amount, status, hold_until
        ) VALUES (
          p_company_id, p_boat_id, p_agent_id, p_captain_id, p_booking_date, p_start_time, v_end_time,
          p_duration, p_customer_name, p_customer_phone, p_customer_email, p_passengers, p_package_type,
          p_total_price, p_captain_fee, p_deposit_amount, 'pending_hold', NOW() + INTERVAL '15 minutes'
        ) RETURNING id INTO v_booking_id;

        RETURN v_booking_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)
    console.log('✅ Function updated\n')

    await client.end()
    console.log('✅ All migrations applied successfully!\n')
    console.log('🌱 Now running seed script...\n')

    // Run seed script
    const { execSync } = require('child_process')
    execSync('node scripts/seed-demo-data.js', {
      stdio: 'inherit',
      cwd: process.cwd()
    })

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)

    if (error.message.includes('password') || error.message.includes('authentication')) {
      console.log('\n⚠️  Database password issue.')
      console.log('Please set SUPABASE_DB_PASSWORD in .env.local')
      console.log('Or run SQL manually from APPLY_THIS_SQL.sql')
    }

    await client.end().catch(() => {})
    process.exit(1)
  }
}

applyMigrations()

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('📦 Connecting to Supabase database...\n');

    // Step 1: Add enum values in a separate transaction
    console.log('Step 1: Adding user role enum values...');
    const enumSQL = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'company_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    ALTER TYPE user_role ADD VALUE 'company_admin';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'power_agent' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    ALTER TYPE user_role ADD VALUE 'power_agent';
  END IF;
END $$;
    `;

    await pool.query(enumSQL);
    console.log('✅ Enum values added\n');

    // Step 2: Create the table, indexes, and policies
    console.log('Step 2: Creating blocked_slots table and related objects...');
    const mainSQL = `
-- Drop old function if it exists
DROP FUNCTION IF EXISTS check_boat_availability(uuid,date,time,time,uuid);

-- Create blocked_slots table for maintenance and other unavailability reasons
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id UUID REFERENCES boats(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL,
  block_type VARCHAR(50) DEFAULT 'maintenance',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT idx_blocked_slots_lookup UNIQUE (company_id, boat_id, blocked_date, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_company ON blocked_slots(company_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_boat ON blocked_slots(boat_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date_range ON blocked_slots(blocked_date, start_time, end_time);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can insert blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can update blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can delete blocked slots" ON blocked_slots;

CREATE POLICY "Users can view company blocked slots"
  ON blocked_slots FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and power agents can insert blocked slots"
  ON blocked_slots FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'power_agent')
    )
  );

CREATE POLICY "Admins and power agents can update blocked slots"
  ON blocked_slots FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'power_agent')
    )
  );

CREATE POLICY "Admins and power agents can delete blocked slots"
  ON blocked_slots FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'power_agent')
    )
  );

CREATE OR REPLACE FUNCTION is_slot_blocked(
  p_boat_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id UUID;
  v_is_blocked BOOLEAN;
BEGIN
  SELECT company_id INTO v_company_id
  FROM boats
  WHERE id = p_boat_id;

  SELECT EXISTS (
    SELECT 1
    FROM blocked_slots
    WHERE company_id = v_company_id
      AND blocked_date = p_date
      AND (boat_id = p_boat_id OR boat_id IS NULL)
      AND (
        (start_time <= p_start_time AND end_time > p_start_time)
        OR (start_time < p_end_time AND end_time >= p_end_time)
        OR (start_time >= p_start_time AND end_time <= p_end_time)
      )
  ) INTO v_is_blocked;

  RETURN v_is_blocked;
END;
$$;

CREATE OR REPLACE FUNCTION check_boat_availability(
  p_boat_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_available BOOLEAN;
  v_is_blocked BOOLEAN;
BEGIN
  SELECT is_slot_blocked(p_boat_id, p_date, p_start_time, p_end_time)
  INTO v_is_blocked;

  IF v_is_blocked THEN
    RETURN FALSE;
  END IF;

  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE boat_id = p_boat_id
      AND booking_date = p_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
        (start_time <= p_start_time AND end_time > p_start_time)
        OR (start_time < p_end_time AND end_time >= p_end_time)
        OR (start_time >= p_start_time AND end_time <= p_end_time)
      )
  ) INTO v_is_available;

  RETURN v_is_available;
END;
$$;

CREATE OR REPLACE FUNCTION get_blocked_slots_for_range(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_boat_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  boat_id UUID,
  boat_name TEXT,
  blocked_date DATE,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  block_type VARCHAR(50),
  created_by UUID,
  creator_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bs.id,
    bs.boat_id,
    COALESCE(b.name, 'All Boats') as boat_name,
    bs.blocked_date,
    bs.start_time,
    bs.end_time,
    bs.reason,
    bs.block_type,
    bs.created_by,
    COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as creator_name,
    bs.created_at
  FROM blocked_slots bs
  LEFT JOIN boats b ON bs.boat_id = b.id
  LEFT JOIN users u ON bs.created_by = u.id
  WHERE bs.company_id = p_company_id
    AND bs.blocked_date BETWEEN p_start_date AND p_end_date
    AND (p_boat_id IS NULL OR bs.boat_id = p_boat_id OR bs.boat_id IS NULL)
  ORDER BY bs.blocked_date, bs.start_time;
END;
$$;

DROP TRIGGER IF EXISTS blocked_slots_updated_at ON blocked_slots;

CREATE OR REPLACE FUNCTION update_blocked_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blocked_slots_updated_at
  BEFORE UPDATE ON blocked_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_blocked_slots_updated_at();

COMMENT ON TABLE blocked_slots IS 'Stores blocked time slots for boats (maintenance, weather, etc.)';
    `;

    await pool.query(mainSQL);
    console.log('✅ Table and related objects created\n');

    console.log('🎉 Migration completed successfully!\n');
    console.log('Created:');
    console.log('  ✓ User roles: company_admin, power_agent');
    console.log('  ✓ blocked_slots table');
    console.log('  ✓ is_slot_blocked() function');
    console.log('  ✓ Updated check_boat_availability() function');
    console.log('  ✓ get_blocked_slots_for_range() function');
    console.log('  ✓ RLS policies');
    console.log('  ✓ Triggers');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();

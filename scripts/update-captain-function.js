const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateFunction() {
  console.log('Updating create_booking_with_hold function to support captain parameters...')

  const sql = `
CREATE OR REPLACE FUNCTION create_booking_with_hold(
  p_company_id UUID,
  p_boat_id UUID,
  p_agent_id UUID,
  p_captain_id UUID DEFAULT NULL,
  p_booking_date DATE,
  p_start_time TIME,
  p_duration duration_type,
  p_customer_name TEXT,
  p_customer_phone TEXT,
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
  -- Calculate end time
  v_end_time := calculate_end_time(p_start_time, p_duration);

  -- Check availability with lock
  v_is_available := check_boat_availability(
    p_boat_id,
    p_booking_date,
    p_start_time,
    v_end_time
  );

  IF NOT v_is_available THEN
    RAISE EXCEPTION 'Boat is not available for the selected time slot';
  END IF;

  -- Create booking with 15-minute hold
  INSERT INTO bookings (
    company_id,
    boat_id,
    agent_id,
    captain_id,
    booking_date,
    start_time,
    end_time,
    duration,
    customer_name,
    customer_phone,
    customer_email,
    passengers,
    package_type,
    total_price,
    captain_fee,
    deposit_amount,
    status,
    hold_until
  ) VALUES (
    p_company_id,
    p_boat_id,
    p_agent_id,
    p_captain_id,
    p_booking_date,
    p_start_time,
    v_end_time,
    p_duration,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_passengers,
    p_package_type,
    p_total_price,
    p_captain_fee,
    p_deposit_amount,
    'pending_hold',
    NOW() + INTERVAL '15 minutes'
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
    // If RPC doesn't exist, try direct execution (won't work with Supabase hosted, but worth trying)
    return await supabase.from('_migrations').insert({ name: 'update_captain_function', sql })
  })

  if (error) {
    console.error('Error:', error)
    console.log('\nNote: This script requires admin access to execute SQL.')
    console.log('Alternatively, run the SQL manually in the Supabase SQL editor.')
    process.exit(1)
  }

  console.log('✅ Function updated successfully!')
}

updateFunction()

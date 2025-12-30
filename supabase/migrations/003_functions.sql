-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to check boat availability
CREATE OR REPLACE FUNCTION check_boat_availability(
  p_boat_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_available BOOLEAN;
BEGIN
  -- Check for overlapping bookings
  SELECT NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE boat_id = p_boat_id
    AND booking_date = p_booking_date
    AND status NOT IN ('cancelled', 'no_show')
    AND (id != p_exclude_booking_id OR p_exclude_booking_id IS NULL)
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    )
  ) INTO v_is_available;

  -- Check for maintenance blocks
  IF v_is_available THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM boat_blocks
      WHERE boat_id = p_boat_id
      AND tstzrange(start_datetime, end_datetime) && tstzrange(
        (p_booking_date + p_start_time)::timestamptz,
        (p_booking_date + p_end_time)::timestamptz
      )
    ) INTO v_is_available;
  END IF;

  RETURN v_is_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available boats for a time slot
CREATE OR REPLACE FUNCTION get_available_boats(
  p_company_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_boat_type boat_type DEFAULT NULL,
  p_min_capacity INTEGER DEFAULT 1
)
RETURNS TABLE (
  boat_id UUID,
  boat_name TEXT,
  boat_type boat_type,
  capacity INTEGER,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.boat_type,
    b.capacity,
    b.image_url
  FROM boats b
  WHERE b.company_id = p_company_id
    AND b.is_active = true
    AND b.capacity >= p_min_capacity
    AND (p_boat_type IS NULL OR b.boat_type = p_boat_type)
    AND check_boat_availability(b.id, p_booking_date, p_start_time, p_end_time)
  ORDER BY b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate end time from duration
CREATE OR REPLACE FUNCTION calculate_end_time(
  p_start_time TIME,
  p_duration duration_type
)
RETURNS TIME AS $$
BEGIN
  RETURN CASE p_duration
    WHEN '2h' THEN p_start_time + INTERVAL '2 hours'
    WHEN '3h' THEN p_start_time + INTERVAL '3 hours'
    WHEN '4h' THEN p_start_time + INTERVAL '4 hours'
    WHEN '8h' THEN p_start_time + INTERVAL '8 hours'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get booking statistics for a date range
CREATE OR REPLACE FUNCTION get_booking_stats(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_bookings BIGINT,
  total_revenue DECIMAL(10,2),
  confirmed_bookings BIGINT,
  cancelled_bookings BIGINT,
  total_commissions DECIMAL(10,2),
  total_captain_fees DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_bookings,
    COALESCE(SUM(total_price), 0)::DECIMAL(10,2) as total_revenue,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_bookings,
    COALESCE(SUM(agent_commission), 0)::DECIMAL(10,2) as total_commissions,
    COALESCE(SUM(captain_fee), 0)::DECIMAL(10,2) as total_captain_fees
  FROM bookings
  WHERE company_id = p_company_id
    AND booking_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agent performance
CREATE OR REPLACE FUNCTION get_agent_performance(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  agent_id UUID,
  agent_name TEXT,
  total_bookings BIGINT,
  total_revenue DECIMAL(10,2),
  total_commission DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.first_name || ' ' || u.last_name as agent_name,
    COUNT(b.id)::BIGINT,
    COALESCE(SUM(b.total_price), 0)::DECIMAL(10,2),
    COALESCE(SUM(b.agent_commission), 0)::DECIMAL(10,2)
  FROM users u
  LEFT JOIN bookings b ON b.agent_id = u.id
    AND b.booking_date BETWEEN p_start_date AND p_end_date
    AND b.status NOT IN ('cancelled', 'no_show')
  WHERE u.company_id = p_company_id
    AND u.role IN ('regular_agent', 'power_agent')
  GROUP BY u.id, u.first_name, u.last_name
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired holds
CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE bookings
    SET status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = 'Hold expired'
    WHERE status = 'pending_hold'
      AND hold_until IS NOT NULL
      AND hold_until < NOW()
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER INTO v_updated_count FROM updated;

  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create booking with hold
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
  p_notes TEXT DEFAULT NULL,
  p_booking_category booking_category DEFAULT 'commercial',
  p_discount_percentage DECIMAL(5,2) DEFAULT 0,
  p_is_bare_boat BOOLEAN DEFAULT FALSE,
  p_fuel_cost DECIMAL(10,2) DEFAULT 0,
  p_package_addon_cost DECIMAL(10,2) DEFAULT 0,
  p_cancellation_policy_id UUID DEFAULT NULL,
  p_instructor_id UUID DEFAULT NULL
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
    hold_until,
    booking_category,
    discount_percentage,
    is_bare_boat,
    fuel_cost,
    package_addon_cost,
    cancellation_policy_id,
    instructor_id,
    notes
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
    NOW() + INTERVAL '15 minutes',
    p_booking_category,
    p_discount_percentage,
    p_is_bare_boat,
    p_fuel_cost,
    p_package_addon_cost,
    p_cancellation_policy_id,
    p_instructor_id,
    p_notes
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to confirm booking
CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID,
  p_deposit_paid BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  UPDATE bookings
  SET
    status = 'confirmed',
    deposit_paid = p_deposit_paid,
    hold_until = NULL
  WHERE id = p_booking_id
    AND status = 'pending_hold'
  RETURNING true INTO v_success;

  RETURN COALESCE(v_success, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEDULED CLEANUP (Call via pg_cron or Edge Function)
-- =====================================================

-- This function should be called periodically (e.g., every 5 minutes)
-- to clean up expired holds
CREATE OR REPLACE FUNCTION scheduled_cleanup()
RETURNS void AS $$
BEGIN
  PERFORM cleanup_expired_holds();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

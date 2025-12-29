-- Move booking category authorization from trigger to RLS policy
-- Single source of truth for authorization: RLS policies

-- ============================================================================
-- RLS POLICY: Booking Category Restrictions
-- ============================================================================

-- Enable RLS on bookings table (if not already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop old trigger that checked authorization (keep validation-only trigger)
-- The authorization will now be handled by RLS policies
DROP TRIGGER IF EXISTS trigger_check_booking_category_permission ON bookings;

CREATE POLICY "Agents restricted to commercial bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) NOT IN ('regular_agent', 'power_agent')
    OR booking_category = 'commercial'
  );

-- Policy: Same restriction for UPDATE operations
CREATE POLICY "Agents cannot change non-commercial bookings"
  ON bookings
  FOR UPDATE
  USING (true)
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) NOT IN ('regular_agent', 'power_agent')
    OR booking_category = 'commercial'
  );

-- ============================================================================
-- UPDATED TRIGGER: Data Validation Only (No Authorization)
-- ============================================================================

-- Create new validation-only trigger (authorization now in RLS)
CREATE OR REPLACE FUNCTION validate_booking_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that booking_category is a valid enum value
  -- This is handled by PostgreSQL enum type automatically, but we can add additional validation here

  -- Validate that bare boat bookings have captain_fee = 0
  IF NEW.is_bare_boat = true THEN
    NEW.captain_fee := 0;
    NEW.captain_id := NULL;
  END IF;

  -- Validate passenger count is positive
  IF NEW.passengers <= 0 THEN
    RAISE EXCEPTION 'Passenger count must be greater than 0';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation only (no authorization checking)
DROP TRIGGER IF EXISTS trigger_validate_booking_data ON bookings;

CREATE TRIGGER trigger_validate_booking_data
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking_data();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Agents restricted to commercial bookings" ON bookings
  IS 'Ensures regular and power agents can only create commercial bookings. Admins, managers, and office staff can create any booking category.';

COMMENT ON POLICY "Agents cannot change non-commercial bookings" ON bookings
  IS 'Prevents agents from updating non-commercial bookings or changing a booking to non-commercial category.';

COMMENT ON FUNCTION validate_booking_data()
  IS 'Validates booking data integrity: passenger count > 0, bare boat has no captain, etc. Does NOT check authorization (use RLS for that).';

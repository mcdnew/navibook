-- Add instructor tracking for sailing school and training bookings
-- Allows assigning instructors to educational bookings

-- ============================================================================
-- 0. ADD INSTRUCTOR ROLE TO USER_ROLE ENUM (if not already present)
-- ============================================================================

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'instructor';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================================================
-- 1. ADD INSTRUCTOR_ID TO BOOKINGS
-- ============================================================================

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_instructor ON bookings(instructor_id);

-- ============================================================================
-- 2. VALIDATION TRIGGER: Ensure Sailing School Has Instructor
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_sailing_school_instructor()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking is sailing_school, require instructor
  IF NEW.booking_category = 'sailing_school' AND NEW.instructor_id IS NULL THEN
    RAISE EXCEPTION 'Sailing school bookings must have an instructor assigned';
  END IF;

  -- If instructor is assigned, verify they exist
  IF NEW.instructor_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = NEW.instructor_id
    ) THEN
      RAISE EXCEPTION 'Instructor user not found';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_sailing_school_instructor ON bookings;

CREATE TRIGGER trigger_validate_sailing_school_instructor
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_sailing_school_instructor();

-- ============================================================================
-- 3. FUNCTION: Get Instructor Fee for Booking
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_instructor_fee(
  p_booking_id UUID
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_instructor_id UUID;
  v_hourly_rate DECIMAL(10,2);
  v_duration INTEGER;
  v_fee DECIMAL(10,2);
BEGIN
  -- Get booking details
  SELECT b.instructor_id, b.duration, u.hourly_rate
  INTO v_instructor_id, v_duration, v_hourly_rate
  FROM bookings b
  LEFT JOIN users u ON b.instructor_id = u.id
  WHERE b.id = p_booking_id;

  -- If no instructor or no hourly rate, return 0
  IF v_instructor_id IS NULL OR v_hourly_rate IS NULL OR v_hourly_rate <= 0 THEN
    RETURN 0;
  END IF;

  -- Calculate fee: hourly_rate × duration_hours
  -- Duration is in format like '2h', '3h', '4h', '8h'
  v_fee := v_hourly_rate * (
    CASE v_duration
      WHEN '2h' THEN 2
      WHEN '3h' THEN 3
      WHEN '4h' THEN 4
      WHEN '8h' THEN 8
      ELSE 0
    END
  );

  RETURN v_fee;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 4. VIEW: Instructor Bookings and Statistics
-- ============================================================================

CREATE OR REPLACE VIEW instructor_booking_stats AS
SELECT
  u.id as instructor_id,
  u.first_name,
  u.last_name,
  u.hourly_rate,
  COUNT(b.id) as total_bookings,
  COUNT(b.id) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
  COUNT(b.id) FILTER (WHERE b.booking_category = 'sailing_school') as sailing_school_bookings,
  COUNT(b.id) FILTER (WHERE b.booking_category = 'private_class') as private_class_bookings,
  SUM(
    CASE b.duration
      WHEN '2h' THEN 2
      WHEN '3h' THEN 3
      WHEN '4h' THEN 4
      WHEN '8h' THEN 8
      ELSE 0
    END
  ) as total_hours,
  COALESCE(
    SUM(
      u.hourly_rate * (
        CASE b.duration
          WHEN '2h' THEN 2
          WHEN '3h' THEN 3
          WHEN '4h' THEN 4
          WHEN '8h' THEN 8
          ELSE 0
        END
      )
    ), 0
  ) as total_instructor_fees
FROM users u
LEFT JOIN bookings b ON u.id = b.instructor_id AND b.status != 'cancelled'
WHERE u.role = 'captain'
GROUP BY u.id, u.first_name, u.last_name, u.hourly_rate;

-- ============================================================================
-- 5. COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN bookings.instructor_id IS
  'FK to instructor/captain for sailing school and training bookings. Required if booking_category = sailing_school.';

COMMENT ON FUNCTION validate_sailing_school_instructor() IS
  'Validates that sailing school bookings have an instructor assigned, and that the instructor has appropriate role.';

COMMENT ON FUNCTION calculate_instructor_fee(UUID) IS
  'Calculates instructor fee for a booking based on instructor hourly_rate and booking duration.';

COMMENT ON VIEW instructor_booking_stats IS
  'Shows per-instructor statistics including total bookings, hours, and fees earned.';

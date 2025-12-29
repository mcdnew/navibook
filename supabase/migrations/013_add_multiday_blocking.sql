-- Add multi-day blocking support to blocked_slots table
-- Allows blocking slots across multiple days with start and end dates

-- Add new columns for multi-day support
-- Note: Using temporary defaults to satisfy NOT NULL constraint during migration
ALTER TABLE blocked_slots
ADD COLUMN start_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Update existing records to use the new columns
UPDATE blocked_slots
SET start_date = blocked_date, end_date = blocked_date
WHERE start_date = blocked_date AND end_date = blocked_date;

-- Create constraint to ensure end_date >= start_date
ALTER TABLE blocked_slots
ADD CONSTRAINT check_date_range CHECK (end_date >= start_date);

-- Update the unique constraint to account for multi-day ranges
-- Remove old constraint if it exists
ALTER TABLE blocked_slots
DROP CONSTRAINT IF EXISTS blocked_slots_company_id_boat_id_blocked_date_start_time_end_time_key;

-- Add new compound index for efficient multi-day range queries
DROP INDEX IF EXISTS idx_blocked_slots_date_range;
CREATE INDEX idx_blocked_slots_date_range ON blocked_slots(company_id, boat_id, start_date, end_date);

-- ==========================================================
-- UPDATE DATABASE FUNCTIONS FOR MULTI-DAY BLOCKING
-- ==========================================================

-- Drop old function signature
DROP FUNCTION IF EXISTS is_slot_blocked(UUID, DATE, TIME, TIME);

-- Create new function that checks multi-day overlaps
CREATE OR REPLACE FUNCTION is_slot_blocked(
  p_boat_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_slots bs
    WHERE
      -- Company match (inherited from context or user's company)
      -- Boat match: either exact boat or "all boats" block (boat_id IS NULL)
      (bs.boat_id = p_boat_id OR bs.boat_id IS NULL)
      -- Date range overlap:
      -- Request starts before or on block end AND request ends after or on block start
      AND p_start_date <= bs.end_date
      AND p_end_date >= bs.start_date
      -- Time overlap on overlapping dates:
      -- If dates overlap, also check time ranges don't conflict
      AND (
        -- Different day boundaries - if blocks span different dates, times don't need to overlap
        (p_start_date < bs.end_date AND p_end_date > bs.start_date)
        -- Same day check - if dates fully overlap, check time ranges
        OR (
          (p_start_date = bs.start_date AND p_end_date = bs.end_date)
          AND p_start_time < bs.end_time
          AND p_end_time > bs.start_time
        )
        -- Start date matches block start date - check time on that day
        OR (
          p_start_date = bs.start_date
          AND p_start_time < bs.end_time
          AND bs.start_date < p_end_date
        )
        -- End date matches block end date - check time on that day
        OR (
          p_end_date = bs.end_date
          AND p_end_time > bs.start_time
          AND bs.end_date > p_start_date
        )
      )
  );
END;
$$ LANGUAGE plpgsql;

-- Drop old function signature
DROP FUNCTION IF EXISTS check_boat_availability(UUID, DATE, TIME, TIME, UUID);

-- Create new function for booking availability with multi-day support
CREATE OR REPLACE FUNCTION check_boat_availability(
  p_boat_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if slot is blocked
  IF is_slot_blocked(p_boat_id, p_start_date, p_end_date, p_start_time, p_end_time) THEN
    RETURN FALSE;
  END IF;

  -- Check for conflicting bookings
  IF EXISTS (
    SELECT 1 FROM bookings b
    WHERE
      b.boat_id = p_boat_id
      AND b.status NOT IN ('cancelled', 'no_show')
      AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
      -- Date range overlap
      AND p_start_date <= b.booking_date
      AND p_end_date >= b.booking_date
      -- Time overlap on the booking date
      AND CAST(b.start_time AS TIME) < p_end_time
      AND CAST(b.end_time AS TIME) > p_start_time
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Drop old function
DROP FUNCTION IF EXISTS get_blocked_slots_for_range(UUID, DATE, DATE);

-- Create new function for retrieving blocked slots
CREATE OR REPLACE FUNCTION get_blocked_slots_for_range(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  id UUID,
  boat_id UUID,
  boat_name VARCHAR,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  block_type VARCHAR,
  created_by_name VARCHAR,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bs.id,
    bs.boat_id,
    COALESCE(b.name, 'All Boats'),
    bs.start_date,
    bs.end_date,
    bs.start_time,
    bs.end_time,
    bs.reason,
    bs.block_type,
    CONCAT(u.first_name, ' ', u.last_name),
    bs.created_at
  FROM blocked_slots bs
  LEFT JOIN boats b ON bs.boat_id = b.id
  LEFT JOIN users u ON bs.created_by = u.id
  WHERE
    bs.company_id = p_company_id
    -- Date range overlap with query parameters
    AND bs.start_date <= p_end_date
    AND bs.end_date >= p_start_date
  ORDER BY bs.start_date, bs.start_time;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================================

COMMENT ON COLUMN blocked_slots.start_date IS 'Start date of the blocked period (inclusive)';
COMMENT ON COLUMN blocked_slots.end_date IS 'End date of the blocked period (inclusive)';
COMMENT ON COLUMN blocked_slots.blocked_date IS 'Deprecated: kept for backward compatibility, use start_date and end_date';
COMMENT ON FUNCTION is_slot_blocked(UUID, DATE, DATE, TIME, TIME) IS 'Check if a boat has any blocking that overlaps with the given date/time range. Handles multi-day blocks and all-boats blocks.';
COMMENT ON FUNCTION check_boat_availability(UUID, DATE, DATE, TIME, TIME, UUID) IS 'Check if a boat is available for the given date/time range, considering blocks and existing bookings.';

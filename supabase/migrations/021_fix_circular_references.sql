-- Fix circular references in multiday blocking functions
-- This migration only updates the functions with corrected column names
-- Tables and columns are assumed to already exist from migration 013

-- ============================================================================
-- UPDATE FUNCTION: get_blocked_slots_for_range (Fix boat_name and boat_id references)
-- ============================================================================

DROP FUNCTION IF EXISTS get_blocked_slots_for_range(UUID, DATE, DATE);

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
    COALESCE(b.name, 'All Boats') as boat_name,
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
  WHERE bs.company_id = p_company_id
    AND bs.start_date <= p_end_date
    AND bs.end_date >= p_start_date
  ORDER BY bs.start_date, bs.start_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION get_blocked_slots_for_range(UUID, DATE, DATE) IS
  'Retrieves blocked slots for a date range. Fixed: uses b.name (not boat_name) and b.id (not boat_id) for correct JOINs.';

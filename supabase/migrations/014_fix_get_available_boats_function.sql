-- Fix get_available_boats to work with multi-day blocking
-- Updates the function to call check_boat_availability with the new signature

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
    -- Updated to call check_boat_availability with multi-day parameters
    -- For single-day bookings, start_date and end_date are the same
    AND check_boat_availability(b.id, p_booking_date, p_booking_date, p_start_time, p_end_time)
  ORDER BY b.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

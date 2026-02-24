-- ==========================================================
-- SAILOR PERSONNEL & CAPTAIN MANAGEMENT ENHANCEMENT
-- ==========================================================
-- This migration adds:
-- 1. 'sailor' role to user_role enum
-- 2. Default captain field on boats table
-- 3. booking_sailors junction table for multiple sailors per booking
-- 4. sailor_fee field on bookings table
-- 5. RLS policies for sailor assignments
-- ==========================================================

-- 1. Add 'sailor' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sailor';

-- 2. Add default captain reference to boats table
ALTER TABLE boats
ADD COLUMN IF NOT EXISTS default_captain_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_boats_default_captain ON boats(default_captain_id);

-- 3. Create booking_sailors junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS booking_sailors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sailor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,  -- Snapshot of rate at booking time
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,           -- Calculated fee for this booking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate sailor assignments to same booking
  UNIQUE(booking_id, sailor_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_booking_sailors_booking ON booking_sailors(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_sailors_sailor ON booking_sailors(sailor_id);

-- 4. Add aggregated sailor fee field to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS sailor_fee DECIMAL(10,2) DEFAULT 0.00;

-- ==========================================================
-- RLS POLICIES FOR BOOKING_SAILORS TABLE
-- ==========================================================

-- Enable RLS on booking_sailors
ALTER TABLE booking_sailors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "View booking sailors based on booking access" ON booking_sailors;
DROP POLICY IF EXISTS "Sailors can view their own assignments" ON booking_sailors;
DROP POLICY IF EXISTS "Admin/manager/office can insert booking sailors" ON booking_sailors;
DROP POLICY IF EXISTS "Admin/manager/office can update booking sailors" ON booking_sailors;
DROP POLICY IF EXISTS "Admin/manager/office can delete booking sailors" ON booking_sailors;

-- Policy: View booking sailors - users can see sailors for bookings they can access
CREATE POLICY "View booking sailors based on booking access"
  ON booking_sailors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
      AND b.company_id = get_user_company()
      AND (
        is_admin_or_office()
        OR b.agent_id = auth.uid()
        OR b.captain_id = auth.uid()
      )
    )
  );

-- Policy: Sailors can view their own assignments
CREATE POLICY "Sailors can view their own assignments"
  ON booking_sailors FOR SELECT
  USING (sailor_id = auth.uid());

-- Policy: Only admin/manager/office_staff can insert sailor assignments
CREATE POLICY "Admin/manager/office can insert booking sailors"
  ON booking_sailors FOR INSERT
  WITH CHECK (is_admin_or_office());

-- Policy: Only admin/manager/office_staff can update sailor assignments
CREATE POLICY "Admin/manager/office can update booking sailors"
  ON booking_sailors FOR UPDATE
  USING (is_admin_or_office())
  WITH CHECK (is_admin_or_office());

-- Policy: Only admin/manager/office_staff can delete sailor assignments
CREATE POLICY "Admin/manager/office can delete booking sailors"
  ON booking_sailors FOR DELETE
  USING (is_admin_or_office());

-- ==========================================================
-- UPDATE STATISTICS FUNCTION FOR SAILOR FEES
-- ==========================================================

-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS get_booking_stats(UUID, DATE, DATE);

-- Update get_booking_stats to include sailor fees
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
  total_captain_fees DECIMAL(10,2),
  total_sailor_fees DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_bookings,
    COALESCE(SUM(total_price), 0)::DECIMAL(10,2) as total_revenue,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_bookings,
    COALESCE(SUM(agent_commission), 0)::DECIMAL(10,2) as total_commissions,
    COALESCE(SUM(captain_fee), 0)::DECIMAL(10,2) as total_captain_fees,
    COALESCE(SUM(sailor_fee), 0)::DECIMAL(10,2) as total_sailor_fees
  FROM bookings
  WHERE company_id = p_company_id
    AND booking_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- HELPER FUNCTION: Calculate total sailor fee for a booking
-- ==========================================================

CREATE OR REPLACE FUNCTION calculate_booking_sailor_fee(p_booking_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_fee DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(fee), 0) INTO total_fee
  FROM booking_sailors
  WHERE booking_id = p_booking_id;

  RETURN total_fee;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- TRIGGER: Auto-update sailor_fee on bookings when sailors change
-- ==========================================================

CREATE OR REPLACE FUNCTION update_booking_sailor_fee()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the booking's sailor_fee with the sum of all assigned sailors
  IF TG_OP = 'DELETE' THEN
    UPDATE bookings
    SET sailor_fee = calculate_booking_sailor_fee(OLD.booking_id)
    WHERE id = OLD.booking_id;
    RETURN OLD;
  ELSE
    UPDATE bookings
    SET sailor_fee = calculate_booking_sailor_fee(NEW.booking_id)
    WHERE id = NEW.booking_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on booking_sailors table
DROP TRIGGER IF EXISTS trigger_update_booking_sailor_fee ON booking_sailors;
CREATE TRIGGER trigger_update_booking_sailor_fee
  AFTER INSERT OR UPDATE OR DELETE ON booking_sailors
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_sailor_fee();

-- ==========================================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================================

COMMENT ON COLUMN boats.default_captain_id IS 'Default captain assigned to this boat. Auto-selected when creating bookings.';
COMMENT ON TABLE booking_sailors IS 'Junction table linking bookings to sailors. Multiple sailors can be assigned per booking.';
COMMENT ON COLUMN booking_sailors.hourly_rate IS 'Snapshot of sailor hourly rate at time of booking assignment.';
COMMENT ON COLUMN booking_sailors.fee IS 'Calculated fee for this sailor on this booking (hourly_rate × duration).';
COMMENT ON COLUMN bookings.sailor_fee IS 'Total aggregated fee for all sailors on this booking. Auto-calculated via trigger.';
COMMENT ON FUNCTION calculate_booking_sailor_fee(UUID) IS 'Calculates the sum of all sailor fees for a given booking.';
COMMENT ON FUNCTION get_booking_stats(UUID, DATE, DATE) IS 'Returns booking statistics including revenue, costs, and fees for a company within a date range.';

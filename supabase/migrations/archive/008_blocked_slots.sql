-- Add new user roles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'company_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    ALTER TYPE user_role ADD VALUE 'company_admin';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'power_agent' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
    ALTER TYPE user_role ADD VALUE 'power_agent';
  END IF;
END $$;

-- Create blocked_slots table for maintenance and other unavailability reasons
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id UUID REFERENCES boats(id) ON DELETE CASCADE, -- NULL means all boats
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL,
  block_type VARCHAR(50) DEFAULT 'maintenance', -- maintenance, weather, personal, other
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time),

  -- Index for faster queries
  CONSTRAINT idx_blocked_slots_lookup UNIQUE (company_id, boat_id, blocked_date, start_time, end_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocked_slots_company ON blocked_slots(company_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_boat ON blocked_slots(boat_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date_range ON blocked_slots(blocked_date, start_time, end_time);

-- Enable RLS
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view company blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can insert blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can update blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can delete blocked slots" ON blocked_slots;

-- RLS Policies
-- Users can view blocked slots for their company
CREATE POLICY "Users can view company blocked slots"
  ON blocked_slots FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Company admin and power agents can insert blocked slots
CREATE POLICY "Admins and power agents can insert blocked slots"
  ON blocked_slots FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'power_agent')
    )
  );

-- Company admin and power agents can update blocked slots
CREATE POLICY "Admins and power agents can update blocked slots"
  ON blocked_slots FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'power_agent')
    )
  );

-- Company admin and power agents can delete blocked slots
CREATE POLICY "Admins and power agents can delete blocked slots"
  ON blocked_slots FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'power_agent')
    )
  );

-- Function to check if a time slot is blocked
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
  -- Get the boat's company_id
  SELECT company_id INTO v_company_id
  FROM boats
  WHERE id = p_boat_id;

  -- Check if there's any overlapping block for this boat or all boats
  SELECT EXISTS (
    SELECT 1
    FROM blocked_slots
    WHERE company_id = v_company_id
      AND blocked_date = p_date
      AND (boat_id = p_boat_id OR boat_id IS NULL) -- NULL means all boats
      AND (
        -- Check for time overlap
        (start_time <= p_start_time AND end_time > p_start_time)
        OR (start_time < p_end_time AND end_time >= p_end_time)
        OR (start_time >= p_start_time AND end_time <= p_end_time)
      )
  ) INTO v_is_blocked;

  RETURN v_is_blocked;
END;
$$;

-- Update the check_boat_availability function to include blocked slots
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
  -- First check if the slot is blocked
  SELECT is_slot_blocked(p_boat_id, p_date, p_start_time, p_end_time)
  INTO v_is_blocked;

  IF v_is_blocked THEN
    RETURN FALSE;
  END IF;

  -- Then check for existing bookings (existing logic)
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE boat_id = p_boat_id
      AND booking_date = p_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
        -- Check for time overlap
        (start_time <= p_start_time AND end_time > p_start_time)
        OR (start_time < p_end_time AND end_time >= p_end_time)
        OR (start_time >= p_start_time AND end_time <= p_end_time)
      )
  ) INTO v_is_available;

  RETURN v_is_available;
END;
$$;

-- Function to get all blocks for a date range
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS blocked_slots_updated_at ON blocked_slots;

-- Trigger to update updated_at timestamp
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

-- Add comment
COMMENT ON TABLE blocked_slots IS 'Stores blocked time slots for boats (maintenance, weather, etc.)';

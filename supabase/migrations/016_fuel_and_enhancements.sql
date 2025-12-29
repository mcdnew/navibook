-- Migration: Fuel Consumption System, Charter Add-ons Configuration, Internal Boat Usage, Bare Boat Rentals
-- Date: December 29, 2025
-- Purpose: Add comprehensive cost tracking and internal booking support

-- ============================================================================
-- 1. CREATE NEW ENUM: booking_category
-- ============================================================================

CREATE TYPE booking_category AS ENUM (
  'commercial',           -- Standard customer booking (default)
  'club_activity',        -- Internal club use
  'sailing_school',       -- Sailing school session
  'private_class',        -- Private instruction
  'maintenance',          -- Boat maintenance/testing
  'owner_use',           -- Owner personal use
  'bare_boat'            -- Bare boat rental (no captain)
);

-- ============================================================================
-- 2. CREATE NEW TABLE: boat_fuel_config
-- ============================================================================

CREATE TABLE boat_fuel_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  fuel_consumption_rate DECIMAL(10,2) NOT NULL,  -- liters/hour
  fuel_price_per_liter DECIMAL(10,2) NOT NULL,   -- price per liter
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(boat_id)
);

-- Create index on boat_id for faster lookups
CREATE INDEX idx_boat_fuel_config_boat_id ON boat_fuel_config(boat_id);

-- ============================================================================
-- 3. CREATE NEW TABLE: company_package_config
-- ============================================================================

CREATE TABLE company_package_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  drinks_cost_per_person DECIMAL(10,2) DEFAULT 0,
  food_cost_per_person DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Create index on company_id
CREATE INDEX idx_company_package_config_company_id ON company_package_config(company_id);

-- ============================================================================
-- 4. ALTER bookings TABLE: Add new columns
-- ============================================================================

ALTER TABLE bookings
  ADD COLUMN booking_category booking_category NOT NULL DEFAULT 'commercial',
  ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN fuel_cost DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN package_addon_cost DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN is_bare_boat BOOLEAN DEFAULT false;

-- Create indexes for filtering
CREATE INDEX idx_bookings_category ON bookings(booking_category);
CREATE INDEX idx_bookings_bare_boat ON bookings(is_bare_boat) WHERE is_bare_boat = true;

-- ============================================================================
-- 5. CREATE FUNCTION: calculate_fuel_cost
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_fuel_cost(
  p_boat_id UUID,
  p_duration duration_type
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_fuel_config RECORD;
  v_duration_hours NUMERIC;
  v_fuel_cost DECIMAL(10,2);
BEGIN
  -- Get fuel config for boat
  SELECT * INTO v_fuel_config
  FROM boat_fuel_config
  WHERE boat_id = p_boat_id;

  -- If no config, return 0
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate duration in hours
  v_duration_hours := CASE p_duration
    WHEN '2h' THEN 2
    WHEN '3h' THEN 3
    WHEN '4h' THEN 4
    WHEN '8h' THEN 8
    ELSE 0
  END;

  -- Calculate fuel cost: consumption_rate × duration_hours × price_per_liter
  v_fuel_cost := v_fuel_config.fuel_consumption_rate *
                 v_duration_hours *
                 v_fuel_config.fuel_price_per_liter;

  RETURN COALESCE(v_fuel_cost, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 6. CREATE FUNCTION: calculate_package_addon_cost
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_package_addon_cost(
  p_company_id UUID,
  p_package_type package_type,
  p_passengers INTEGER
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_config RECORD;
  v_addon_cost DECIMAL(10,2) := 0;
BEGIN
  -- Get company package config
  SELECT * INTO v_config
  FROM company_package_config
  WHERE company_id = p_company_id;

  -- If no config, return 0
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate based on package type
  CASE p_package_type
    WHEN 'charter_drinks' THEN
      v_addon_cost := COALESCE(v_config.drinks_cost_per_person, 0) * p_passengers;
    WHEN 'charter_food' THEN
      v_addon_cost := COALESCE(v_config.food_cost_per_person, 0) * p_passengers;
    WHEN 'charter_full' THEN
      v_addon_cost := (COALESCE(v_config.drinks_cost_per_person, 0) +
                       COALESCE(v_config.food_cost_per_person, 0)) * p_passengers;
    ELSE
      v_addon_cost := 0;
  END CASE;

  RETURN COALESCE(v_addon_cost, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 7. CREATE FUNCTION: auto_calculate_booking_costs (Trigger Function)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_calculate_booking_costs()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate fuel cost
  NEW.fuel_cost := calculate_fuel_cost(NEW.boat_id, NEW.duration);

  -- Calculate package addon cost
  NEW.package_addon_cost := calculate_package_addon_cost(
    NEW.company_id,
    NEW.package_type,
    COALESCE(NEW.passengers, 1)
  );

  -- For bare boat rentals, set captain_fee to 0 and clear captain_id
  IF NEW.is_bare_boat = true OR NEW.booking_category = 'bare_boat' THEN
    NEW.captain_fee := 0;
    NEW.captain_id := NULL;
    NEW.is_bare_boat := true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. CREATE TRIGGER: auto_calculate_booking_costs
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_calculate_booking_costs ON bookings;

-- Create new trigger
CREATE TRIGGER trigger_auto_calculate_booking_costs
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_booking_costs();

-- ============================================================================
-- 9. CREATE FUNCTION: check_booking_category_permission (Permission Check)
-- ============================================================================

CREATE OR REPLACE FUNCTION check_booking_category_permission()
RETURNS TRIGGER AS $$
DECLARE
  v_user_role user_role;
BEGIN
  -- Only admin/manager/office_staff can create non-commercial bookings
  IF NEW.booking_category != 'commercial' THEN
    -- Get current user role
    SELECT u.role INTO v_user_role
    FROM users u
    WHERE u.id = auth.uid();

    -- Check if user has permission
    IF v_user_role NOT IN ('admin', 'manager', 'office_staff') THEN
      RAISE EXCEPTION 'Only admin, manager, or office staff can create internal bookings';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. CREATE TRIGGER: check_booking_category_permission
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_check_booking_category_permission ON bookings;

CREATE TRIGGER trigger_check_booking_category_permission
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_category_permission();

-- ============================================================================
-- 11. UPDATE FUNCTION: get_booking_stats (Add new cost fields)
-- ============================================================================

-- Drop and recreate the function to add new metrics
DROP FUNCTION IF EXISTS get_booking_stats(UUID, DATE, DATE);

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
  total_sailor_fees DECIMAL(10,2),
  total_fuel_costs DECIMAL(10,2),
  total_package_addon_costs DECIMAL(10,2),
  commercial_revenue DECIMAL(10,2),
  internal_revenue DECIMAL(10,2)
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
    COALESCE(SUM(sailor_fee), 0)::DECIMAL(10,2) as total_sailor_fees,
    COALESCE(SUM(fuel_cost), 0)::DECIMAL(10,2) as total_fuel_costs,
    COALESCE(SUM(package_addon_cost), 0)::DECIMAL(10,2) as total_package_addon_costs,
    COALESCE(SUM(total_price) FILTER (WHERE booking_category = 'commercial'), 0)::DECIMAL(10,2) as commercial_revenue,
    COALESCE(SUM(total_price) FILTER (WHERE booking_category != 'commercial'), 0)::DECIMAL(10,2) as internal_revenue
  FROM bookings
  WHERE company_id = p_company_id
    AND booking_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE boat_fuel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_package_config ENABLE ROW LEVEL SECURITY;

-- boat_fuel_config: Users can view fuel config for their company boats
CREATE POLICY "Users can view fuel config for their company boats"
  ON boat_fuel_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boats b
      WHERE b.id = boat_id
      AND b.company_id = get_user_company()
    )
  );

-- boat_fuel_config: Admin/manager/office staff can manage fuel config
CREATE POLICY "Admin staff can manage fuel config"
  ON boat_fuel_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boats b
      WHERE b.id = boat_id
      AND b.company_id = get_user_company()
    )
    AND is_admin_or_office()
  );

CREATE POLICY "Admin staff can update fuel config"
  ON boat_fuel_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boats b
      WHERE b.id = boat_id
      AND b.company_id = get_user_company()
    )
    AND is_admin_or_office()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boats b
      WHERE b.id = boat_id
      AND b.company_id = get_user_company()
    )
    AND is_admin_or_office()
  );

CREATE POLICY "Admin staff can delete fuel config"
  ON boat_fuel_config FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boats b
      WHERE b.id = boat_id
      AND b.company_id = get_user_company()
    )
    AND is_admin_or_office()
  );

-- company_package_config: Users can view their company package config
CREATE POLICY "Users can view their company package config"
  ON company_package_config FOR SELECT
  USING (company_id = get_user_company());

-- company_package_config: Admin/manager/office staff can manage package config
CREATE POLICY "Admin staff can manage package config"
  ON company_package_config FOR INSERT
  WITH CHECK (
    company_id = get_user_company()
    AND is_admin_or_office()
  );

CREATE POLICY "Admin staff can update package config"
  ON company_package_config FOR UPDATE
  USING (
    company_id = get_user_company()
    AND is_admin_or_office()
  )
  WITH CHECK (
    company_id = get_user_company()
    AND is_admin_or_office()
  );

CREATE POLICY "Admin staff can delete package config"
  ON company_package_config FOR DELETE
  USING (
    company_id = get_user_company()
    AND is_admin_or_office()
  );

-- ============================================================================
-- 13. INSERT DEFAULT COMPANY PACKAGE CONFIGS
-- ============================================================================

-- Insert default config for all existing companies that don't have one
INSERT INTO company_package_config (company_id, drinks_cost_per_person, food_cost_per_person)
SELECT id, 0, 0
FROM companies
WHERE id NOT IN (SELECT company_id FROM company_package_config)
ON CONFLICT (company_id) DO NOTHING;

-- ============================================================================
-- 14. UPDATE TRIGGER: Update updated_at for new tables
-- ============================================================================

CREATE TRIGGER trigger_update_boat_fuel_config_timestamp
  BEFORE UPDATE ON boat_fuel_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_company_package_config_timestamp
  BEFORE UPDATE ON company_package_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES (For testing during development)
-- ============================================================================

-- Verify new tables created
-- SELECT * FROM boat_fuel_config;
-- SELECT * FROM company_package_config;

-- Verify new columns added to bookings
-- SELECT booking_category, discount_percentage, fuel_cost, package_addon_cost, is_bare_boat
-- FROM bookings LIMIT 1;

-- Test calculation functions
-- SELECT calculate_fuel_cost('boat-uuid'::uuid, '4h'::duration_type);
-- SELECT calculate_package_addon_cost('company-uuid'::uuid, 'charter_drinks'::package_type, 5);

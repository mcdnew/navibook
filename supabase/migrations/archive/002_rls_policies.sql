-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_suitability ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's company
CREATE OR REPLACE FUNCTION get_user_company()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is admin or office staff
CREATE OR REPLACE FUNCTION is_admin_or_office()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'office_staff', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- COMPANIES POLICIES
-- =====================================================

CREATE POLICY "Users can view their company"
  ON companies FOR SELECT
  USING (id = get_user_company());

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id = get_user_company() AND get_user_role() = 'admin');

-- =====================================================
-- USERS POLICIES
-- =====================================================

CREATE POLICY "Users can view users in their company"
  ON users FOR SELECT
  USING (company_id = get_user_company());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert users in their company"
  ON users FOR INSERT
  WITH CHECK (company_id = get_user_company() AND get_user_role() = 'admin');

CREATE POLICY "Admins can update users in their company"
  ON users FOR UPDATE
  USING (company_id = get_user_company() AND is_admin_or_office());

-- =====================================================
-- BOATS POLICIES
-- =====================================================

CREATE POLICY "Users can view boats in their company"
  ON boats FOR SELECT
  USING (company_id = get_user_company());

CREATE POLICY "Admins can manage boats"
  ON boats FOR ALL
  USING (company_id = get_user_company() AND is_admin_or_office());

-- =====================================================
-- PRICING POLICIES
-- =====================================================

CREATE POLICY "Users can view pricing"
  ON pricing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE boats.id = pricing.boat_id
      AND boats.company_id = get_user_company()
    )
  );

CREATE POLICY "Admins can manage pricing"
  ON pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE boats.id = pricing.boat_id
      AND boats.company_id = get_user_company()
    )
    AND is_admin_or_office()
  );

-- =====================================================
-- BOOKINGS POLICIES (Critical!)
-- =====================================================

-- Agents can view their own bookings
-- Admin/Office/Manager can view all bookings in company
CREATE POLICY "View bookings based on role"
  ON bookings FOR SELECT
  USING (
    company_id = get_user_company()
    AND (
      is_admin_or_office()
      OR agent_id = auth.uid()
      OR captain_id = auth.uid()
    )
  );

-- Agents can create bookings in their company
CREATE POLICY "Agents can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    company_id = get_user_company()
    AND (agent_id = auth.uid() OR is_admin_or_office())
  );

-- Agents can update their own pending/confirmed bookings
-- Admin/Office can update any booking
CREATE POLICY "Update bookings based on role"
  ON bookings FOR UPDATE
  USING (
    company_id = get_user_company()
    AND (
      is_admin_or_office()
      OR (agent_id = auth.uid() AND status IN ('pending_hold', 'confirmed'))
    )
  );

-- Only admin/office can delete bookings
CREATE POLICY "Only admin can delete bookings"
  ON bookings FOR DELETE
  USING (company_id = get_user_company() AND is_admin_or_office());

-- =====================================================
-- BOOKING HISTORY POLICIES
-- =====================================================

CREATE POLICY "View booking history for accessible bookings"
  ON booking_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_history.booking_id
      AND bookings.company_id = get_user_company()
      AND (
        is_admin_or_office()
        OR bookings.agent_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert booking history"
  ON booking_history FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- EXTERNAL BOOKINGS POLICIES
-- =====================================================

-- API can insert (handled separately via service role)
CREATE POLICY "Admin can view external bookings"
  ON external_bookings FOR SELECT
  USING (is_admin_or_office());

CREATE POLICY "API can insert external bookings"
  ON external_bookings FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- AGENT COMMISSIONS POLICIES
-- =====================================================

CREATE POLICY "Agents can view their own commissions"
  ON agent_commissions FOR SELECT
  USING (agent_id = auth.uid() OR is_admin_or_office());

CREATE POLICY "System can insert commissions"
  ON agent_commissions FOR INSERT
  WITH CHECK (is_admin_or_office());

CREATE POLICY "Admin can manage commissions"
  ON agent_commissions FOR UPDATE
  USING (is_admin_or_office());

-- =====================================================
-- CAPTAIN FEES POLICIES
-- =====================================================

CREATE POLICY "Captains can view their own fees"
  ON captain_fees FOR SELECT
  USING (captain_id = auth.uid() OR is_admin_or_office());

CREATE POLICY "System can insert captain fees"
  ON captain_fees FOR INSERT
  WITH CHECK (is_admin_or_office());

CREATE POLICY "Admin can manage captain fees"
  ON captain_fees FOR UPDATE
  USING (is_admin_or_office());

-- =====================================================
-- BOAT BLOCKS POLICIES
-- =====================================================

CREATE POLICY "Users can view boat blocks in their company"
  ON boat_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE boats.id = boat_blocks.boat_id
      AND boats.company_id = get_user_company()
    )
  );

CREATE POLICY "Admins can manage boat blocks"
  ON boat_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE boats.id = boat_blocks.boat_id
      AND boats.company_id = get_user_company()
    )
    AND is_admin_or_office()
  );

-- =====================================================
-- WEATHER FORECASTS POLICIES
-- =====================================================

CREATE POLICY "Users can view weather for their company"
  ON weather_forecasts FOR SELECT
  USING (company_id = get_user_company());

CREATE POLICY "System can insert weather forecasts"
  ON weather_forecasts FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- WEATHER SUITABILITY POLICIES
-- =====================================================

CREATE POLICY "Users can view weather suitability for company boats"
  ON weather_suitability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE boats.id = weather_suitability.boat_id
      AND boats.company_id = get_user_company()
    )
  );

CREATE POLICY "System can insert weather suitability"
  ON weather_suitability FOR INSERT
  WITH CHECK (true);

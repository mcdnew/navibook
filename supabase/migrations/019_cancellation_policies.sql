-- Add cancellation policy support for flexible refund handling
-- Allows per-company configuration of refund percentages based on cancellation timing

-- ============================================================================
-- 1. CREATE CANCELLATION_POLICIES TABLE
-- ============================================================================

-- Drop existing table if needed (safer for initial migration issues)
DROP TABLE IF EXISTS cancellation_policies CASCADE;

CREATE TABLE cancellation_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  policy_name VARCHAR(100) NOT NULL,

  -- Refund percentages based on when cancellation occurs
  refund_before_7_days DECIMAL(5,2) NOT NULL DEFAULT 100, -- % refund if cancelled 7+ days before
  refund_before_3_days DECIMAL(5,2) NOT NULL DEFAULT 50,  -- % refund if cancelled 3-7 days before
  refund_before_1_day DECIMAL(5,2) NOT NULL DEFAULT 0,    -- % refund if cancelled < 3 days before

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Ensure unique policy names per company
  CONSTRAINT unique_policy_per_company UNIQUE (company_id, policy_name),

  -- Validate refund percentages are between 0-100
  CONSTRAINT valid_refund_percentages CHECK (
    refund_before_7_days >= 0 AND refund_before_7_days <= 100
    AND refund_before_3_days >= 0 AND refund_before_3_days <= 100
    AND refund_before_1_day >= 0 AND refund_before_1_day <= 100
  )
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_cancellation_policies_company ON cancellation_policies(company_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_policies_active ON cancellation_policies(company_id, is_active);

-- ============================================================================
-- 2. ADD COLUMN TO BOOKINGS TABLE
-- ============================================================================

-- Add cancellation_policy_id to bookings (if not already added)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancellation_policy_id UUID REFERENCES cancellation_policies(id) ON DELETE SET NULL;

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_cancellation_policy ON bookings(cancellation_policy_id);

-- ============================================================================
-- 3. INSERT DEFAULT POLICIES FOR EXISTING COMPANIES
-- ============================================================================

-- Create a "Standard" policy for each company
INSERT INTO cancellation_policies (
  company_id,
  policy_name,
  refund_before_7_days,
  refund_before_3_days,
  refund_before_1_day,
  description
)
SELECT
  id,
  'Standard',
  100,  -- 100% refund if cancelled 7+ days before
  50,   -- 50% refund if cancelled 3-7 days before
  0,    -- 0% refund if cancelled < 3 days before
  'Standard cancellation policy: Full refund up to 7 days, 50% between 3-7 days, no refund less than 3 days'
FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM cancellation_policies WHERE company_id = companies.id
)
ON CONFLICT (company_id, policy_name) DO NOTHING;

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE cancellation_policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own company cancellation policies" ON cancellation_policies;
DROP POLICY IF EXISTS "Admins can manage cancellation policies" ON cancellation_policies;
DROP POLICY IF EXISTS "Admins can update cancellation policies" ON cancellation_policies;

-- Policy: Users can view cancellation policies for their company
CREATE POLICY "Users can view own company cancellation policies"
  ON cancellation_policies
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Admins can manage cancellation policies
CREATE POLICY "Admins can manage cancellation policies"
  ON cancellation_policies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.company_id = cancellation_policies.company_id
      AND u.role IN ('admin', 'manager')
    )
  );

-- Policy: Admins can update cancellation policies
CREATE POLICY "Admins can update cancellation policies"
  ON cancellation_policies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.company_id = cancellation_policies.company_id
      AND u.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.company_id = cancellation_policies.company_id
      AND u.role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- 5. FUNCTION: Calculate Refund Amount Based on Policy
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_refund_amount(
  p_booking_id UUID,
  p_cancellation_date DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_deposit_amount DECIMAL(10,2);
  v_booking_date DATE;
  v_days_before_booking INT;
  v_refund_percentage DECIMAL(5,2);
  v_refund_amount DECIMAL(10,2);
  v_policy_id UUID;
BEGIN
  -- Get booking details
  SELECT b.deposit_amount, b.booking_date, b.cancellation_policy_id
  INTO v_deposit_amount, v_booking_date, v_policy_id
  FROM bookings b
  WHERE b.id = p_booking_id;

  -- If no deposit or no cancellation policy, return 0
  IF v_deposit_amount IS NULL OR v_deposit_amount <= 0 OR v_policy_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate days before booking
  v_days_before_booking := v_booking_date - p_cancellation_date;

  -- Determine refund percentage based on policy
  IF v_days_before_booking >= 7 THEN
    SELECT refund_before_7_days INTO v_refund_percentage
    FROM cancellation_policies WHERE id = v_policy_id;
  ELSIF v_days_before_booking >= 3 THEN
    SELECT refund_before_3_days INTO v_refund_percentage
    FROM cancellation_policies WHERE id = v_policy_id;
  ELSE
    SELECT refund_before_1_day INTO v_refund_percentage
    FROM cancellation_policies WHERE id = v_policy_id;
  END IF;

  -- Calculate refund amount
  v_refund_amount := v_deposit_amount * (v_refund_percentage / 100);

  RETURN v_refund_amount;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 6. TRIGGER: Auto-assign Default Policy to New Bookings
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_assign_default_cancellation_policy ON bookings;
DROP FUNCTION IF EXISTS assign_default_cancellation_policy();

CREATE OR REPLACE FUNCTION assign_default_cancellation_policy()
RETURNS TRIGGER AS $$
DECLARE
  v_default_policy_id UUID;
BEGIN
  -- If no policy assigned, get the default "Standard" policy for the company
  IF NEW.cancellation_policy_id IS NULL THEN
    SELECT id INTO v_default_policy_id
    FROM cancellation_policies
    WHERE company_id = NEW.company_id
      AND policy_name = 'Standard'
      AND is_active = true
    LIMIT 1;

    -- Assign the policy
    NEW.cancellation_policy_id := v_default_policy_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_default_cancellation_policy
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_cancellation_policy();

-- ============================================================================
-- 7. TRIGGER: Updated_at for Cancellation Policies
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_cancellation_policies_updated_at ON cancellation_policies;
DROP FUNCTION IF EXISTS update_cancellation_policies_updated_at();

CREATE OR REPLACE FUNCTION update_cancellation_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cancellation_policies_updated_at
  BEFORE UPDATE ON cancellation_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_cancellation_policies_updated_at();

-- ============================================================================
-- 8. COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE cancellation_policies IS
  'Stores cancellation policies per company with refund percentages based on cancellation timing.';

COMMENT ON COLUMN cancellation_policies.refund_before_7_days IS
  'Refund percentage if booking cancelled 7 or more days before the booking date.';

COMMENT ON COLUMN cancellation_policies.refund_before_3_days IS
  'Refund percentage if booking cancelled 3-7 days before the booking date.';

COMMENT ON COLUMN cancellation_policies.refund_before_1_day IS
  'Refund percentage if booking cancelled less than 3 days before the booking date.';

COMMENT ON FUNCTION calculate_refund_amount(UUID, DATE) IS
  'Calculate the refund amount for a booking based on the cancellation policy and cancellation date. Returns 0 if no policy assigned.';

COMMENT ON FUNCTION assign_default_cancellation_policy() IS
  'Automatically assigns the company''s default ''Standard'' cancellation policy to new bookings if no policy is explicitly set.';

-- Advanced Booking Features
-- Recurring bookings, templates, group bookings, waitlist, cancellation policies

-- Cancellation Policies
CREATE TYPE refund_percentage_type AS ENUM (
  'full_refund',      -- 100% refund
  'partial_75',       -- 75% refund
  'partial_50',       -- 50% refund
  'partial_25',       -- 25% refund
  'no_refund'         -- 0% refund
);

CREATE TABLE cancellation_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Time-based refund rules
  -- If cancelled X hours before booking
  hours_before_24 refund_percentage_type DEFAULT 'partial_50',
  hours_before_48 refund_percentage_type DEFAULT 'partial_75',
  hours_before_72 refund_percentage_type DEFAULT 'full_refund',
  hours_after_24 refund_percentage_type DEFAULT 'no_refund',

  -- Policy settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Templates
CREATE TABLE booking_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Template details
  name TEXT NOT NULL,
  description TEXT,

  -- Default booking data
  boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
  duration duration_type,
  package_type package_type,
  passengers INTEGER,

  -- Pricing (can override)
  price_override DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),

  -- Customer template (for recurring customers)
  default_customer_name TEXT,
  default_customer_email TEXT,
  default_customer_phone TEXT,

  -- Settings
  notes TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recurring Booking Patterns
CREATE TYPE recurrence_type AS ENUM (
  'daily',
  'weekly',
  'biweekly',
  'monthly'
);

CREATE TABLE recurring_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Pattern details
  name TEXT NOT NULL,
  description TEXT,

  -- Recurrence settings
  recurrence_type recurrence_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for indefinite

  -- Booking template to use
  template_id UUID REFERENCES booking_templates(id) ON DELETE SET NULL,

  -- OR direct booking details
  boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
  start_time TIME NOT NULL,
  duration duration_type NOT NULL,
  package_type package_type NOT NULL,

  -- Customer details
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  passengers INTEGER DEFAULT 1,

  -- Pricing
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,

  -- Agent assignment
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Settings
  auto_confirm BOOLEAN DEFAULT false, -- Auto-confirm generated bookings
  skip_holidays BOOLEAN DEFAULT true,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Tracking
  last_generated_date DATE,
  next_generation_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track which bookings were generated from recurring patterns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_booking_id UUID REFERENCES recurring_bookings(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_booking_id UUID;

-- Group Bookings (multiple boats for one event)
CREATE TABLE group_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Group details
  name TEXT NOT NULL,
  description TEXT,

  -- Event details
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration duration_type NOT NULL,

  -- Coordinator/organizer
  organizer_name TEXT NOT NULL,
  organizer_email TEXT,
  organizer_phone TEXT NOT NULL,

  -- Total group info
  total_passengers INTEGER NOT NULL,
  number_of_boats INTEGER NOT NULL,

  -- Pricing
  total_price DECIMAL(10,2) NOT NULL,
  total_deposit DECIMAL(10,2) DEFAULT 0.00,
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid

  -- Settings
  special_requirements TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Waitlist (when no availability)
CREATE TYPE waitlist_status AS ENUM (
  'active',
  'contacted',
  'converted',
  'expired',
  'cancelled'
);

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Customer details
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,

  -- Desired booking details
  preferred_date DATE NOT NULL,
  alternative_dates DATE[], -- Array of alternative dates
  boat_id UUID REFERENCES boats(id) ON DELETE SET NULL, -- NULL = any boat
  duration duration_type,
  package_type package_type,
  passengers INTEGER NOT NULL,

  -- Waitlist management
  status waitlist_status DEFAULT 'active',
  priority INTEGER DEFAULT 0, -- Higher = more important
  contacted_at TIMESTAMPTZ,
  converted_to_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Notes
  notes TEXT,
  internal_notes TEXT, -- Staff notes, not visible to customer

  -- Expiry
  expires_at TIMESTAMPTZ, -- Auto-expire after this date

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cancellation_policies_company ON cancellation_policies(company_id);
CREATE INDEX idx_cancellation_policies_default ON cancellation_policies(company_id, is_default) WHERE is_default = true;
CREATE INDEX idx_booking_templates_company ON booking_templates(company_id);
CREATE INDEX idx_booking_templates_active ON booking_templates(company_id, is_active) WHERE is_active = true;
CREATE INDEX idx_recurring_bookings_company ON recurring_bookings(company_id);
CREATE INDEX idx_recurring_bookings_active ON recurring_bookings(company_id, is_active) WHERE is_active = true;
CREATE INDEX idx_recurring_bookings_next_gen ON recurring_bookings(next_generation_date) WHERE is_active = true;
CREATE INDEX idx_group_bookings_company ON group_bookings(company_id);
CREATE INDEX idx_group_bookings_date ON group_bookings(event_date);
CREATE INDEX idx_waitlist_company ON waitlist(company_id);
CREATE INDEX idx_waitlist_status ON waitlist(status) WHERE status = 'active';
CREATE INDEX idx_waitlist_date ON waitlist(preferred_date);
CREATE INDEX idx_bookings_recurring ON bookings(recurring_booking_id) WHERE recurring_booking_id IS NOT NULL;
CREATE INDEX idx_bookings_group ON bookings(group_booking_id) WHERE group_booking_id IS NOT NULL;

-- Triggers
CREATE TRIGGER update_cancellation_policies_updated_at
  BEFORE UPDATE ON cancellation_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_templates_updated_at
  BEFORE UPDATE ON booking_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_bookings_updated_at
  BEFORE UPDATE ON recurring_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_bookings_updated_at
  BEFORE UPDATE ON group_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate refund amount based on cancellation policy
CREATE OR REPLACE FUNCTION calculate_refund_amount(
  booking_price DECIMAL,
  cancellation_hours_before INTEGER,
  policy_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  refund_pct refund_percentage_type;
  policy RECORD;
BEGIN
  -- Get the policy
  SELECT * INTO policy FROM cancellation_policies WHERE id = policy_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Determine refund percentage based on time before booking
  IF cancellation_hours_before >= 72 THEN
    refund_pct := policy.hours_before_72;
  ELSIF cancellation_hours_before >= 48 THEN
    refund_pct := policy.hours_before_48;
  ELSIF cancellation_hours_before >= 24 THEN
    refund_pct := policy.hours_before_24;
  ELSE
    refund_pct := policy.hours_after_24;
  END IF;

  -- Calculate refund amount
  CASE refund_pct
    WHEN 'full_refund' THEN RETURN booking_price;
    WHEN 'partial_75' THEN RETURN booking_price * 0.75;
    WHEN 'partial_50' THEN RETURN booking_price * 0.50;
    WHEN 'partial_25' THEN RETURN booking_price * 0.25;
    WHEN 'no_refund' THEN RETURN 0;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to auto-expire old waitlist entries
CREATE OR REPLACE FUNCTION auto_expire_waitlist()
RETURNS void AS $$
BEGIN
  UPDATE waitlist
  SET status = 'expired'
  WHERE status = 'active'
    AND (
      expires_at < NOW()
      OR preferred_date < CURRENT_DATE - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if date should be skipped (holidays, etc.)
CREATE OR REPLACE FUNCTION should_skip_date(
  check_date DATE,
  skip_holidays BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  -- For now, simple implementation
  -- Could be extended to check holiday table
  IF skip_holidays THEN
    -- Skip Sundays as example
    IF EXTRACT(DOW FROM check_date) = 0 THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON cancellation_policies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON booking_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON recurring_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON waitlist TO authenticated;

-- Insert default cancellation policy
INSERT INTO cancellation_policies (
  company_id,
  name,
  description,
  hours_before_24,
  hours_before_48,
  hours_before_72,
  hours_after_24,
  is_default,
  is_active
)
SELECT
  id,
  'Standard Cancellation Policy',
  'Default cancellation policy with graduated refunds based on cancellation time',
  'partial_50',
  'partial_75',
  'full_refund',
  'no_refund',
  true,
  true
FROM companies
ON CONFLICT DO NOTHING;

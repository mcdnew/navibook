-- NaviBook Day-Charter Database Schema
-- Version: 1.0
-- Description: Complete schema for boat rental management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable btree_gist extension for exclusion constraints
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- =====================================================
-- HELPER FUNCTIONS FOR CONSTRAINTS
-- =====================================================

-- Immutable function to combine date and time into timestamptz
CREATE OR REPLACE FUNCTION date_time_to_timestamptz(d DATE, t TIME)
RETURNS TIMESTAMPTZ AS $$
  SELECT (d + t)::TIMESTAMPTZ;
$$ LANGUAGE SQL IMMUTABLE;

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'office_staff',
  'manager',
  'accountant',
  'power_agent',
  'regular_agent',
  'captain'
);

CREATE TYPE boat_type AS ENUM (
  'sailboat',
  'motorboat',
  'jetski'
);

CREATE TYPE booking_status AS ENUM (
  'pending_hold',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE duration_type AS ENUM (
  '2h',
  '3h',
  '4h',
  '8h'
);

CREATE TYPE package_type AS ENUM (
  'charter_only',
  'charter_drinks',
  'charter_food',
  'charter_full'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Companies (Multi-tenant ready)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'regular_agent',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  commission_fixed DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Boats
CREATE TABLE boats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  boat_type boat_type NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  license_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing (Duration-based pricing)
CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID REFERENCES boats(id) ON DELETE CASCADE,
  duration duration_type NOT NULL,
  package_type package_type NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(boat_id, duration, package_type)
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  boat_id UUID REFERENCES boats(id) ON DELETE RESTRICT,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  captain_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Booking details
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration duration_type NOT NULL,

  -- Customer details
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1,

  -- Pricing
  package_type package_type NOT NULL DEFAULT 'charter_only',
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,
  deposit_paid BOOLEAN DEFAULT false,

  -- Commission tracking
  agent_commission DECIMAL(10,2) DEFAULT 0.00,
  captain_fee DECIMAL(10,2) DEFAULT 0.00,

  -- Status and source
  status booking_status NOT NULL DEFAULT 'pending_hold',
  source TEXT DEFAULT 'direct', -- direct, website, hotel, etc.
  notes TEXT,

  -- Soft hold mechanism (15-minute hold)
  hold_until TIMESTAMPTZ,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Prevent overlapping bookings
  CONSTRAINT no_overlap EXCLUDE USING gist (
    boat_id WITH =,
    tstzrange(
      date_time_to_timestamptz(booking_date, start_time),
      date_time_to_timestamptz(booking_date, end_time)
    ) WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show'))
);

-- Booking History (Audit trail)
CREATE TABLE booking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- created, updated, confirmed, cancelled, etc.
  old_data JSONB,
  new_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- External Bookings (Webhook received bookings)
CREATE TABLE external_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  webhook_data JSONB NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Agent Commissions (Settlement tracking)
CREATE TABLE agent_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Captain Fees
CREATE TABLE captain_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  captain_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  fee_type TEXT DEFAULT 'per_charter', -- per_charter, hourly, daily
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Boat Blocks (Maintenance periods)
CREATE TABLE boat_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID REFERENCES boats(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent overlapping blocks
  CONSTRAINT no_block_overlap EXCLUDE USING gist (
    boat_id WITH =,
    tstzrange(start_datetime, end_datetime) WITH &&
  )
);

-- Weather Forecasts (Open-Meteo API data)
CREATE TABLE weather_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forecast_date DATE NOT NULL,
  forecast_time TIME NOT NULL,

  -- Weather conditions
  wave_height DECIMAL(5,2), -- meters
  wind_speed DECIMAL(5,2), -- km/h or knots
  wind_direction INTEGER, -- degrees
  temperature DECIMAL(5,2), -- celsius
  precipitation_probability INTEGER, -- percentage
  weather_code INTEGER,

  -- Calculated at specific location (company-specific)
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, forecast_date, forecast_time)
);

-- Weather Suitability (Calculated scores per boat)
CREATE TABLE weather_suitability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID REFERENCES boats(id) ON DELETE CASCADE,
  forecast_id UUID REFERENCES weather_forecasts(id) ON DELETE CASCADE,

  -- Safety scores (0-100)
  safety_score INTEGER NOT NULL,
  is_safe BOOLEAN NOT NULL DEFAULT true,
  warning_level TEXT, -- green, yellow, red
  warning_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(boat_id, forecast_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_boat ON bookings(boat_id);
CREATE INDEX idx_bookings_agent ON bookings(agent_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_company ON bookings(company_id);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_boats_company ON boats(company_id);
CREATE INDEX idx_boats_type ON boats(boat_type);
CREATE INDEX idx_weather_date ON weather_forecasts(forecast_date);
CREATE INDEX idx_external_bookings_processed ON external_bookings(processed);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boats_updated_at BEFORE UPDATE ON boats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Booking history trigger
CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO booking_history (booking_id, user_id, action, new_data)
    VALUES (NEW.id, auth.uid(), 'created', to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO booking_history (booking_id, user_id, action, old_data, new_data)
    VALUES (NEW.id, auth.uid(), 'updated', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO booking_history (booking_id, user_id, action, old_data)
    VALUES (OLD.id, auth.uid(), 'deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_booking_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_booking_changes();

-- Auto-calculate commission on booking insert/update
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
DECLARE
  agent_commission_pct DECIMAL(5,2);
  agent_commission_fixed DECIMAL(10,2);
BEGIN
  IF NEW.agent_id IS NOT NULL THEN
    SELECT commission_percentage, commission_fixed
    INTO agent_commission_pct, agent_commission_fixed
    FROM users
    WHERE id = NEW.agent_id;

    IF agent_commission_fixed > 0 THEN
      NEW.agent_commission := agent_commission_fixed;
    ELSE
      NEW.agent_commission := NEW.total_price * (agent_commission_pct / 100);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_commission_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION calculate_commission();

-- Insert default company
INSERT INTO companies (name, email) VALUES ('NaviBook Demo', 'demo@navibook.com');

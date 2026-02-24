-- ============================================================
-- NaviBook Day-Charter - Consolidated Schema
-- Single source of truth for the complete database schema
-- Generated from live database: 2026-02-24
-- Replaces migrations 001-025
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE boat_type AS ENUM ('sailboat', 'motorboat', 'jetski');
CREATE TYPE booking_category AS ENUM ('commercial', 'club_activity', 'sailing_school', 'private_class', 'maintenance', 'owner_use', 'bare_boat');
CREATE TYPE booking_status AS ENUM ('pending_hold', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE duration_type AS ENUM ('2h', '3h', '4h', '8h');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'delivered', 'bounced');
CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'booking_reminder', 'booking_cancelled', 'booking_rescheduled', 'payment_received', 'payment_reminder', 'low_availability_alert', 'agent_assignment');
CREATE TYPE package_type AS ENUM ('charter_only', 'charter_drinks', 'charter_food', 'charter_full');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'paypal', 'stripe', 'other');
CREATE TYPE payment_type AS ENUM ('deposit', 'final_payment', 'full_payment', 'refund', 'partial_refund');
CREATE TYPE recurrence_type AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');
CREATE TYPE refund_percentage_type AS ENUM ('full_refund', 'partial_75', 'partial_50', 'partial_25', 'no_refund');
CREATE TYPE user_role AS ENUM ('admin', 'office_staff', 'manager', 'accountant', 'power_agent', 'regular_agent', 'captain', 'company_admin', 'sailor', 'instructor', 'sales_agent', 'operations_manager', 'accounting_manager');
CREATE TYPE waitlist_status AS ENUM ('active', 'contacted', 'converted', 'expired', 'cancelled');

-- ============================================================
-- HELPER FUNCTION (needed before tables)
-- ============================================================
CREATE OR REPLACE FUNCTION public.date_time_to_timestamptz(d date, t time without time zone)
 RETURNS timestamp with time zone
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT (d + t)::TIMESTAMPTZ;
$function$
;

-- ============================================================
-- TABLES
-- ============================================================

-- TABLE: agent_commissions
CREATE TABLE IF NOT EXISTS agent_commissions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  agent_id UUID,
  booking_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: blocked_slots
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  boat_id UUID,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL,
  block_type TEXT DEFAULT 'maintenance'::character varying,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- TABLE: boat_blocks
CREATE TABLE IF NOT EXISTS boat_blocks (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  boat_id UUID,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: boat_fuel_config
CREATE TABLE IF NOT EXISTS boat_fuel_config (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  boat_id UUID NOT NULL,
  fuel_consumption_rate DECIMAL(10,2) NOT NULL,
  fuel_price_per_liter DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: boats
CREATE TABLE IF NOT EXISTS boats (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  name TEXT NOT NULL,
  boat_type boat_type NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  license_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  default_captain_id UUID
);

-- TABLE: booking_history
CREATE TABLE IF NOT EXISTS booking_history (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  booking_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: booking_sailors
CREATE TABLE IF NOT EXISTS booking_sailors (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  sailor_id UUID NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: booking_templates
CREATE TABLE IF NOT EXISTS booking_templates (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  created_by UUID,
  name TEXT NOT NULL,
  description TEXT,
  boat_id UUID,
  duration duration_type,
  package_type package_type,
  passengers INTEGER,
  price_override DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  default_customer_name TEXT,
  default_customer_email TEXT,
  default_customer_phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  boat_id UUID,
  agent_id UUID,
  captain_id UUID,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration duration_type NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1,
  package_type package_type NOT NULL DEFAULT 'charter_only'::package_type,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,
  deposit_paid BOOLEAN DEFAULT false,
  agent_commission DECIMAL(10,2) DEFAULT 0.00,
  captain_fee DECIMAL(10,2) DEFAULT 0.00,
  status booking_status NOT NULL DEFAULT 'pending_hold'::booking_status,
  source TEXT DEFAULT 'direct'::text,
  notes TEXT,
  hold_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  recurring_booking_id UUID,
  group_booking_id UUID,
  sailor_fee DECIMAL(10,2) DEFAULT 0.00,
  booking_category booking_category NOT NULL DEFAULT 'commercial'::booking_category,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  fuel_cost DECIMAL(10,2) DEFAULT 0,
  package_addon_cost DECIMAL(10,2) DEFAULT 0,
  is_bare_boat BOOLEAN DEFAULT false,
  cancellation_policy_id UUID,
  instructor_id UUID
);

-- TABLE: cancellation_policies
CREATE TABLE IF NOT EXISTS cancellation_policies (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  policy_name TEXT NOT NULL,
  refund_before_7_days DECIMAL(5,2) NOT NULL DEFAULT 100,
  refund_before_3_days DECIMAL(5,2) NOT NULL DEFAULT 50,
  refund_before_1_day DECIMAL(5,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- TABLE: captain_fees
CREATE TABLE IF NOT EXISTS captain_fees (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  captain_id UUID,
  booking_id UUID,
  fee_type TEXT DEFAULT 'per_charter'::text,
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  location_name TEXT
);

-- TABLE: company_package_config
CREATE TABLE IF NOT EXISTS company_package_config (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  drinks_cost_per_person DECIMAL(10,2) DEFAULT 0,
  food_cost_per_person DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  company_id UUID NOT NULL,
  current_value TEXT,
  requested_value TEXT,
  customer_message TEXT,
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  processed_by UUID,
  processed_at TIMESTAMPTZ
);

-- TABLE: customer_notes
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  customer_email TEXT NOT NULL,
  notes TEXT,
  preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABLE: customer_notification_preferences
CREATE TABLE IF NOT EXISTS customer_notification_preferences (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  company_id UUID NOT NULL,
  token TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + '30 days'::interval),
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- TABLE: external_bookings
CREATE TABLE IF NOT EXISTS external_bookings (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  webhook_data JSONB NOT NULL,
  booking_id UUID,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- TABLE: group_bookings
CREATE TABLE IF NOT EXISTS group_bookings (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  created_by UUID,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration duration_type NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT,
  organizer_phone TEXT NOT NULL,
  total_passengers INTEGER NOT NULL,
  number_of_boats INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  total_deposit DECIMAL(10,2) DEFAULT 0.00,
  payment_status TEXT DEFAULT 'unpaid'::text,
  special_requirements TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending'::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID,
  company_id UUID,
  email_booking_confirmations BOOLEAN DEFAULT true,
  email_booking_reminders BOOLEAN DEFAULT true,
  email_booking_changes BOOLEAN DEFAULT true,
  email_payment_notifications BOOLEAN DEFAULT true,
  email_agent_notifications BOOLEAN DEFAULT true,
  email_low_availability BOOLEAN DEFAULT true,
  sms_booking_confirmations BOOLEAN DEFAULT false,
  sms_booking_reminders BOOLEAN DEFAULT false,
  sms_urgent_only BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending'::notification_status,
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,
  user_id UUID,
  booking_id UUID,
  subject TEXT,
  message TEXT NOT NULL,
  template_id TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  external_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  booking_id UUID,
  company_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  payment_type payment_type NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_reference TEXT,
  notes TEXT,
  recorded_by UUID,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: pricing
CREATE TABLE IF NOT EXISTS pricing (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  boat_id UUID,
  duration duration_type NOT NULL,
  package_type package_type NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: recurring_bookings
CREATE TABLE IF NOT EXISTS recurring_bookings (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  created_by UUID,
  name TEXT NOT NULL,
  description TEXT,
  recurrence_type recurrence_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  template_id UUID,
  boat_id UUID,
  start_time TIME NOT NULL,
  duration duration_type NOT NULL,
  package_type package_type NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  passengers INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,
  agent_id UUID,
  auto_confirm BOOLEAN DEFAULT false,
  skip_holidays BOOLEAN DEFAULT true,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  last_generated_date DATE,
  next_generation_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: scheduled_notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  booking_id UUID,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL,
  company_id UUID,
  role user_role NOT NULL DEFAULT 'regular_agent'::user_role,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  commission_fixed DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  hourly_rate DECIMAL(10,2) DEFAULT 0
);

-- TABLE: waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  company_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  alternative_dates _date[],
  boat_id UUID,
  duration duration_type,
  package_type package_type,
  passengers INTEGER NOT NULL,
  status waitlist_status DEFAULT 'active'::waitlist_status,
  priority INTEGER DEFAULT 0,
  contacted_at TIMESTAMPTZ,
  converted_to_booking_id UUID,
  notes TEXT,
  internal_notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: weather_forecasts
CREATE TABLE IF NOT EXISTS weather_forecasts (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  forecast_date DATE NOT NULL,
  forecast_time TIME NOT NULL,
  wave_height DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  wind_direction INTEGER,
  temperature DECIMAL(5,2),
  precipitation_probability INTEGER,
  weather_code INTEGER,
  company_id UUID,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: weather_suitability
CREATE TABLE IF NOT EXISTS weather_suitability (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  boat_id UUID,
  forecast_id UUID,
  safety_score INTEGER NOT NULL,
  is_safe BOOLEAN NOT NULL DEFAULT true,
  warning_level TEXT,
  warning_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PRIMARY KEYS & UNIQUE CONSTRAINTS
-- ============================================================
ALTER TABLE agent_commissions ADD CONSTRAINT agent_commissions_pkey PRIMARY KEY (id);
ALTER TABLE blocked_slots ADD CONSTRAINT blocked_slots_pkey PRIMARY KEY (id);
ALTER TABLE blocked_slots ADD CONSTRAINT idx_blocked_slots_lookup UNIQUE (company_id, boat_id, blocked_date, start_time, end_time);
ALTER TABLE boat_blocks ADD CONSTRAINT boat_blocks_pkey PRIMARY KEY (id);
ALTER TABLE boat_fuel_config ADD CONSTRAINT boat_fuel_config_pkey PRIMARY KEY (id);
ALTER TABLE boat_fuel_config ADD CONSTRAINT boat_fuel_config_boat_id_key UNIQUE (boat_id);
ALTER TABLE boats ADD CONSTRAINT boats_pkey PRIMARY KEY (id);
ALTER TABLE booking_history ADD CONSTRAINT booking_history_pkey PRIMARY KEY (id);
ALTER TABLE booking_sailors ADD CONSTRAINT booking_sailors_pkey PRIMARY KEY (id);
ALTER TABLE booking_sailors ADD CONSTRAINT booking_sailors_booking_id_sailor_id_key UNIQUE (booking_id, sailor_id);
ALTER TABLE booking_templates ADD CONSTRAINT booking_templates_pkey PRIMARY KEY (id);
ALTER TABLE bookings ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);
ALTER TABLE cancellation_policies ADD CONSTRAINT cancellation_policies_pkey PRIMARY KEY (id);
ALTER TABLE cancellation_policies ADD CONSTRAINT unique_policy_per_company UNIQUE (company_id, policy_name);
ALTER TABLE captain_fees ADD CONSTRAINT captain_fees_pkey PRIMARY KEY (id);
ALTER TABLE companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE company_package_config ADD CONSTRAINT company_package_config_pkey PRIMARY KEY (id);
ALTER TABLE company_package_config ADD CONSTRAINT company_package_config_company_id_key UNIQUE (company_id);
ALTER TABLE customer_notes ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);
ALTER TABLE customer_notes ADD CONSTRAINT customer_notes_company_id_customer_email_key UNIQUE (company_id, customer_email);
ALTER TABLE customer_notification_preferences ADD CONSTRAINT customer_notification_preferences_pkey PRIMARY KEY (id);
ALTER TABLE customer_notification_preferences ADD CONSTRAINT customer_notification_preferences_company_id_customer_email_key UNIQUE (company_id, customer_email);
ALTER TABLE external_bookings ADD CONSTRAINT external_bookings_pkey PRIMARY KEY (id);
ALTER TABLE group_bookings ADD CONSTRAINT group_bookings_pkey PRIMARY KEY (id);
ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);
ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);
ALTER TABLE notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);
ALTER TABLE pricing ADD CONSTRAINT pricing_pkey PRIMARY KEY (id);
ALTER TABLE pricing ADD CONSTRAINT pricing_boat_id_duration_package_type_key UNIQUE (boat_id, duration, package_type);
ALTER TABLE recurring_bookings ADD CONSTRAINT recurring_bookings_pkey PRIMARY KEY (id);
ALTER TABLE scheduled_notifications ADD CONSTRAINT scheduled_notifications_pkey PRIMARY KEY (id);
ALTER TABLE scheduled_notifications ADD CONSTRAINT scheduled_notifications_booking_id_notification_type_channe_key UNIQUE (booking_id, notification_type, channel);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE waitlist ADD CONSTRAINT waitlist_pkey PRIMARY KEY (id);
ALTER TABLE weather_forecasts ADD CONSTRAINT weather_forecasts_pkey PRIMARY KEY (id);
ALTER TABLE weather_forecasts ADD CONSTRAINT weather_forecasts_company_id_forecast_date_forecast_time_key UNIQUE (company_id, forecast_date, forecast_time);
ALTER TABLE weather_suitability ADD CONSTRAINT weather_suitability_pkey PRIMARY KEY (id);
ALTER TABLE weather_suitability ADD CONSTRAINT weather_suitability_boat_id_forecast_id_key UNIQUE (boat_id, forecast_id);

-- Exclusion constraints (GIST)
ALTER TABLE boat_blocks ADD CONSTRAINT no_block_overlap EXCLUDE USING gist (boat_id WITH =, tstzrange(start_datetime, end_datetime) WITH &&);
ALTER TABLE bookings ADD CONSTRAINT no_overlap EXCLUDE USING gist (boat_id WITH =, tstzrange(date_time_to_timestamptz(booking_date, start_time), date_time_to_timestamptz(booking_date, end_time)) WITH &&) WHERE ((status <> ALL (ARRAY['cancelled'::booking_status, 'no_show'::booking_status])));

-- Check constraints
ALTER TABLE blocked_slots ADD CONSTRAINT check_date_range CHECK (end_date >= start_date);
ALTER TABLE blocked_slots ADD CONSTRAINT valid_time_range CHECK (end_time > start_time);
ALTER TABLE cancellation_policies ADD CONSTRAINT valid_refund_percentages CHECK ((refund_before_7_days >= (0)::numeric) AND (refund_before_7_days <= (100)::numeric) AND (refund_before_3_days >= (0)::numeric) AND (refund_before_3_days <= (100)::numeric) AND (refund_before_1_day >= (0)::numeric) AND (refund_before_1_day <= (100)::numeric));
ALTER TABLE payment_transactions ADD CONSTRAINT positive_amount CHECK (((payment_type = ANY (ARRAY['deposit'::payment_type, 'final_payment'::payment_type, 'full_payment'::payment_type])) AND (amount > (0)::numeric)) OR ((payment_type = ANY (ARRAY['refund'::payment_type, 'partial_refund'::payment_type])) AND (amount < (0)::numeric)));

-- ============================================================
-- FOREIGN KEYS
-- ============================================================
ALTER TABLE agent_commissions ADD CONSTRAINT agent_commissions_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE agent_commissions ADD CONSTRAINT agent_commissions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE blocked_slots ADD CONSTRAINT blocked_slots_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE;
ALTER TABLE blocked_slots ADD CONSTRAINT blocked_slots_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE blocked_slots ADD CONSTRAINT blocked_slots_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE boat_blocks ADD CONSTRAINT boat_blocks_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE;
ALTER TABLE boat_blocks ADD CONSTRAINT boat_blocks_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE boat_fuel_config ADD CONSTRAINT boat_fuel_config_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE;
ALTER TABLE boats ADD CONSTRAINT boats_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE boats ADD CONSTRAINT boats_default_captain_id_fkey FOREIGN KEY (default_captain_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE booking_history ADD CONSTRAINT booking_history_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
ALTER TABLE booking_history ADD CONSTRAINT booking_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE booking_sailors ADD CONSTRAINT booking_sailors_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
ALTER TABLE booking_sailors ADD CONSTRAINT booking_sailors_sailor_id_fkey FOREIGN KEY (sailor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE booking_templates ADD CONSTRAINT booking_templates_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE SET NULL;
ALTER TABLE booking_templates ADD CONSTRAINT booking_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE booking_templates ADD CONSTRAINT booking_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD CONSTRAINT bookings_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD CONSTRAINT bookings_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE RESTRICT;
ALTER TABLE bookings ADD CONSTRAINT bookings_cancellation_policy_id_fkey FOREIGN KEY (cancellation_policy_id) REFERENCES cancellation_policies(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD CONSTRAINT bookings_captain_id_fkey FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD CONSTRAINT bookings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD CONSTRAINT bookings_recurring_booking_id_fkey FOREIGN KEY (recurring_booking_id) REFERENCES recurring_bookings(id) ON DELETE SET NULL;
ALTER TABLE cancellation_policies ADD CONSTRAINT cancellation_policies_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE captain_fees ADD CONSTRAINT captain_fees_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE captain_fees ADD CONSTRAINT captain_fees_captain_id_fkey FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE company_package_config ADD CONSTRAINT company_package_config_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE customer_notes ADD CONSTRAINT customer_notes_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE customer_notification_preferences ADD CONSTRAINT customer_notification_preferences_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE external_bookings ADD CONSTRAINT external_bookings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE group_bookings ADD CONSTRAINT group_bookings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE group_bookings ADD CONSTRAINT group_bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE pricing ADD CONSTRAINT pricing_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE;
ALTER TABLE recurring_bookings ADD CONSTRAINT recurring_bookings_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE recurring_bookings ADD CONSTRAINT recurring_bookings_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE SET NULL;
ALTER TABLE recurring_bookings ADD CONSTRAINT recurring_bookings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE recurring_bookings ADD CONSTRAINT recurring_bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE recurring_bookings ADD CONSTRAINT recurring_bookings_template_id_fkey FOREIGN KEY (template_id) REFERENCES booking_templates(id) ON DELETE SET NULL;
ALTER TABLE scheduled_notifications ADD CONSTRAINT scheduled_notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
ALTER TABLE scheduled_notifications ADD CONSTRAINT scheduled_notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE waitlist ADD CONSTRAINT waitlist_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE SET NULL;
ALTER TABLE waitlist ADD CONSTRAINT waitlist_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE waitlist ADD CONSTRAINT waitlist_converted_to_booking_id_fkey FOREIGN KEY (converted_to_booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE weather_forecasts ADD CONSTRAINT weather_forecasts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE weather_suitability ADD CONSTRAINT weather_suitability_boat_id_fkey FOREIGN KEY (boat_id) REFERENCES boats(id) ON DELETE CASCADE;
ALTER TABLE weather_suitability ADD CONSTRAINT weather_suitability_forecast_id_fkey FOREIGN KEY (forecast_id) REFERENCES weather_forecasts(id) ON DELETE CASCADE;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_blocked_slots_boat ON public.blocked_slots USING btree (boat_id);
CREATE INDEX idx_blocked_slots_company ON public.blocked_slots USING btree (company_id);
CREATE INDEX idx_blocked_slots_date ON public.blocked_slots USING btree (blocked_date);
CREATE INDEX idx_blocked_slots_date_range ON public.blocked_slots USING btree (company_id, boat_id, start_date, end_date);
CREATE INDEX idx_boat_fuel_config_boat_id ON public.boat_fuel_config USING btree (boat_id);
CREATE INDEX idx_boats_company ON public.boats USING btree (company_id);
CREATE INDEX idx_boats_default_captain ON public.boats USING btree (default_captain_id);
CREATE INDEX idx_boats_type ON public.boats USING btree (boat_type);
CREATE INDEX idx_booking_sailors_booking ON public.booking_sailors USING btree (booking_id);
CREATE INDEX idx_booking_sailors_sailor ON public.booking_sailors USING btree (sailor_id);
CREATE INDEX idx_booking_templates_active ON public.booking_templates USING btree (company_id, is_active) WHERE (is_active = true);
CREATE INDEX idx_booking_templates_company ON public.booking_templates USING btree (company_id);
CREATE INDEX idx_bookings_agent ON public.bookings USING btree (agent_id);
CREATE INDEX idx_bookings_bare_boat ON public.bookings USING btree (is_bare_boat) WHERE (is_bare_boat = true);
CREATE INDEX idx_bookings_boat ON public.bookings USING btree (boat_id);
CREATE INDEX idx_bookings_cancellation_policy ON public.bookings USING btree (cancellation_policy_id);
CREATE INDEX idx_bookings_category ON public.bookings USING btree (booking_category);
CREATE INDEX idx_bookings_company ON public.bookings USING btree (company_id);
CREATE INDEX idx_bookings_date ON public.bookings USING btree (booking_date);
CREATE INDEX idx_bookings_group ON public.bookings USING btree (group_booking_id) WHERE (group_booking_id IS NOT NULL);
CREATE INDEX idx_bookings_instructor ON public.bookings USING btree (instructor_id);
CREATE INDEX idx_bookings_recurring ON public.bookings USING btree (recurring_booking_id) WHERE (recurring_booking_id IS NOT NULL);
CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);
CREATE INDEX idx_cancellation_policies_active ON public.cancellation_policies USING btree (company_id, is_active);
CREATE INDEX idx_cancellation_policies_company ON public.cancellation_policies USING btree (company_id);
CREATE INDEX idx_companies_location ON public.companies USING btree (latitude, longitude);
CREATE INDEX idx_company_package_config_company_id ON public.company_package_config USING btree (company_id);
CREATE INDEX idx_external_bookings_processed ON public.external_bookings USING btree (processed);
CREATE INDEX idx_group_bookings_company ON public.group_bookings USING btree (company_id);
CREATE INDEX idx_group_bookings_date ON public.group_bookings USING btree (event_date);
CREATE INDEX idx_notifications_booking ON public.notifications USING btree (booking_id);
CREATE INDEX idx_notifications_company ON public.notifications USING btree (company_id);
CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);
CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);
CREATE INDEX idx_notifications_type ON public.notifications USING btree (notification_type);
CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);
CREATE INDEX idx_payment_transactions_booking ON public.payment_transactions USING btree (booking_id);
CREATE INDEX idx_payment_transactions_company ON public.payment_transactions USING btree (company_id);
CREATE INDEX idx_payment_transactions_date ON public.payment_transactions USING btree (payment_date);
CREATE INDEX idx_payment_transactions_type ON public.payment_transactions USING btree (payment_type);
CREATE INDEX idx_recurring_bookings_active ON public.recurring_bookings USING btree (company_id, is_active) WHERE (is_active = true);
CREATE INDEX idx_recurring_bookings_company ON public.recurring_bookings USING btree (company_id);
CREATE INDEX idx_recurring_bookings_next_gen ON public.recurring_bookings USING btree (next_generation_date) WHERE (is_active = true);
CREATE INDEX idx_scheduled_notifications_booking ON public.scheduled_notifications USING btree (booking_id);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications USING btree (scheduled_for) WHERE (NOT sent);
CREATE INDEX idx_users_company ON public.users USING btree (company_id);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE INDEX idx_waitlist_company ON public.waitlist USING btree (company_id);
CREATE INDEX idx_waitlist_date ON public.waitlist USING btree (preferred_date);
CREATE INDEX idx_waitlist_status ON public.waitlist USING btree (status) WHERE (status = 'active'::waitlist_status);
CREATE INDEX idx_weather_date ON public.weather_forecasts USING btree (forecast_date);

-- ============================================================
-- FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.assign_default_cancellation_policy()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.auto_calculate_booking_costs()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.auto_expire_waitlist()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE waitlist
  SET status = 'expired'
  WHERE status = 'active'
    AND (
      expires_at < NOW()
      OR preferred_date < CURRENT_DATE - INTERVAL '7 days'
    );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_booking_sailor_fee(p_booking_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  total_fee DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(fee), 0) INTO total_fee
  FROM booking_sailors
  WHERE booking_id = p_booking_id;

  RETURN total_fee;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_commission()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_end_time(p_start_time time without time zone, p_duration duration_type)
 RETURNS time without time zone
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  RETURN CASE p_duration
    WHEN '2h' THEN p_start_time + INTERVAL '2 hours'
    WHEN '3h' THEN p_start_time + INTERVAL '3 hours'
    WHEN '4h' THEN p_start_time + INTERVAL '4 hours'
    WHEN '8h' THEN p_start_time + INTERVAL '8 hours'
  END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_fuel_cost(p_boat_id uuid, p_duration duration_type)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_instructor_fee(p_booking_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_instructor_id UUID;
  v_hourly_rate DECIMAL(10,2);
  v_duration INTEGER;
  v_fee DECIMAL(10,2);
BEGIN
  -- Get booking details
  SELECT b.instructor_id, b.duration, u.hourly_rate
  INTO v_instructor_id, v_duration, v_hourly_rate
  FROM bookings b
  LEFT JOIN users u ON b.instructor_id = u.id
  WHERE b.id = p_booking_id;

  -- If no instructor or no hourly rate, return 0
  IF v_instructor_id IS NULL OR v_hourly_rate IS NULL OR v_hourly_rate <= 0 THEN
    RETURN 0;
  END IF;

  -- Calculate fee: hourly_rate × duration_hours
  -- Duration is in format like '2h', '3h', '4h', '8h'
  v_fee := v_hourly_rate * (
    CASE v_duration
      WHEN '2h' THEN 2
      WHEN '3h' THEN 3
      WHEN '4h' THEN 4
      WHEN '8h' THEN 8
      ELSE 0
    END
  );

  RETURN v_fee;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_package_addon_cost(p_company_id uuid, p_package_type package_type, p_passengers integer)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_refund_amount(booking_price numeric, cancellation_hours_before integer, policy_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_refund_amount(p_booking_id uuid, p_cancellation_date date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.cash_dist(money, money)
 RETURNS money
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$cash_dist$function$
;
CREATE OR REPLACE FUNCTION public.check_boat_availability(p_boat_id uuid, p_start_date date, p_end_date date, p_start_time time without time zone, p_end_time time without time zone, p_exclude_booking_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.check_booking_category_permission()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_updated_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE bookings
    SET status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = 'Hold expired'
    WHERE status = 'pending_hold'
      AND hold_until IS NOT NULL
      AND hold_until < NOW()
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER INTO v_updated_count FROM updated;

  RETURN v_updated_count;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_id uuid, p_deposit_paid boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_success BOOLEAN;
BEGIN
  UPDATE bookings
  SET
    status = 'confirmed',
    deposit_paid = p_deposit_paid,
    hold_until = NULL
  WHERE id = p_booking_id
    AND status = 'pending_hold'
  RETURNING true INTO v_success;

  RETURN COALESCE(v_success, false);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_booking_with_hold(p_company_id uuid, p_boat_id uuid, p_agent_id uuid, p_booking_date date, p_start_time time without time zone, p_duration duration_type, p_customer_name text, p_customer_phone text, p_customer_email text DEFAULT NULL::text, p_passengers integer DEFAULT 1, p_package_type package_type DEFAULT 'charter_only'::package_type, p_total_price numeric DEFAULT 0, p_deposit_amount numeric DEFAULT 0, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_booking_id UUID;
  v_end_time TIME;
  v_is_available BOOLEAN;
BEGIN
  -- Calculate end time
  v_end_time := calculate_end_time(p_start_time, p_duration);

  -- Check availability with lock
  v_is_available := check_boat_availability(
    p_boat_id,
    p_booking_date,
    p_start_time,
    v_end_time
  );

  IF NOT v_is_available THEN
    RAISE EXCEPTION 'Boat is not available for the selected time slot';
  END IF;

  -- Create booking with 15-minute hold
  INSERT INTO bookings (
    company_id,
    boat_id,
    agent_id,
    booking_date,
    start_time,
    end_time,
    duration,
    customer_name,
    customer_phone,
    customer_email,
    passengers,
    package_type,
    total_price,
    deposit_amount,
    status,
    hold_until
  ) VALUES (
    p_company_id,
    p_boat_id,
    p_agent_id,
    p_booking_date,
    p_start_time,
    v_end_time,
    p_duration,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_passengers,
    p_package_type,
    p_total_price,
    p_deposit_amount,
    'pending_hold',
    NOW() + INTERVAL '15 minutes'
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_booking_with_hold(p_company_id uuid, p_boat_id uuid, p_agent_id uuid, p_booking_date date, p_start_time time without time zone, p_duration duration_type, p_customer_name text, p_customer_phone text, p_captain_id uuid DEFAULT NULL::uuid, p_customer_email text DEFAULT NULL::text, p_passengers integer DEFAULT 1, p_package_type package_type DEFAULT 'charter_only'::package_type, p_total_price numeric DEFAULT 0, p_captain_fee numeric DEFAULT 0, p_deposit_amount numeric DEFAULT 0, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
      DECLARE
        v_booking_id UUID;
        v_end_time TIME;
        v_is_available BOOLEAN;
      BEGIN
        v_end_time := calculate_end_time(p_start_time, p_duration);
        v_is_available := check_boat_availability(p_boat_id, p_booking_date, p_start_time, v_end_time);

        IF NOT v_is_available THEN
          RAISE EXCEPTION 'Boat is not available for the selected time slot';
        END IF;

        INSERT INTO bookings (
          company_id, boat_id, agent_id, captain_id, booking_date, start_time, end_time,
          duration, customer_name, customer_phone, customer_email, passengers, package_type,
          total_price, captain_fee, deposit_amount, status, hold_until
        ) VALUES (
          p_company_id, p_boat_id, p_agent_id, p_captain_id, p_booking_date, p_start_time, v_end_time,
          p_duration, p_customer_name, p_customer_phone, p_customer_email, p_passengers, p_package_type,
          p_total_price, p_captain_fee, p_deposit_amount, 'pending_hold', NOW() + INTERVAL '15 minutes'
        ) RETURNING id INTO v_booking_id;

        RETURN v_booking_id;
      END;
      $function$
;
CREATE OR REPLACE FUNCTION public.create_booking_with_hold(p_company_id uuid, p_boat_id uuid, p_agent_id uuid, p_booking_date date, p_start_time time without time zone, p_duration duration_type, p_customer_name text, p_customer_phone text, p_passengers integer, p_package_type package_type, p_total_price numeric, p_captain_fee numeric, p_deposit_amount numeric, p_captain_id uuid DEFAULT NULL::uuid, p_customer_email text DEFAULT NULL::text, p_notes text DEFAULT NULL::text, p_booking_category booking_category DEFAULT 'commercial'::booking_category, p_discount_percentage numeric DEFAULT 0, p_is_bare_boat boolean DEFAULT false, p_fuel_cost numeric DEFAULT 0, p_package_addon_cost numeric DEFAULT 0, p_cancellation_policy_id uuid DEFAULT NULL::uuid, p_instructor_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  DECLARE
    v_booking_id UUID;
    v_end_time TIME;
    v_is_available BOOLEAN;
  BEGIN
    -- Calculate end time
    v_end_time := calculate_end_time(p_start_time, p_duration);

    -- Check availability with lock
    v_is_available := check_boat_availability(
      p_boat_id,
      p_booking_date,
      p_booking_date,
      p_start_time,
      v_end_time
    );

    IF NOT v_is_available THEN
      RAISE EXCEPTION 'Boat is not available for the selected time slot';
    END IF;

    -- Create booking with 15-minute hold
    INSERT INTO bookings (
      company_id,
      boat_id,
      agent_id,
      captain_id,
      booking_date,
      start_time,
      end_time,
      duration,
      customer_name,
      customer_phone,
      customer_email,
      passengers,
      package_type,
      total_price,
      captain_fee,
      deposit_amount,
      status,
      hold_until,
      booking_category,
      discount_percentage,
      is_bare_boat,
      fuel_cost,
      package_addon_cost,
      cancellation_policy_id,
      instructor_id,
      notes
    ) VALUES (
      p_company_id,
      p_boat_id,
      p_agent_id,
      p_captain_id,
      p_booking_date,
      p_start_time,
      v_end_time,
      p_duration,
      p_customer_name,
      p_customer_phone,
      p_customer_email,
      p_passengers,
      p_package_type,
      p_total_price,
      p_captain_fee,
      p_deposit_amount,
      'pending_hold',
      NOW() + INTERVAL '15 minutes',
      p_booking_category,
      p_discount_percentage,
      p_is_bare_boat,
      p_fuel_cost,
      p_package_addon_cost,
      p_cancellation_policy_id,
      p_instructor_id,
      p_notes
    ) RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
  END;
  $function$
;
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO notification_preferences (user_id, company_id)
  VALUES (NEW.id, NEW.company_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$
;
 RETURNS TABLE(token text, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
  v_company_id UUID;
BEGIN
  -- Get company_id from booking
  SELECT b.company_id INTO v_company_id
  FROM bookings b
  WHERE b.id = p_booking_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Check if active token exists
  SELECT pt.token, pt.expires_at INTO v_token, v_expires_at
  WHERE pt.booking_id = p_booking_id
    AND pt.is_active = true
    AND pt.expires_at > NOW();

  -- If no active token, create new one
  IF v_token IS NULL THEN
    v_token := generate_portal_token();
    v_expires_at := NOW() + INTERVAL '30 days';

      booking_id,
      company_id,
      token,
      customer_email,
      customer_name,
      expires_at
    ) VALUES (
      p_booking_id,
      v_company_id,
      v_token,
      p_customer_email,
      p_customer_name,
      v_expires_at
    );
  END IF;

  RETURN QUERY SELECT v_token, v_expires_at;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.date_dist(date, date)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$date_dist$function$
;
CREATE OR REPLACE FUNCTION public.float4_dist(real, real)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$float4_dist$function$
;
CREATE OR REPLACE FUNCTION public.float8_dist(double precision, double precision)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$float8_dist$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bit_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bit_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bit_consistent(internal, bit, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bit_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bit_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bit_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bit_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bit_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bit_same(gbtreekey_var, gbtreekey_var, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bit_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bit_union(internal, internal)
 RETURNS gbtreekey_var
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bit_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bool_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/btree_gist', $function$gbt_bool_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bool_consistent(internal, boolean, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/btree_gist', $function$gbt_bool_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bool_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/btree_gist', $function$gbt_bool_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bool_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/btree_gist', $function$gbt_bool_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bool_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/btree_gist', $function$gbt_bool_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bool_same(gbtreekey2, gbtreekey2, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/btree_gist', $function$gbt_bool_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bool_union(internal, internal)
 RETURNS gbtreekey2
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/btree_gist', $function$gbt_bool_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bpchar_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bpchar_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bpchar_consistent(internal, character, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bpchar_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bytea_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bytea_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bytea_consistent(internal, bytea, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bytea_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bytea_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bytea_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bytea_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bytea_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bytea_same(gbtreekey_var, gbtreekey_var, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bytea_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_bytea_union(internal, internal)
 RETURNS gbtreekey_var
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_bytea_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_consistent(internal, money, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_distance(internal, money, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_cash_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_cash_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_consistent(internal, date, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_distance(internal, date, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_same(gbtreekey8, gbtreekey8, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_date_union(internal, internal)
 RETURNS gbtreekey8
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_date_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_decompress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_enum_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_enum_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_enum_consistent(internal, anyenum, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_enum_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_enum_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_enum_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_enum_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_enum_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_enum_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_enum_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_enum_same(gbtreekey8, gbtreekey8, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_enum_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_enum_union(internal, internal)
 RETURNS gbtreekey8
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_enum_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_consistent(internal, real, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_distance(internal, real, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_same(gbtreekey8, gbtreekey8, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float4_union(internal, internal)
 RETURNS gbtreekey8
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float4_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_consistent(internal, double precision, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_distance(internal, double precision, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_float8_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_float8_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_inet_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_inet_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_inet_consistent(internal, inet, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_inet_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_inet_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_inet_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_inet_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_inet_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_inet_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_inet_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_inet_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_inet_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_consistent(internal, smallint, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_distance(internal, smallint, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_same(gbtreekey4, gbtreekey4, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int2_union(internal, internal)
 RETURNS gbtreekey4
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int2_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_consistent(internal, integer, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_distance(internal, integer, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_same(gbtreekey8, gbtreekey8, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int4_union(internal, internal)
 RETURNS gbtreekey8
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int4_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_consistent(internal, bigint, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_distance(internal, bigint, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_int8_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_int8_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_consistent(internal, interval, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_decompress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_distance(internal, interval, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_same(gbtreekey32, gbtreekey32, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_intv_union(internal, internal)
 RETURNS gbtreekey32
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_intv_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad8_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad8_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad8_consistent(internal, macaddr8, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad8_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad8_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad8_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad8_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad8_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad8_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad8_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad8_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad8_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad8_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad8_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad_consistent(internal, macaddr, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_macad_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_macad_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_numeric_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_numeric_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_numeric_consistent(internal, numeric, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_numeric_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_numeric_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_numeric_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_numeric_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_numeric_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_numeric_same(gbtreekey_var, gbtreekey_var, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_numeric_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_numeric_union(internal, internal)
 RETURNS gbtreekey_var
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_numeric_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_consistent(internal, oid, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_distance(internal, oid, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_same(gbtreekey8, gbtreekey8, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_oid_union(internal, internal)
 RETURNS gbtreekey8
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_oid_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_text_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_text_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_text_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_text_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_text_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_text_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_text_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_text_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_text_same(gbtreekey_var, gbtreekey_var, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_text_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_text_union(internal, internal)
 RETURNS gbtreekey_var
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_text_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_consistent(internal, time without time zone, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_distance(internal, time without time zone, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_time_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_time_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_timetz_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_timetz_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_timetz_consistent(internal, time with time zone, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_timetz_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_consistent(internal, timestamp without time zone, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_distance(internal, timestamp without time zone, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_same(gbtreekey16, gbtreekey16, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_ts_union(internal, internal)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_ts_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_tstz_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_tstz_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_tstz_consistent(internal, timestamp with time zone, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_tstz_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_tstz_distance(internal, timestamp with time zone, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_tstz_distance$function$
;
CREATE OR REPLACE FUNCTION public.gbt_uuid_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_uuid_compress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_uuid_consistent(internal, uuid, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_uuid_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gbt_uuid_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_uuid_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbt_uuid_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_uuid_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gbt_uuid_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_uuid_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gbt_uuid_same(gbtreekey32, gbtreekey32, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_uuid_same$function$
;
CREATE OR REPLACE FUNCTION public.gbt_uuid_union(internal, internal)
 RETURNS gbtreekey32
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_uuid_union$function$
;
CREATE OR REPLACE FUNCTION public.gbt_var_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_var_decompress$function$
;
CREATE OR REPLACE FUNCTION public.gbt_var_fetch(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbt_var_fetch$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey16_in(cstring)
 RETURNS gbtreekey16
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_in$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey16_out(gbtreekey16)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_out$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey2_in(cstring)
 RETURNS gbtreekey2
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_in$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey2_out(gbtreekey2)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_out$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey32_in(cstring)
 RETURNS gbtreekey32
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_in$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey32_out(gbtreekey32)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_out$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey4_in(cstring)
 RETURNS gbtreekey4
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_in$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey4_out(gbtreekey4)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_out$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey8_in(cstring)
 RETURNS gbtreekey8
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_in$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey8_out(gbtreekey8)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_out$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey_var_in(cstring)
 RETURNS gbtreekey_var
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_in$function$
;
CREATE OR REPLACE FUNCTION public.gbtreekey_var_out(gbtreekey_var)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$gbtreekey_out$function$
;
CREATE OR REPLACE FUNCTION public.generate_portal_token()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  token TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..64 LOOP
    token := token || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
  END LOOP;
  RETURN token;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_agent_performance(p_company_id uuid, p_start_date date, p_end_date date)
 RETURNS TABLE(agent_id uuid, agent_name text, total_bookings bigint, total_revenue numeric, total_commission numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.first_name || ' ' || u.last_name as agent_name,
    COUNT(b.id)::BIGINT,
    COALESCE(SUM(b.total_price), 0)::DECIMAL(10,2),
    COALESCE(SUM(b.agent_commission), 0)::DECIMAL(10,2)
  FROM users u
  LEFT JOIN bookings b ON b.agent_id = u.id
    AND b.booking_date BETWEEN p_start_date AND p_end_date
    AND b.status NOT IN ('cancelled', 'no_show')
  WHERE u.company_id = p_company_id
    AND u.role IN ('regular_agent', 'power_agent')
  GROUP BY u.id, u.first_name, u.last_name
  ORDER BY total_revenue DESC;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_available_boats(p_company_id uuid, p_booking_date date, p_start_time time without time zone, p_end_time time without time zone, p_boat_type boat_type DEFAULT NULL::boat_type, p_min_capacity integer DEFAULT 1)
 RETURNS TABLE(boat_id uuid, boat_name text, boat_type boat_type, capacity integer, image_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.get_blocked_slots_for_range(p_company_id uuid, p_start_date date, p_end_date date, p_boat_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, boat_id uuid, boat_name text, blocked_date date, start_time time without time zone, end_time time without time zone, reason text, block_type character varying, created_by uuid, creator_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.get_blocked_slots_for_range(p_company_id uuid, p_start_date date, p_end_date date)
 RETURNS TABLE(id uuid, boat_id uuid, boat_name character varying, start_date date, end_date date, start_time time without time zone, end_time time without time zone, reason text, block_type character varying, created_by_name character varying, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.get_booking_stats(p_company_id uuid, p_start_date date, p_end_date date)
 RETURNS TABLE(total_bookings bigint, total_revenue numeric, confirmed_bookings bigint, cancelled_bookings bigint, total_commissions numeric, total_captain_fees numeric, total_sailor_fees numeric, total_fuel_costs numeric, total_package_addon_costs numeric, commercial_revenue numeric, internal_revenue numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.get_outstanding_balance(booking_uuid uuid)
 RETURNS numeric
 LANGUAGE sql
 STABLE
AS $function$
  SELECT b.total_price - COALESCE(SUM(pt.amount), 0)
  FROM bookings b
  LEFT JOIN payment_transactions pt ON pt.booking_id = b.id
  WHERE b.id = booking_uuid
  GROUP BY b.total_price;
$function$
;
CREATE OR REPLACE FUNCTION public.get_total_paid(booking_uuid uuid)
 RETURNS numeric
 LANGUAGE sql
 STABLE
AS $function$
  SELECT COALESCE(SUM(amount), 0)
  FROM payment_transactions
  WHERE booking_id = booking_uuid;
$function$
;
CREATE OR REPLACE FUNCTION public.get_user_company()
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT company_id FROM users WHERE id = auth.uid();
$function$
;
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS user_role
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT role FROM users WHERE id = auth.uid();
$function$
;
CREATE OR REPLACE FUNCTION public.int2_dist(smallint, smallint)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$int2_dist$function$
;
CREATE OR REPLACE FUNCTION public.int4_dist(integer, integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$int4_dist$function$
;
CREATE OR REPLACE FUNCTION public.int8_dist(bigint, bigint)
 RETURNS bigint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$int8_dist$function$
;
CREATE OR REPLACE FUNCTION public.interval_dist(interval, interval)
 RETURNS interval
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$interval_dist$function$
;
CREATE OR REPLACE FUNCTION public.is_admin_or_office()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'office_staff', 'manager')
  );
$function$
;
CREATE OR REPLACE FUNCTION public.is_slot_blocked(p_boat_id uuid, p_start_date date, p_end_date date, p_start_time time without time zone, p_end_time time without time zone)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.log_booking_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.oid_dist(oid, oid)
 RETURNS oid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$oid_dist$function$
;
CREATE OR REPLACE FUNCTION public.schedule_booking_reminder()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  reminder_time TIMESTAMPTZ;
  customer_prefs RECORD;
BEGIN
  -- Only schedule for confirmed bookings
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    -- Calculate reminder time (24 hours before booking by default)
    reminder_time := (NEW.booking_date + NEW.start_time) - INTERVAL '24 hours';

    -- Only schedule if booking is in the future
    IF reminder_time > NOW() THEN
      -- Insert scheduled reminder
      INSERT INTO scheduled_notifications (
        company_id,
        booking_id,
        notification_type,
        channel,
        scheduled_for,
        recipient_email,
        recipient_phone,
        recipient_name
      ) VALUES (
        NEW.company_id,
        NEW.id,
        'booking_reminder',
        'email',
        reminder_time,
        NEW.customer_email,
        NEW.customer_phone,
        NEW.customer_name
      )
      ON CONFLICT (booking_id, notification_type, channel)
      DO UPDATE SET scheduled_for = EXCLUDED.scheduled_for, sent = false;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.scheduled_cleanup()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  PERFORM cleanup_expired_holds();
END;
$function$
;
CREATE OR REPLACE FUNCTION public.should_skip_date(check_date date, skip_holidays boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.time_dist(time without time zone, time without time zone)
 RETURNS interval
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$time_dist$function$
;
CREATE OR REPLACE FUNCTION public.ts_dist(timestamp without time zone, timestamp without time zone)
 RETURNS interval
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$ts_dist$function$
;
CREATE OR REPLACE FUNCTION public.tstz_dist(timestamp with time zone, timestamp with time zone)
 RETURNS interval
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/btree_gist', $function$tstz_dist$function$
;
CREATE OR REPLACE FUNCTION public.update_blocked_slots_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_booking_sailor_fee()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.update_cancellation_policies_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.validate_booking_data()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validate that booking_category is a valid enum value
  -- This is handled by PostgreSQL enum type automatically, but we can add additional validation here

  -- Validate that bare boat bookings have captain_fee = 0
  IF NEW.is_bare_boat = true THEN
    NEW.captain_fee := 0;
    NEW.captain_id := NULL;
  END IF;

  -- Validate passenger count is positive
  IF NEW.passengers <= 0 THEN
    RAISE EXCEPTION 'Passenger count must be greater than 0';
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.validate_sailing_school_instructor()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- If booking is sailing_school, require instructor
  IF NEW.booking_category = 'sailing_school' AND NEW.instructor_id IS NULL THEN
    RAISE EXCEPTION 'Sailing school bookings must have an instructor assigned';
  END IF;

  -- If instructor is assigned, verify they exist
  IF NEW.instructor_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = NEW.instructor_id
    ) THEN
      RAISE EXCEPTION 'Instructor user not found';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;
 RETURNS TABLE(booking_id uuid, company_id uuid, customer_email text, customer_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update last accessed timestamp
  SET last_accessed_at = NOW()
  WHERE token = p_token
    AND is_active = true
    AND expires_at > NOW();

  -- Return token details if valid
  RETURN QUERY
  SELECT
    pt.booking_id,
    pt.company_id,
    pt.customer_email,
    pt.customer_name
  WHERE pt.token = p_token
    AND pt.is_active = true
    AND pt.expires_at > NOW();
END;
$function$
;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER blocked_slots_updated_at BEFORE UPDATE ON public.blocked_slots FOR EACH ROW EXECUTE FUNCTION update_blocked_slots_updated_at();
CREATE TRIGGER trigger_update_boat_fuel_config_timestamp BEFORE UPDATE ON public.boat_fuel_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boats_updated_at BEFORE UPDATE ON public.boats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_booking_sailor_fee AFTER INSERT OR DELETE OR UPDATE ON public.booking_sailors FOR EACH ROW EXECUTE FUNCTION update_booking_sailor_fee();
CREATE TRIGGER update_booking_templates_updated_at BEFORE UPDATE ON public.booking_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER calculate_commission_trigger BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION calculate_commission();
CREATE TRIGGER log_booking_changes_trigger AFTER INSERT OR DELETE OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION log_booking_changes();
CREATE TRIGGER schedule_booking_reminder_trigger AFTER INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION schedule_booking_reminder();
CREATE TRIGGER trigger_assign_default_cancellation_policy BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION assign_default_cancellation_policy();
CREATE TRIGGER trigger_auto_calculate_booking_costs BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION auto_calculate_booking_costs();
CREATE TRIGGER trigger_validate_booking_data BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION validate_booking_data();
CREATE TRIGGER trigger_validate_sailing_school_instructor BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION validate_sailing_school_instructor();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_cancellation_policies_updated_at BEFORE UPDATE ON public.cancellation_policies FOR EACH ROW EXECUTE FUNCTION update_cancellation_policies_updated_at();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_company_package_config_timestamp BEFORE UPDATE ON public.company_package_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_notification_preferences_updated_at BEFORE UPDATE ON public.customer_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_bookings_updated_at BEFORE UPDATE ON public.group_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON public.pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_bookings_updated_at BEFORE UPDATE ON public.recurring_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER create_user_notification_preferences AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON public.waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_fuel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_sailors ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_package_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_suitability ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "Admin can manage commissions" ON agent_commissions FOR UPDATE
  USING (is_admin_or_office());
CREATE POLICY "Agents can view their own commissions" ON agent_commissions FOR SELECT
  USING (((agent_id = auth.uid()) OR is_admin_or_office()));
CREATE POLICY "System can insert commissions" ON agent_commissions FOR INSERT
  WITH CHECK (is_admin_or_office());
CREATE POLICY "Admins and power agents can delete blocked slots" ON blocked_slots FOR DELETE
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role, 'power_agent'::user_role]))))));
CREATE POLICY "Admins and power agents can insert blocked slots" ON blocked_slots FOR INSERT
  WITH CHECK ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role, 'power_agent'::user_role]))))));
CREATE POLICY "Admins and power agents can update blocked slots" ON blocked_slots FOR UPDATE
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role, 'power_agent'::user_role]))))));
CREATE POLICY "Users can view company blocked slots" ON blocked_slots FOR SELECT
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "Admins can manage boat blocks" ON boat_blocks FOR ALL
  USING (((EXISTS ( SELECT 1
   FROM boats
  WHERE ((boats.id = boat_blocks.boat_id) AND (boats.company_id = get_user_company())))) AND is_admin_or_office()));
CREATE POLICY "Users can view boat blocks in their company" ON boat_blocks FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM boats
  WHERE ((boats.id = boat_blocks.boat_id) AND (boats.company_id = get_user_company())))));
CREATE POLICY "Admin staff can delete fuel config" ON boat_fuel_config FOR DELETE
  USING (((EXISTS ( SELECT 1
   FROM boats b
  WHERE ((b.id = boat_fuel_config.boat_id) AND (b.company_id = get_user_company())))) AND is_admin_or_office()));
CREATE POLICY "Admin staff can manage fuel config" ON boat_fuel_config FOR INSERT
  WITH CHECK (((EXISTS ( SELECT 1
   FROM boats b
  WHERE ((b.id = boat_fuel_config.boat_id) AND (b.company_id = get_user_company())))) AND is_admin_or_office()));
CREATE POLICY "Admin staff can update fuel config" ON boat_fuel_config FOR UPDATE
  USING (((EXISTS ( SELECT 1
   FROM boats b
  WHERE ((b.id = boat_fuel_config.boat_id) AND (b.company_id = get_user_company())))) AND is_admin_or_office()))
  WITH CHECK (((EXISTS ( SELECT 1
   FROM boats b
  WHERE ((b.id = boat_fuel_config.boat_id) AND (b.company_id = get_user_company())))) AND is_admin_or_office()));
CREATE POLICY "Users can view fuel config for their company boats" ON boat_fuel_config FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM boats b
  WHERE ((b.id = boat_fuel_config.boat_id) AND (b.company_id = get_user_company())))));
CREATE POLICY "Admins can manage boats" ON boats FOR ALL
  USING (((company_id = get_user_company()) AND is_admin_or_office()));
CREATE POLICY "Users can view boats in their company" ON boats FOR SELECT
  USING ((company_id = get_user_company()));
CREATE POLICY "System can insert booking history" ON booking_history FOR INSERT
  WITH CHECK (true);
CREATE POLICY "View booking history for accessible bookings" ON booking_history FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM bookings
  WHERE ((bookings.id = booking_history.booking_id) AND (bookings.company_id = get_user_company()) AND (is_admin_or_office() OR (bookings.agent_id = auth.uid()))))));
CREATE POLICY "Admin/manager/office can delete booking sailors" ON booking_sailors FOR DELETE
  USING (is_admin_or_office());
CREATE POLICY "Admin/manager/office can insert booking sailors" ON booking_sailors FOR INSERT
  WITH CHECK (is_admin_or_office());
CREATE POLICY "Admin/manager/office can update booking sailors" ON booking_sailors FOR UPDATE
  USING (is_admin_or_office())
  WITH CHECK (is_admin_or_office());
CREATE POLICY "Sailors can view their own assignments" ON booking_sailors FOR SELECT
  USING ((sailor_id = auth.uid()));
CREATE POLICY "View booking sailors based on booking access" ON booking_sailors FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM bookings b
  WHERE ((b.id = booking_sailors.booking_id) AND (b.company_id = get_user_company()) AND (is_admin_or_office() OR (b.agent_id = auth.uid()) OR (b.captain_id = auth.uid()))))));
CREATE POLICY "Agents can create bookings" ON bookings FOR INSERT
  WITH CHECK (((company_id = get_user_company()) AND ((agent_id = auth.uid()) OR is_admin_or_office())));
CREATE POLICY "Agents cannot change non-commercial bookings" ON bookings FOR UPDATE
  USING (true)
  WITH CHECK (((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) <> ALL (ARRAY['regular_agent'::user_role, 'power_agent'::user_role])) OR (booking_category = 'commercial'::booking_category)));
CREATE POLICY "Agents restricted to commercial bookings" ON bookings FOR INSERT
  WITH CHECK (((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) <> ALL (ARRAY['regular_agent'::user_role, 'power_agent'::user_role])) OR (booking_category = 'commercial'::booking_category)));
CREATE POLICY "Only admin can delete bookings" ON bookings FOR DELETE
  USING (((company_id = get_user_company()) AND is_admin_or_office()));
CREATE POLICY "Sales agents restricted to commercial bookings" ON bookings FOR INSERT
  WITH CHECK (((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) <> 'sales_agent'::user_role) OR (booking_category = 'commercial'::booking_category)));
CREATE POLICY "Update bookings based on role" ON bookings FOR UPDATE
  USING (((company_id = get_user_company()) AND (is_admin_or_office() OR ((agent_id = auth.uid()) AND (status = ANY (ARRAY['pending_hold'::booking_status, 'confirmed'::booking_status]))))));
CREATE POLICY "Users can view company bookings" ON bookings FOR SELECT
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "View bookings based on role" ON bookings FOR SELECT
  USING (((company_id = get_user_company()) AND (is_admin_or_office() OR (agent_id = auth.uid()) OR (captain_id = auth.uid()))));
CREATE POLICY "Admins can manage cancellation policies" ON cancellation_policies FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.company_id = cancellation_policies.company_id) AND (u.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))));
CREATE POLICY "Admins can update cancellation policies" ON cancellation_policies FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.company_id = cancellation_policies.company_id) AND (u.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.company_id = cancellation_policies.company_id) AND (u.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))));
CREATE POLICY "Users can view own company cancellation policies" ON cancellation_policies FOR SELECT
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "Admin can manage captain fees" ON captain_fees FOR UPDATE
  USING (is_admin_or_office());
CREATE POLICY "Captains can view their own fees" ON captain_fees FOR SELECT
  USING (((captain_id = auth.uid()) OR is_admin_or_office()));
CREATE POLICY "System can insert captain fees" ON captain_fees FOR INSERT
  WITH CHECK (is_admin_or_office());
CREATE POLICY "Admins can update their company" ON companies FOR UPDATE
  USING (((id = get_user_company()) AND (get_user_role() = 'admin'::user_role)));
CREATE POLICY "Users can view their company" ON companies FOR SELECT
  USING ((id = get_user_company()));
CREATE POLICY "Admin staff can delete package config" ON company_package_config FOR DELETE
  USING (((company_id = get_user_company()) AND is_admin_or_office()));
CREATE POLICY "Admin staff can manage package config" ON company_package_config FOR INSERT
  WITH CHECK (((company_id = get_user_company()) AND is_admin_or_office()));
CREATE POLICY "Admin staff can update package config" ON company_package_config FOR UPDATE
  USING (((company_id = get_user_company()) AND is_admin_or_office()))
  WITH CHECK (((company_id = get_user_company()) AND is_admin_or_office()));
CREATE POLICY "Users can view their company package config" ON company_package_config FOR SELECT
  USING ((company_id = get_user_company()));
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "Users can insert customer notes for their company" ON customer_notes FOR INSERT
  WITH CHECK ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "Users can update their company's customer notes" ON customer_notes FOR UPDATE
  USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "Users can view their company's customer notes" ON customer_notes FOR SELECT
  USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "API can insert external bookings" ON external_bookings FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admin can view external bookings" ON external_bookings FOR SELECT
  USING (is_admin_or_office());
CREATE POLICY "Admins and accounting managers can manage payment transactions" ON payment_transactions FOR INSERT
  WITH CHECK (((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::user_role, 'accounting_manager'::user_role, 'operations_manager'::user_role, 'office_staff'::user_role])) AND (company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())))));
CREATE POLICY "Admins and accounting managers can select payment transactions" ON payment_transactions FOR SELECT
  USING (((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::user_role, 'accounting_manager'::user_role, 'operations_manager'::user_role, 'office_staff'::user_role])) AND (company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())))));
CREATE POLICY "Admins and accounting managers can update payment transactions" ON payment_transactions FOR UPDATE
  WITH CHECK (((( SELECT users.role
   FROM users
  WHERE (users.id = auth.uid())) = ANY (ARRAY['admin'::user_role, 'accounting_manager'::user_role, 'operations_manager'::user_role, 'office_staff'::user_role])) AND (company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())))));
CREATE POLICY "Admins can update payment transactions" ON payment_transactions FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.company_id = payment_transactions.company_id) AND (u.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.id = auth.uid()) AND (u.company_id = payment_transactions.company_id) AND (u.role = ANY (ARRAY['admin'::user_role, 'manager'::user_role]))))));
CREATE POLICY "Agents can view their own commission payments" ON payment_transactions FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM bookings b
  WHERE ((b.id = payment_transactions.booking_id) AND (b.agent_id = auth.uid())))));
CREATE POLICY "Users can view own company payment transactions" ON payment_transactions FOR SELECT
  USING ((company_id IN ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY "Admins can manage pricing" ON pricing FOR ALL
  USING (((EXISTS ( SELECT 1
   FROM boats
  WHERE ((boats.id = pricing.boat_id) AND (boats.company_id = get_user_company())))) AND is_admin_or_office()));
CREATE POLICY "Users can view pricing" ON pricing FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM boats
  WHERE ((boats.id = pricing.boat_id) AND (boats.company_id = get_user_company())))));
CREATE POLICY "Admins can insert users in their company" ON users FOR INSERT
  WITH CHECK (((company_id = get_user_company()) AND (get_user_role() = 'admin'::user_role)));
CREATE POLICY "Admins can update users in their company" ON users FOR UPDATE
  USING (((company_id = get_user_company()) AND is_admin_or_office()));
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE
  USING ((id = auth.uid()));
CREATE POLICY "Users can view users in their company" ON users FOR SELECT
  USING ((company_id = get_user_company()));
CREATE POLICY "System can insert weather forecasts" ON weather_forecasts FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Users can view weather for their company" ON weather_forecasts FOR SELECT
  USING ((company_id = get_user_company()));
CREATE POLICY "System can insert weather suitability" ON weather_suitability FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Users can view weather suitability for company boats" ON weather_suitability FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM boats
  WHERE ((boats.id = weather_suitability.boat_id) AND (boats.company_id = get_user_company())))));

-- End of consolidated schema

-- Notifications System
-- Track all notifications sent to customers and staff

CREATE TYPE notification_type AS ENUM (
  'booking_confirmation',
  'booking_reminder',
  'booking_cancelled',
  'booking_rescheduled',
  'payment_received',
  'payment_reminder',
  'low_availability_alert',
  'agent_assignment'
);

CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'in_app'
);

CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'delivered',
  'bounced'
);

-- Notification Log Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Notification details
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',

  -- Recipient
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- If recipient is a user

  -- Related entities
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Content
  subject TEXT,
  message TEXT NOT NULL,
  template_id TEXT, -- Email template identifier

  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  external_id TEXT, -- ID from email/SMS provider

  -- Metadata
  metadata JSONB, -- Additional data like click tracking, open tracking, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Preferences Table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Email preferences
  email_booking_confirmations BOOLEAN DEFAULT true,
  email_booking_reminders BOOLEAN DEFAULT true,
  email_booking_changes BOOLEAN DEFAULT true,
  email_payment_notifications BOOLEAN DEFAULT true,
  email_agent_notifications BOOLEAN DEFAULT true,
  email_low_availability BOOLEAN DEFAULT true,

  -- SMS preferences
  sms_booking_confirmations BOOLEAN DEFAULT false,
  sms_booking_reminders BOOLEAN DEFAULT false,
  sms_urgent_only BOOLEAN DEFAULT true,

  -- Reminder timing
  reminder_hours_before INTEGER DEFAULT 24, -- Hours before booking to send reminder

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Customer notification preferences (for non-users)
CREATE TABLE customer_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Customer identification
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id, customer_email)
);

-- Scheduled Notifications (for reminders, etc.)
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,

  -- Recipient
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate scheduled notifications
  UNIQUE(booking_id, notification_type, channel)
);

-- Indexes
CREATE INDEX idx_notifications_company ON notifications(company_id);
CREATE INDEX idx_notifications_booking ON notifications(booking_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for) WHERE NOT sent;
CREATE INDEX idx_scheduled_notifications_booking ON scheduled_notifications(booking_id);

-- Triggers
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_notification_preferences_updated_at
  BEFORE UPDATE ON customer_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, company_id)
  VALUES (NEW.id, NEW.company_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to schedule booking reminder
CREATE OR REPLACE FUNCTION schedule_booking_reminder()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_booking_reminder_trigger
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION schedule_booking_reminder();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON customer_notification_preferences TO authenticated;
GRANT SELECT ON scheduled_notifications TO authenticated;

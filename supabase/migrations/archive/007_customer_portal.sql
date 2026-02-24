-- Customer Portal Migration
-- This migration creates tables and functions for customer self-service portal

-- Create customer portal access tokens table
CREATE TABLE IF NOT EXISTS customer_portal_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Create index for faster token lookups
CREATE INDEX idx_customer_portal_tokens_token ON customer_portal_tokens(token);
CREATE INDEX idx_customer_portal_tokens_booking ON customer_portal_tokens(booking_id);
CREATE INDEX idx_customer_portal_tokens_company ON customer_portal_tokens(company_id);

-- Create change request types
CREATE TYPE change_request_type AS ENUM (
  'date_change',
  'time_change',
  'package_change',
  'participant_count',
  'cancellation',
  'other'
);

CREATE TYPE change_request_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'completed'
);

-- Create customer change requests table
CREATE TABLE IF NOT EXISTS customer_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  request_type change_request_type NOT NULL,
  current_value TEXT,
  requested_value TEXT,
  customer_message TEXT,
  admin_response TEXT,
  status change_request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ
);

-- Create index for change requests
CREATE INDEX idx_change_requests_booking ON customer_change_requests(booking_id);
CREATE INDEX idx_change_requests_company ON customer_change_requests(company_id);
CREATE INDEX idx_change_requests_status ON customer_change_requests(status);

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_portal_token()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to create or refresh portal token
CREATE OR REPLACE FUNCTION create_portal_token(
  p_booking_id UUID,
  p_customer_email TEXT,
  p_customer_name TEXT
)
RETURNS TABLE(token TEXT, expires_at TIMESTAMPTZ) AS $$
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
  FROM customer_portal_tokens pt
  WHERE pt.booking_id = p_booking_id
    AND pt.is_active = true
    AND pt.expires_at > NOW();

  -- If no active token, create new one
  IF v_token IS NULL THEN
    v_token := generate_portal_token();
    v_expires_at := NOW() + INTERVAL '30 days';

    INSERT INTO customer_portal_tokens (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify portal token
CREATE OR REPLACE FUNCTION verify_portal_token(p_token TEXT)
RETURNS TABLE(
  booking_id UUID,
  company_id UUID,
  customer_email TEXT,
  customer_name TEXT
) AS $$
BEGIN
  -- Update last accessed timestamp
  UPDATE customer_portal_tokens
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
  FROM customer_portal_tokens pt
  WHERE pt.token = p_token
    AND pt.is_active = true
    AND pt.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update change request timestamp
CREATE OR REPLACE FUNCTION update_change_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for change request updates
CREATE TRIGGER update_change_request_timestamp_trigger
  BEFORE UPDATE ON customer_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_change_request_timestamp();

-- RLS Policies for customer_portal_tokens
ALTER TABLE customer_portal_tokens ENABLE ROW LEVEL SECURITY;

-- Allow company users to view and create portal tokens for their bookings
CREATE POLICY customer_portal_tokens_company_policy ON customer_portal_tokens
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for customer_change_requests
ALTER TABLE customer_change_requests ENABLE ROW LEVEL SECURITY;

-- Allow company users to view and manage change requests
CREATE POLICY change_requests_company_policy ON customer_change_requests
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON customer_portal_tokens TO authenticated;
GRANT ALL ON customer_change_requests TO authenticated;
GRANT EXECUTE ON FUNCTION generate_portal_token() TO authenticated;
GRANT EXECUTE ON FUNCTION create_portal_token(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_portal_token(TEXT) TO authenticated, anon;

-- Comments for documentation
COMMENT ON TABLE customer_portal_tokens IS 'Secure tokens for customer self-service portal access';
COMMENT ON TABLE customer_change_requests IS 'Customer requests for booking modifications';
COMMENT ON FUNCTION create_portal_token IS 'Generates or retrieves existing portal token for a booking';
COMMENT ON FUNCTION verify_portal_token IS 'Validates portal token and returns booking details';

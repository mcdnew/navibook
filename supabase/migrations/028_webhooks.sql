-- Migration 028: Webhook support for external API keys

-- 1. Add webhook fields to api_keys
ALTER TABLE api_keys
  ADD COLUMN webhook_url TEXT,
  ADD COLUMN webhook_secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex');

-- 2. Track which API key created a booking (nullable — internal bookings have no key)
ALTER TABLE bookings
  ADD COLUMN api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL;

CREATE INDEX idx_bookings_api_key_id ON bookings (api_key_id) WHERE api_key_id IS NOT NULL;

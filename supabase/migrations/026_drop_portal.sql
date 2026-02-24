-- Migration 026: Drop customer portal tables, functions, and enums
-- The customer-facing portal feature has been removed from scope.

-- Drop trigger first
DROP TRIGGER IF EXISTS update_change_request_timestamp_trigger ON customer_change_requests;

-- Drop functions
DROP FUNCTION IF EXISTS create_portal_token(uuid, text, text);
DROP FUNCTION IF EXISTS verify_portal_token(text);
DROP FUNCTION IF EXISTS update_change_request_timestamp();

-- Drop tables (CASCADE drops indexes, constraints, and RLS policies)
DROP TABLE IF EXISTS customer_portal_tokens CASCADE;
DROP TABLE IF EXISTS customer_change_requests CASCADE;

-- Drop enums
DROP TYPE IF EXISTS change_request_type;
DROP TYPE IF EXISTS change_request_status;

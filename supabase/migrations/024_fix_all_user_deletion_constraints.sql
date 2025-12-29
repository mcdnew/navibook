-- Comprehensive fix for user deletion constraints
-- Fix ALL foreign keys referencing users table that prevent deletion

-- ============================================================================
-- 1. Fix blocked_slots.created_by constraint
-- ============================================================================

-- Check current constraint name and drop it
DO $$
BEGIN
  -- Try the standard constraint name first
  ALTER TABLE blocked_slots DROP CONSTRAINT IF EXISTS blocked_slots_created_by_fkey;

  -- Also try with different naming conventions in case the previous migration worked
  ALTER TABLE blocked_slots DROP CONSTRAINT IF EXISTS fk_blocked_slots_created_by;

  EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Add constraint with ON DELETE SET NULL
ALTER TABLE blocked_slots
ADD CONSTRAINT blocked_slots_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. Fix customer_change_requests.processed_by constraint
-- ============================================================================

DO $$
BEGIN
  -- Drop the old constraint without delete action
  ALTER TABLE customer_change_requests DROP CONSTRAINT IF EXISTS customer_change_requests_processed_by_fkey;

  -- Also try alternate naming
  ALTER TABLE customer_change_requests DROP CONSTRAINT IF EXISTS fk_customer_change_requests_processed_by;

  EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Add constraint with ON DELETE SET NULL
ALTER TABLE customer_change_requests
ADD CONSTRAINT customer_change_requests_processed_by_fkey
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. Verify all user-related foreign keys are properly configured
-- ============================================================================

-- This is a verification step - these should all work now:
-- SELECT constraint_name, table_name, column_name
-- FROM information_schema.key_column_usage
-- WHERE table_name IN ('blocked_slots', 'customer_change_requests', 'booking_history_logs')
-- AND column_name IN ('created_by', 'processed_by');

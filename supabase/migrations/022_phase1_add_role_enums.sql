-- Phase 1A: Add new role enum values
-- Date: 2025-12-29
-- Purpose: Create the new enum values for role consolidation
--
-- New roles:
-- 1. sales_agent (replaces power_agent + regular_agent)
-- 2. operations_manager (replaces manager)
-- 3. accounting_manager (replaces accountant)

-- ============================================================================
-- ADD NEW ROLES TO USER_ROLE ENUM
-- ============================================================================

-- Add sales_agent role
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'sales_agent';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Add operations_manager role
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'operations_manager';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Add accounting_manager role
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'accounting_manager';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

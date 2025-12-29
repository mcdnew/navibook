-- Phase 1B Role Consolidation: Migrate User Data
-- Date: 2025-12-29
-- Purpose: Migrate users to new consolidated roles
--
-- NOTE: Must run AFTER 022_phase1_add_role_enums.sql which creates the enum values
--
-- Changes:
-- 1. Merge power_agent + regular_agent → sales_agent
-- 2. Rename manager → operations_manager
-- 3. Rename accountant → accounting_manager

-- ============================================================================
-- MIGRATE EXISTING USER DATA TO NEW ROLES
-- ============================================================================

-- Migrate power_agent and regular_agent → sales_agent
UPDATE users
SET role = 'sales_agent'
WHERE role IN ('power_agent', 'regular_agent');

-- Migrate manager → operations_manager
UPDATE users
SET role = 'operations_manager'
WHERE role = 'manager';

-- Migrate accountant → accounting_manager
UPDATE users
SET role = 'accounting_manager'
WHERE role = 'accountant';

-- ============================================================================
-- 2. UPDATE RLS POLICIES TO REFERENCE NEW ROLES
-- ============================================================================

-- Drop old policies that reference old role names
DROP POLICY IF EXISTS "Agents can only create commercial bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own company bookings" ON bookings;

-- Create updated RLS policy for booking creation restrictions
-- Sales agents cannot create non-commercial bookings
CREATE POLICY "Sales agents restricted to commercial bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) NOT IN ('sales_agent')
    OR booking_category = 'commercial'
  );

-- Allow all authenticated users to view bookings they should have access to
-- (already handled by company_id isolation)
CREATE POLICY "Users can view company bookings"
  ON bookings
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 3. UPDATE PAYMENT PERMISSIONS (accounting_manager replaces accountant)
-- ============================================================================

-- Drop old payment transaction policies referencing accountant
DROP POLICY IF EXISTS "Admins and accountants can manage payment transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Admins and accountants can select payment transactions" ON payment_transactions;

-- Create updated policies for accounting_manager
CREATE POLICY "Admins and accounting managers can manage payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'accounting_manager', 'operations_manager', 'office_staff')
    AND company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins and accounting managers can select payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'accounting_manager', 'operations_manager', 'office_staff')
    AND company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Admins and accounting managers can update payment transactions"
  ON payment_transactions
  FOR UPDATE
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'accounting_manager', 'operations_manager', 'office_staff')
    AND company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ============================================================================
-- 4. VERIFICATION QUERY (for testing)
-- ============================================================================

-- Count users by new role (for verification)
-- SELECT role, COUNT(*) as user_count FROM users GROUP BY role ORDER BY role;

-- ============================================================================
-- NOTES
-- ============================================================================
-- - Old role values (power_agent, regular_agent, manager, accountant) are
--   NOT REMOVED from the enum to maintain backward compatibility with any
--   cached values or references that might not be immediately updated
-- - The enum itself can be cleaned up in a future major version
-- - All users have been migrated to new role values
-- - API code and UI should be updated to reference new role names
-- - TypeScript role constants should be updated in agents-client.tsx

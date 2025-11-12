-- Fix RLS policies for blocked_slots to use correct role names
-- The application uses 'admin', 'manager', 'power_agent' but policies were checking for 'company_admin'

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and power agents can insert blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can update blocked slots" ON blocked_slots;
DROP POLICY IF EXISTS "Admins and power agents can delete blocked slots" ON blocked_slots;

-- Recreate policies with correct role names
CREATE POLICY "Admins and power agents can insert blocked slots"
  ON blocked_slots FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'power_agent')
    )
  );

CREATE POLICY "Admins and power agents can update blocked slots"
  ON blocked_slots FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'power_agent')
    )
  );

CREATE POLICY "Admins and power agents can delete blocked slots"
  ON blocked_slots FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'power_agent')
    )
  );

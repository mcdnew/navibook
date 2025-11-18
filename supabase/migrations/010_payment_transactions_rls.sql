-- =====================================================
-- PAYMENT TRANSACTIONS RLS POLICIES
-- =====================================================
-- Fix for BUG-021: Payment transactions not visible due to missing RLS policies
-- Payments were being recorded but not displayed because RLS blocked reads

-- Enable RLS on payment_transactions table
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT POLICIES
-- =====================================================

-- Users can view payment transactions for bookings they can access
-- - Admin/Office/Manager/Accountant can see all transactions in their company
-- - Agents can see transactions for their own bookings
CREATE POLICY "View payment transactions based on role"
  ON payment_transactions FOR SELECT
  USING (
    -- Must be in same company
    company_id = get_user_company()
    AND (
      -- Admin/Office/Manager/Accountant can see all company transactions
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'office_staff', 'manager', 'accountant')
      )
      OR
      -- Agents can see transactions for their bookings
      EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.id = payment_transactions.booking_id
        AND bookings.agent_id = auth.uid()
      )
      OR
      -- Captains can see transactions for their bookings
      EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.id = payment_transactions.booking_id
        AND bookings.captain_id = auth.uid()
      )
    )
  );

-- =====================================================
-- INSERT POLICIES
-- =====================================================

-- Only authorized roles can record payments
CREATE POLICY "Authorized roles can record payments"
  ON payment_transactions FOR INSERT
  WITH CHECK (
    company_id = get_user_company()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'office_staff', 'manager', 'accountant')
    )
  );

-- =====================================================
-- UPDATE POLICIES
-- =====================================================

-- Only authorized roles can update payment transactions
CREATE POLICY "Authorized roles can update payments"
  ON payment_transactions FOR UPDATE
  USING (
    company_id = get_user_company()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'office_staff', 'manager', 'accountant')
    )
  );

-- =====================================================
-- DELETE POLICIES
-- =====================================================

-- Only admin and accountant can delete payment transactions
CREATE POLICY "Only admin and accountant can delete payments"
  ON payment_transactions FOR DELETE
  USING (
    company_id = get_user_company()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'accountant')
    )
  );

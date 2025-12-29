-- Add RLS policies to payment_transactions table
-- Ensure multi-tenant data isolation for payment records

-- Enable RLS on payment_transactions table
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view payment transactions for bookings in their company
CREATE POLICY "Users can view own company payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy 2: Admins/accountants can insert and update payment transactions
CREATE POLICY "Admins and accountants can manage payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.company_id = payment_transactions.company_id
      AND u.role IN ('admin', 'manager', 'accountant')
    )
  );

-- Policy 3: Update transactions (admins only)
CREATE POLICY "Admins can update payment transactions"
  ON payment_transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.company_id = payment_transactions.company_id
      AND u.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.company_id = payment_transactions.company_id
      AND u.role IN ('admin', 'manager')
    )
  );

-- Policy 4: Users can view their own agent commission payments
CREATE POLICY "Agents can view their own commission payments"
  ON payment_transactions
  FOR SELECT
  USING (
    -- Agent can see payments for their own bookings
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = payment_transactions.booking_id
      AND b.agent_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE payment_transactions IS 'Stores payment transaction records with multi-tenant RLS protection';
COMMENT ON POLICY "Users can view own company payment transactions" ON payment_transactions
  IS 'All users in a company can view payment transactions for their company';
COMMENT ON POLICY "Admins and accountants can manage payment transactions" ON payment_transactions
  IS 'Only admins and accountants can create/insert payment transactions';
COMMENT ON POLICY "Admins can update payment transactions" ON payment_transactions
  IS 'Only managers and admins can update payment transaction records';
COMMENT ON POLICY "Agents can view their own commission payments" ON payment_transactions
  IS 'Agents can view payment transactions for bookings they are assigned to';

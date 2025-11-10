-- Payment Transactions Table
-- Track individual payment records for bookings

CREATE TYPE payment_method AS ENUM (
  'cash',
  'card',
  'bank_transfer',
  'paypal',
  'stripe',
  'other'
);

CREATE TYPE payment_type AS ENUM (
  'deposit',
  'final_payment',
  'full_payment',
  'refund',
  'partial_refund'
);

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  payment_type payment_type NOT NULL,
  payment_method payment_method NOT NULL,

  -- Transaction info
  transaction_reference TEXT, -- Card transaction ID, bank transfer ref, etc.
  notes TEXT,

  -- Who recorded this payment
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure positive amounts for payments, negative for refunds
  CONSTRAINT positive_amount CHECK (
    (payment_type IN ('deposit', 'final_payment', 'full_payment') AND amount > 0) OR
    (payment_type IN ('refund', 'partial_refund') AND amount < 0)
  )
);

-- Indexes
CREATE INDEX idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_company ON payment_transactions(company_id);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(payment_date);
CREATE INDEX idx_payment_transactions_type ON payment_transactions(payment_type);

-- Updated_at trigger
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate total paid for a booking
CREATE OR REPLACE FUNCTION get_total_paid(booking_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM payment_transactions
  WHERE booking_id = booking_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to calculate outstanding balance for a booking
CREATE OR REPLACE FUNCTION get_outstanding_balance(booking_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
  SELECT b.total_price - COALESCE(SUM(pt.amount), 0)
  FROM bookings b
  LEFT JOIN payment_transactions pt ON pt.booking_id = b.id
  WHERE b.id = booking_uuid
  GROUP BY b.total_price;
$$ LANGUAGE SQL STABLE;

-- View for easy payment status queries
CREATE VIEW booking_payment_status AS
SELECT
  b.id as booking_id,
  b.company_id,
  b.booking_date,
  b.customer_name,
  b.customer_email,
  b.total_price,
  COALESCE(SUM(pt.amount), 0) as total_paid,
  b.total_price - COALESCE(SUM(pt.amount), 0) as outstanding_balance,
  CASE
    WHEN COALESCE(SUM(pt.amount), 0) >= b.total_price THEN 'paid'
    WHEN COALESCE(SUM(pt.amount), 0) > 0 THEN 'partial'
    ELSE 'unpaid'
  END as payment_status
FROM bookings b
LEFT JOIN payment_transactions pt ON pt.booking_id = b.id
WHERE b.status NOT IN ('cancelled', 'no_show')
GROUP BY b.id, b.company_id, b.booking_date, b.customer_name, b.customer_email, b.total_price;

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON payment_transactions TO authenticated;
GRANT SELECT ON booking_payment_status TO authenticated;

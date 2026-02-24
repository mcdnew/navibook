-- Customer Notes Table
-- Stores per-company notes and preferences for customers (identified by email)

CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  notes TEXT,
  preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (company_id, customer_email)
);

-- RLS policies
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's customer notes"
  ON customer_notes FOR SELECT
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert customer notes for their company"
  ON customer_notes FOR INSERT
  WITH CHECK (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their company's customer notes"
  ON customer_notes FOR UPDATE
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

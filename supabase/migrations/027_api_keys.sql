-- Migration 027: API Keys for external partner integration

CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID        NOT NULL DEFAULT uuid_generate_v4(),
  company_id    UUID        NOT NULL,
  name          TEXT        NOT NULL,
  key_hash      TEXT        NOT NULL,
  key_prefix    TEXT        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at  TIMESTAMPTZ
);

ALTER TABLE api_keys ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);
ALTER TABLE api_keys ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);
ALTER TABLE api_keys ADD CONSTRAINT api_keys_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX idx_api_keys_company  ON api_keys (company_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys (key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage their own api_keys"
  ON api_keys FOR ALL
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
        AND role IN ('admin', 'operations_manager')
    )
  );

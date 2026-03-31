-- Migration 029: Fleet Module
-- Merges NaviFleet tables into NaviBook as an activatable module.
-- All fleet tables are company-scoped via company_id RLS (same pattern as existing NaviBook tables).
-- Feature flag: companies.fleet_module_enabled = false by default — existing companies unaffected.

-- ============================================================
-- FEATURE FLAG
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS fleet_module_enabled BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- ENUM EXTENSIONS
-- ============================================================

-- NaviFleet supports catamaran and yacht in addition to NaviBook's sailboat/motorboat/jetski
ALTER TYPE boat_type ADD VALUE IF NOT EXISTS 'catamaran';
ALTER TYPE boat_type ADD VALUE IF NOT EXISTS 'yacht';

-- ============================================================
-- EXTEND BOATS TABLE WITH FLEET-SPECIFIC FIELDS
-- ============================================================

ALTER TABLE boats
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2),
  ADD COLUMN IF NOT EXISTS length_meters DECIMAL(5,2) CHECK (length_meters > 0),
  ADD COLUMN IF NOT EXISTS home_port TEXT,
  ADD COLUMN IF NOT EXISTS current_value DECIMAL(12,2) CHECK (current_value >= 0),
  ADD COLUMN IF NOT EXISTS purchase_date DATE,
  ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
  ADD COLUMN IF NOT EXISTS serial_number TEXT,
  ADD COLUMN IF NOT EXISTS mmsi TEXT,
  ADD COLUMN IF NOT EXISTS current_engine_hours DECIMAL(10,1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engine_hours_alert_threshold DECIMAL(10,1),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR';

-- ============================================================
-- EXTEND BLOCKED_SLOTS WITH SOURCE TRACKING
-- ============================================================

-- Allows maintenance records to claim ownership of the blocked slot for cleanup on cancel/complete
ALTER TABLE blocked_slots ADD COLUMN IF NOT EXISTS source_id UUID;

-- ============================================================
-- FUEL LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS fuel_logs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id               UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  created_by_user_id    UUID NOT NULL REFERENCES auth.users(id),
  liters                DECIMAL(10,2) NOT NULL CHECK (liters > 0),
  total_cost            DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
  engine_hours_at_entry DECIMAL(10,1),
  log_date              DATE NOT NULL,
  notes                 TEXT,
  receipt_url           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_company ON fuel_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_boat ON fuel_logs(boat_id, log_date DESC);

ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fuel_logs_company_isolation" ON fuel_logs
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Trigger: update boats.current_engine_hours when a fuel log is inserted with engine_hours_at_entry
CREATE OR REPLACE FUNCTION update_boat_engine_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.engine_hours_at_entry IS NOT NULL THEN
    UPDATE boats
    SET current_engine_hours = GREATEST(current_engine_hours, NEW.engine_hours_at_entry),
        updated_at = NOW()
    WHERE id = NEW.boat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_engine_hours ON fuel_logs;
CREATE TRIGGER trg_update_engine_hours
  AFTER INSERT ON fuel_logs
  FOR EACH ROW EXECUTE FUNCTION update_boat_engine_hours();

-- ============================================================
-- MAINTENANCE LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id                UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id                   UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  created_by_user_id        UUID NOT NULL REFERENCES auth.users(id),
  proposed_by_user_id       UUID REFERENCES auth.users(id),
  assigned_to_user_id       UUID REFERENCES auth.users(id),
  title                     TEXT NOT NULL,
  description               TEXT,
  type                      TEXT NOT NULL CHECK (type IN ('routine', 'repair', 'upgrade', 'inspection', 'winterization')),
  category                  TEXT CHECK (category IN ('engine', 'electrical', 'plumbing', 'hull', 'sails', 'rigging', 'safety_equipment', 'navigation_equipment', 'interior', 'exterior', 'other')),
  maintenance_type          TEXT CHECK (maintenance_type IN ('preventative', 'corrective')),
  priority                  TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status                    TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'pending_approval', 'approved_to_start', 'scheduled', 'in_progress', 'pending_cost_approval', 'completed', 'rejected', 'cancelled')),
  scheduled_date            DATE,
  estimated_end_date        DATE,
  completed_date            DATE,
  estimated_cost            DECIMAL(10,2) CHECK (estimated_cost >= 0),
  actual_cost               DECIMAL(10,2) CHECK (actual_cost >= 0),
  parts_cost                DECIMAL(10,2),
  labor_cost                DECIMAL(10,2),
  vendor_name               TEXT,
  vendor_contact            TEXT,
  engine_hours_at_service   DECIMAL(10,1),
  next_service_date         DATE,
  notes                     TEXT,
  completion_notes          TEXT,
  before_photos             TEXT[] DEFAULT '{}',
  after_photos              TEXT[] DEFAULT '{}',
  approved_at               TIMESTAMPTZ,
  work_approved_at          TIMESTAMPTZ,
  cost_approved_at          TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_company ON maintenance_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_boat ON maintenance_logs(boat_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_logs(company_id, status);

ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_logs_company_isolation" ON maintenance_logs
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Trigger: create/update/remove blocked_slot when maintenance is scheduled/cancelled/completed
CREATE OR REPLACE FUNCTION sync_maintenance_blocked_slot()
RETURNS TRIGGER AS $$
DECLARE
  v_end_date DATE;
BEGIN
  -- On INSERT or UPDATE: upsert a blocked slot when scheduled_date is set and status is active
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Remove any existing blocked slot for this maintenance record
    DELETE FROM blocked_slots WHERE source_id = NEW.id AND block_type = 'maintenance';

    -- Create a blocked slot if maintenance is active (not cancelled/completed/rejected)
    IF NEW.scheduled_date IS NOT NULL
       AND NEW.status NOT IN ('cancelled', 'completed', 'rejected') THEN
      v_end_date := COALESCE(NEW.estimated_end_date, NEW.scheduled_date);
      INSERT INTO blocked_slots (
        company_id, boat_id, blocked_date, start_date, end_date,
        start_time, end_time, reason, block_type, source_id, created_by
      ) VALUES (
        NEW.company_id, NEW.boat_id, NEW.scheduled_date, NEW.scheduled_date, v_end_date,
        '00:00:00', '23:59:59', COALESCE(NEW.title, 'Maintenance'), 'maintenance', NEW.id, NEW.created_by_user_id
      );
    END IF;
  END IF;

  -- On DELETE: clean up the blocked slot
  IF TG_OP = 'DELETE' THEN
    DELETE FROM blocked_slots WHERE source_id = OLD.id AND block_type = 'maintenance';
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_maintenance_blocked_slot ON maintenance_logs;
CREATE TRIGGER trg_sync_maintenance_blocked_slot
  AFTER INSERT OR UPDATE OR DELETE ON maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION sync_maintenance_blocked_slot();

-- ============================================================
-- MAINTENANCE APPROVALS
-- ============================================================

CREATE TABLE IF NOT EXISTS maintenance_approvals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_id  UUID NOT NULL REFERENCES maintenance_logs(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id         UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  approval_stage  TEXT NOT NULL CHECK (approval_stage IN ('work_proposal', 'cost_approval')),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved        BOOLEAN NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (maintenance_id, approval_stage, user_id)
);

ALTER TABLE maintenance_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_approvals_company_isolation" ON maintenance_approvals
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ============================================================
-- FLEET EXPENSES
-- ============================================================

CREATE TABLE IF NOT EXISTS fleet_expenses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id               UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  created_by_user_id    UUID NOT NULL REFERENCES auth.users(id),
  proposed_by_user_id   UUID REFERENCES auth.users(id),
  maintenance_id        UUID REFERENCES maintenance_logs(id) ON DELETE SET NULL,
  amount                DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category              TEXT NOT NULL CHECK (category IN ('fuel', 'maintenance', 'insurance', 'mooring', 'equipment', 'supplies', 'other')),
  description           TEXT NOT NULL,
  expense_date          DATE NOT NULL,
  receipt_url           TEXT,
  status                TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  approved_by           UUID REFERENCES auth.users(id),
  approved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fleet_expenses_company ON fleet_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_fleet_expenses_boat ON fleet_expenses(boat_id, expense_date DESC);

ALTER TABLE fleet_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fleet_expenses_company_isolation" ON fleet_expenses
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ============================================================
-- FLEET EXPENSE APPROVALS
-- ============================================================

CREATE TABLE IF NOT EXISTS fleet_expense_approvals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id  UUID NOT NULL REFERENCES fleet_expenses(id) ON DELETE CASCADE,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id     UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved    BOOLEAN NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (expense_id, user_id)
);

ALTER TABLE fleet_expense_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fleet_expense_approvals_company_isolation" ON fleet_expense_approvals
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ============================================================
-- SAFETY EQUIPMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS safety_equipment (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id             UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  added_by_user_id    UUID NOT NULL REFERENCES auth.users(id),
  name                TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN (
    'flare', 'smoke_signal', 'liferaft', 'epirb', 'fire_extinguisher',
    'medical_kit', 'life_jacket', 'harness', 'other'
  )),
  quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  expiry_date         DATE,
  last_checked        DATE,
  next_service        DATE,
  serial_number       TEXT,
  notes               TEXT,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_equipment_company ON safety_equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_safety_equipment_boat ON safety_equipment(boat_id, status);
CREATE INDEX IF NOT EXISTS idx_safety_equipment_expiry ON safety_equipment(expiry_date) WHERE expiry_date IS NOT NULL;

ALTER TABLE safety_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "safety_equipment_company_isolation" ON safety_equipment
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ============================================================
-- FLEET DOCUMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS fleet_documents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id             UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  name                TEXT NOT NULL,
  document_type       TEXT NOT NULL CHECK (document_type IN (
    'registration', 'insurance', 'safety_certificate', 'survey', 'license',
    'manual', 'invoice', 'other'
  )),
  file_url            TEXT NOT NULL,
  file_size_bytes     INTEGER,
  expiry_date         DATE,
  notes               TEXT,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fleet_documents_company ON fleet_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_fleet_documents_boat ON fleet_documents(boat_id, status);
CREATE INDEX IF NOT EXISTS idx_fleet_documents_expiry ON fleet_documents(expiry_date) WHERE expiry_date IS NOT NULL;

ALTER TABLE fleet_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fleet_documents_company_isolation" ON fleet_documents
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ============================================================
-- BOAT ACTIVITY LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS boat_activity_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  boat_id       UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name    TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  entity_label  TEXT,
  payload       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boat_activity_company ON boat_activity_log(company_id);
CREATE INDEX IF NOT EXISTS idx_boat_activity_boat ON boat_activity_log(boat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_boat_activity_entity ON boat_activity_log(entity_type, entity_id);

ALTER TABLE boat_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boat_activity_log_company_isolation" ON boat_activity_log
  USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

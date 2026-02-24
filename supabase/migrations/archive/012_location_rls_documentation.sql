-- Document and verify RLS policies for company location fields
-- The location fields (latitude, longitude, location_name) inherit protection from companies table RLS

-- ==========================================================
-- EXISTING RLS POLICIES (from 002_rls_policies.sql)
-- ==========================================================
-- These policies already protect the location fields:

-- POLICY 1: Users can view their company
-- Location: companies table, SELECT operation
-- Effect: All users in a company can READ latitude, longitude, location_name
-- SQL:
--   CREATE POLICY "Users can view their company"
--   ON companies FOR SELECT
--   USING (id = get_user_company());

-- POLICY 2: Admins can update their company
-- Location: companies table, UPDATE operation
-- Effect: ONLY ADMINS can MODIFY latitude, longitude, location_name
-- SQL:
--   CREATE POLICY "Admins can update their company"
--   ON companies FOR UPDATE
--   USING (id = get_user_company() AND get_user_role() = 'admin');

-- ==========================================================
-- ACCESS CONTROL MATRIX FOR LOCATION FIELDS
-- ==========================================================

-- User Role | View Location | Modify Location
-- --------  | ------------- | ---------------
-- Regular Agent | ✓ Yes | ✗ No
-- Power Agent   | ✓ Yes | ✗ No
-- Captain       | ✓ Yes | ✗ No
-- Office Staff  | ✓ Yes | ✗ No (office_staff role)
-- Manager       | ✓ Yes | ✗ No (manager role has different permissions)
-- Admin         | ✓ Yes | ✓ Yes
-- Accountant    | ✓ Yes | ✗ No

-- ==========================================================
-- SECURITY VERIFICATION
-- ==========================================================

-- The following are BLOCKED:
-- 1. Non-admin users attempting UPDATE on latitude/longitude/location_name
-- 2. Users from other companies viewing location data
-- 3. Users without authentication accessing company location

-- The following are ALLOWED:
-- 1. Authenticated admins can view and modify their company location
-- 2. All authenticated users can view their company location
-- 3. API endpoints /api/company/location respect these policies

-- ==========================================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================================

COMMENT ON COLUMN companies.latitude IS 'Decimal latitude for marine weather (-90 to 90). Protected by RLS: admins only can modify.';
COMMENT ON COLUMN companies.longitude IS 'Decimal longitude for marine weather (-180 to 180). Protected by RLS: admins only can modify.';
COMMENT ON COLUMN companies.location_name IS 'Display name for company location. Protected by RLS: admins only can modify.';

-- ============================================================================
-- MIGRATION VERIFICATION SCRIPT
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. CHECK IF NEW COLUMNS EXIST IN bookings TABLE
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN ('fuel_cost', 'package_addon_cost', 'booking_category', 'discount_percentage', 'is_bare_boat')
ORDER BY column_name;

-- 2. CHECK IF boat_fuel_config TABLE EXISTS
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('boat_fuel_config', 'company_package_config')
ORDER BY table_name;

-- 3. CHECK IF ENUM booking_category EXISTS
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'booking_category'
)
ORDER BY enumlabel;

-- 4. CHECK IF FUNCTIONS EXIST
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('calculate_fuel_cost', 'calculate_package_addon_cost', 'auto_calculate_booking_costs')
ORDER BY routine_name;

-- 5. CHECK IF TRIGGERS EXIST
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name LIKE '%calculate%booking%'
ORDER BY trigger_name;

-- 6. COUNT DATA IN NEW TABLES
SELECT 'boat_fuel_config' as table_name, COUNT(*) as row_count FROM boat_fuel_config
UNION ALL
SELECT 'company_package_config', COUNT(*) FROM company_package_config;

-- 7. SAMPLE BOOKING WITH NEW FIELDS
SELECT id, boat_id, booking_category, fuel_cost, package_addon_cost, discount_percentage, is_bare_boat
FROM bookings
LIMIT 5;

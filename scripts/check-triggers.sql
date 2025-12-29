-- ============================================================================
-- CHECK TRIGGER EXECUTION AND FUNCTION STATUS
-- Run this in Supabase SQL Editor to diagnose cost calculation issues
-- ============================================================================

-- 1. CHECK IF TRIGGER EXISTS
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name = 'trigger_auto_calculate_booking_costs'
ORDER BY trigger_name;

-- 2. CHECK IF TRIGGER FUNCTION EXISTS
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'auto_calculate_booking_costs'
AND routine_type = 'FUNCTION';

-- 3. CHECK CALCULATE_FUEL_COST FUNCTION
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'calculate_fuel_cost'
AND routine_type = 'FUNCTION';

-- 4. CHECK CALCULATE_PACKAGE_ADDON_COST FUNCTION
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'calculate_package_addon_cost'
AND routine_type = 'FUNCTION';

-- 5. CHECK CHECK_BOOKING_CATEGORY_PERMISSION TRIGGER
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name = 'trigger_check_booking_category_permission'
ORDER BY trigger_name;

-- 6. TEST CALCULATE_FUEL_COST FUNCTION DIRECTLY
-- First, get a boat ID from boat_fuel_config
SELECT boat_id, fuel_consumption_rate, fuel_price_per_liter
FROM boat_fuel_config
LIMIT 1;

-- Then test the function (replace boat_id and duration as needed)
-- SELECT calculate_fuel_cost('d3a72c00-88a7-43f6-bbda-a0404e84f6e6'::UUID, '4h'::duration_type);

-- 7. CHECK BOOKINGS WITH FUEL CONFIG
SELECT b.id, b.boat_id, b.duration, b.fuel_cost, bfc.fuel_consumption_rate, bfc.fuel_price_per_liter
FROM bookings b
LEFT JOIN boat_fuel_config bfc ON b.boat_id = bfc.boat_id
WHERE bfc.boat_id IS NOT NULL
LIMIT 5;

-- 8. CHECK IF DURATION VALUES ARE CORRECT
SELECT DISTINCT duration
FROM bookings
WHERE duration IS NOT NULL
LIMIT 10;

-- 9. CHECK IF BOOKING HAS REQUIRED FIELDS FOR CALCULATION
SELECT id, boat_id, company_id, package_type, passengers, duration, booking_category
FROM bookings
WHERE boat_id IN (SELECT boat_id FROM boat_fuel_config)
LIMIT 5;

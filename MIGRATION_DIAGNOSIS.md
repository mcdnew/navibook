# Migration Verification & Diagnosis Report

**Date:** December 29, 2025
**Status:** ✅ Schema Applied, ⚠️ Trigger Not Calculating Costs

---

## Summary

The database migration was **successfully applied** to Supabase:
- ✅ All new tables created (`boat_fuel_config`, `company_package_config`)
- ✅ All new columns added to `bookings` table
- ❌ **BUT**: Auto-calculation triggers are NOT calculating fuel and add-on costs

---

## Verification Results

### Database Objects Created
```
✅ boat_fuel_config table (3 rows)
✅ company_package_config table (1 row)
✅ All 5 new columns in bookings table
✅ booking_category enum
✅ Triggers registered (but not executing properly)
```

### Current Issue
Sample booking from database:
```
ID: 75130639-3400-49b3-a437-3a314f0a2991
Fuel Cost: NOT SET (should be calculated)
Addon Cost: NOT SET (should be calculated)
Category: commercial (correct)
```

---

## Root Cause Analysis

The trigger function `auto_calculate_booking_costs()` likely has one of these issues:

### Issue 1: Duration Type Mismatch ⚠️ MOST LIKELY
The `calculate_fuel_cost()` function uses a hardcoded CASE statement:

```sql
v_duration_hours := CASE p_duration
  WHEN '2h' THEN 2
  WHEN '3h' THEN 3
  WHEN '4h' THEN 4
  WHEN '8h' THEN 8
  ELSE 0  -- <-- Returns 0 for any other duration!
END;
```

**Problem:** If bookings have different durations (custom times, half hours, etc.), the function returns 0, so fuel_cost = 0.

### Issue 2: Missing Function Context
The trigger might be failing silently if:
- The `calculate_package_addon_cost()` function can't find a matching `package_type`
- The `package_type` column is NULL in some bookings
- The `passengers` column is NULL or 0

### Issue 3: Permission/RLS Issues
The trigger might not have permission to update fuel_cost column due to RLS policies.

---

## How to Diagnose Further

Run these queries in **Supabase Dashboard → SQL Editor**:

### Query 1: Check Trigger Function Exists
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('auto_calculate_booking_costs', 'calculate_fuel_cost', 'calculate_package_addon_cost')
ORDER BY routine_name;
```

### Query 2: Check Trigger Exists
```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name = 'trigger_auto_calculate_booking_costs';
```

### Query 3: Check Duration Values in Bookings
```sql
SELECT DISTINCT duration, COUNT(*)
FROM bookings
WHERE duration IS NOT NULL
GROUP BY duration
ORDER BY duration;
```

### Query 4: Check Bookings with Fuel Configs
```sql
SELECT b.id, b.boat_id, b.duration, b.fuel_cost, bfc.fuel_consumption_rate
FROM bookings b
LEFT JOIN boat_fuel_config bfc ON b.boat_id = bfc.boat_id
WHERE bfc.boat_id IS NOT NULL
LIMIT 10;
```

### Query 5: Test Function Directly
```sql
-- Get a boat ID with fuel config
SELECT boat_id, fuel_consumption_rate FROM boat_fuel_config LIMIT 1;

-- Then test the function (replace boat_id)
SELECT calculate_fuel_cost('YOUR_BOAT_ID'::UUID, '4h'::duration_type);
```

---

## Recommended Solution

There are 2 approaches:

### Approach 1: Fix the Trigger Function (Database Level)
Update the `calculate_fuel_cost()` function to handle all duration types dynamically:

```sql
CREATE OR REPLACE FUNCTION calculate_fuel_cost(
  p_boat_id UUID,
  p_duration duration_type
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_fuel_config RECORD;
  v_duration_hours NUMERIC;
  v_fuel_cost DECIMAL(10,2);
BEGIN
  SELECT * INTO v_fuel_config
  FROM boat_fuel_config
  WHERE boat_id = p_boat_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Extract duration dynamically
  v_duration_hours := CASE p_duration
    WHEN '2h' THEN 2
    WHEN '3h' THEN 3
    WHEN '4h' THEN 4
    WHEN '8h' THEN 8
    ELSE CAST(SUBSTRING(p_duration, 1, POSITION('h' IN p_duration)-1) AS NUMERIC)
  END;

  v_fuel_cost := v_fuel_config.fuel_consumption_rate *
                 v_duration_hours *
                 v_fuel_config.fuel_price_per_liter;

  RETURN COALESCE(v_fuel_cost, 0);
END;
$$ LANGUAGE plpgsql STABLE;
```

### Approach 2: Calculate in Application Layer (Simpler) ✅ RECOMMENDED
Since the database structure is correct, manually calculate costs in the API when:
- Creating a new booking
- Updating a booking
- Viewing booking details

This approach:
- ✅ No need to modify database functions
- ✅ More flexible (can add complex logic)
- ✅ Easier to debug and test
- ✅ Works with existing data

**Implementation:** Update booking API endpoints to:
1. Fetch boat's `fuel_config`
2. Fetch company's `package_config`
3. Calculate: `fuel_cost = consumption_rate × duration_hours × price_per_liter`
4. Calculate: `addon_cost = per_person_cost × passengers` (based on package_type)
5. Save to `bookings.fuel_cost` and `bookings.package_addon_cost`

---

## Next Steps

1. **Run diagnostic queries** (above) in Supabase Dashboard to confirm the issue
2. **Choose approach** (fix trigger vs. application layer)
3. **Implement solution** (likely Approach 2 - application layer)
4. **Test** with new booking creation
5. **Verify** booking details show fuel and add-on costs

---

## Files Created for Diagnostics

- `scripts/check-migration.js` - Automated verification script
- `scripts/check-triggers.sql` - Manual SQL diagnostic queries
- `scripts/verify-migration.sql` - Comprehensive schema verification

---

**Next Action:** Run the SQL diagnostic queries in Supabase Dashboard to confirm which issue is occurring.

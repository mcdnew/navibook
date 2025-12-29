# End-to-End Testing: Fuel & Add-on Cost Tracking

**Status:** Ready for Testing
**Date:** December 29, 2025

## Overview

This document guides you through testing the fully implemented fuel and add-on cost tracking system end-to-end.

---

## Test Scenario Setup

### Prerequisites
1. ✅ Database migration applied to Supabase (verified earlier)
2. ✅ Application deployed/running locally
3. ✅ Admin/manager account available for testing
4. ✅ At least one boat with fuel configuration
5. ✅ Company package configuration (drinks/food costs)

---

## Test Steps

### Step 1: Verify Boat Fuel Configuration

**What to test:** Fuel config can be set for sailboats, motorboats, and jet skis

1. Navigate to `/fleet` (Fleet Management)
2. Look for a boat card (e.g., motorboat or sailboat)
3. Click the ⚙️ (settings) icon on the boat card
4. Verify fuel configuration dialog opens
5. For sailboat: Enter "Pondered consumption" (e.g., 1 L/h, representing 50% motor usage)
6. For motorboat/jetski: Enter direct consumption (e.g., 20 L/h)
7. Enter fuel price (e.g., €1.50/L)
8. Click "Save Configuration"
9. Verify status changes to "✓ Fuel Configured"

**Expected Result:** ✅ Fuel config saved for boat

---

### Step 2: Verify Company Package Configuration

**What to test:** Add-on costs can be configured

1. Navigate to `/company`
2. Look for "Add-on Pricing" card
3. Click "Configure"
4. Set:
   - Drinks cost per person: €5
   - Food cost per person: €10
5. Click "Save Configuration"
6. Verify success message

**Expected Result:** ✅ Company package config saved

---

### Step 3: Create a Test Booking with Cost Calculation

**What to test:** Costs are calculated when booking is created

1. Navigate to `/quick-book` (Quick Book Page)
2. Fill in booking details:
   - **Select boat:** A motorboat with fuel config (e.g., 20 L/h @ €1.50/L)
   - **Date:** Any future date
   - **Duration:** 4h (standard)
   - **Start time:** 10:00
   - **Passengers:** 4
   - **Package type:** "Full Package" (charter_full - includes drinks + food)
   - **Captain:** Select any captain
   - **Customer details:** Fill with test data
   - **Deposit:** Optional

3. Review pricing summary (should show total price)

4. Click "Confirm Booking"

**Expected Result:** ✅ Booking created with ID returned

---

### Step 4: Verify Costs Were Calculated and Saved

**Database Verification (Optional)**

In Supabase SQL Editor, run:
```sql
-- Find the test booking
SELECT
  id,
  customer_name,
  boat_id,
  duration,
  passengers,
  package_type,
  fuel_cost,
  package_addon_cost,
  total_price,
  captain_fee,
  sailor_fee
FROM bookings
WHERE customer_name = 'YOUR_TEST_CUSTOMER_NAME'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Results:**
- `fuel_cost`: 120 (20 L/h × 4 hours × €1.50 = €120) ✅
- `package_addon_cost`: 60 (€5 + €10 = €15 × 4 passengers = €60) ✅
- `total_price`: Should be revenue amount
- `captain_fee`: Amount based on selected captain
- `sailor_fee`: 0 if no sailors assigned

---

### Step 5: View Booking Details with Profitability Analysis

**What to test:** Fuel and add-on costs are displayed in booking details

1. Navigate to `/bookings` (Bookings List)
2. Find your test booking (should appear at top, most recent)
3. Click on booking to open details page

4. **Scroll to "Profitability Analysis" widget**

5. **Verify the display shows:**

   ```
   Revenue: €[total_price]

   Operating Costs:
   - Captain Fee: -€[captain_fee]
   - Sailor Fee: (if any) -€[sailor_fee]
   - Agent Commission: (if any) -€[amount]
   ✅ Fuel Cost: -€120
   ✅ Package Add-on Cost: -€60

   Net Profit: €[calculated]
   Margin: [calculated]%
   ```

6. **Verify calculation:**
   ```
   Net Profit = Revenue - (Captain + Sailor + Commission + Fuel + Addon)
   = [total_price] - (captain_fee + sailor_fee + commission + 120 + 60)
   ```

**Expected Result:** ✅ Costs display correctly in Profitability widget with correct colors:
- Orange for fuel cost
- Purple for add-on cost

---

### Step 6: Edit Booking and Verify Cost Recalculation

**What to test:** Costs recalculate when booking is edited

1. In the booking details page, click "Edit Booking" button
2. Change:
   - **Passengers:** from 4 to 6
   - **Package type:** Change if possible
3. Click "Save Changes"

4. Navigate back to booking details

5. **Verify:**
   - `package_addon_cost` recalculated: (€5 + €10) × 6 = €90 (was €60)
   - `fuel_cost` remains the same (boat/duration unchanged): €120
   - `Net Profit` recalculated with new addon cost

**Expected Result:** ✅ Costs updated correctly on edit

---

## Test Scenarios Summary

### Scenario A: Full Package Booking (4h, 4 passengers)
```
Boat: Motorboat (20 L/h @ €1.50/L)
Duration: 4h
Package: charter_full (drinks + food)
Passengers: 4

Calculations:
- Fuel Cost = 20 × 4 × 1.50 = €120
- Addon Cost = (5 + 10) × 4 = €60
- Total Costs = €120 + €60 + [captain/sailors/commission]
```

### Scenario B: Sailboat (2h, 2 passengers)
```
Boat: Sailboat (1 L/h pondered consumption @ €1.50/L)
Duration: 2h
Package: charter_only (no add-ons)
Passengers: 2

Calculations:
- Fuel Cost = 1 × 2 × 1.50 = €3
- Addon Cost = €0 (charter_only)
- Total Costs = €3 + [captain/sailors/commission]
```

### Scenario C: Charter with Drinks Only (8h, 1 passenger)
```
Boat: Jetski (5 L/h @ €1.50/L)
Duration: 8h
Package: charter_drinks
Passengers: 1

Calculations:
- Fuel Cost = 5 × 8 × 1.50 = €60
- Addon Cost = €5 × 1 = €5
- Total Costs = €60 + €5 + [captain/commission]
```

---

## Verification Checklist

- [ ] Boat fuel configs save and display correctly
- [ ] Company package configs save correctly
- [ ] New bookings calculate fuel costs on creation
- [ ] New bookings calculate addon costs on creation
- [ ] Booking details page displays:
  - [ ] Fuel Cost (orange) in Profitability widget
  - [ ] Package Add-on Cost (purple) in Profitability widget
  - [ ] Correct total operational costs
  - [ ] Correct net profit calculation
- [ ] Editing booking recalculates costs
- [ ] Costs update in database (SQL verification)
- [ ] Multiple scenarios work correctly
- [ ] Sailboat "pondered consumption" concept works
- [ ] Zero costs show correctly (charter_only, no fuel config)

---

## Troubleshooting

### Issue: Fuel cost shows €0 in booking details

**Causes:**
1. Boat doesn't have fuel configuration - Solution: Add fuel config for boat
2. Duration not recognized - Solution: Use standard durations (2h, 3h, 4h, 8h)
3. Boat fuel config was deleted - Solution: Reconfigure boat

**Check:**
```sql
SELECT boat_id, fuel_consumption_rate, fuel_price_per_liter
FROM boat_fuel_config
WHERE boat_id = '[booking.boat_id]';
```

### Issue: Add-on cost shows €0 when package is "charter_full"

**Causes:**
1. Company package config not set - Solution: Configure at `/company`
2. Drinks/food costs set to €0 - Solution: Set to positive amounts
3. Package type not saved correctly - Solution: Check booking.package_type in database

**Check:**
```sql
SELECT company_id, drinks_cost_per_person, food_cost_per_person
FROM company_package_config
WHERE company_id = '[booking.company_id]';
```

### Issue: Profitability widget not showing fuel/addon costs

**Causes:**
1. Costs not in database - Solution: Check SQL queries above
2. ProfitabilityWidget not receiving props - Solution: Restart application
3. Display logic error - Solution: Check browser console for errors

**Check:** F12 → Console tab for error messages

---

## Success Criteria

✅ **All tests pass when:**

1. Fuel costs calculated correctly for all boat types
2. Add-on costs calculated based on package type and passengers
3. Costs visible in Profitability Analysis widget
4. Costs update when booking is edited
5. Database stores all costs correctly
6. No console errors

---

## Sample Booking Creation Flow

```
1. Navigate to /quick-book
2. Select motorboat with fuel config (20 L/h, €1.50/L)
3. Select 4h duration, 4 passengers, Full Package
4. Click Confirm
5. Go to /bookings and click the new booking
6. Verify in Profitability widget:
   - Fuel Cost: -€120
   - Package Add-on Cost: -€60
7. Edit booking: change passengers to 6
8. Verify Add-on Cost updated to -€90
```

---

## Documentation References

- **Cost Calculator:** `lib/booking/cost-calculator.ts`
- **Quick Book Implementation:** `app/(mobile)/quick-book/page.tsx`
- **Booking Edit API:** `app/api/bookings/edit/route.ts`
- **Profitability Widget:** `app/(dashboard)/bookings/[id]/profitability-widget.tsx`
- **Booking Details Page:** `app/(dashboard)/bookings/[id]/page.tsx`

---

## Next Steps After Testing

If all tests pass:
1. ✅ Merge to main branch
2. ✅ Deploy to production
3. ✅ Monitor for any edge cases
4. ✅ Gather user feedback

If issues found:
1. ❌ Document issue with booking ID and steps to reproduce
2. ❌ Check error logs in browser console
3. ❌ Review SQL queries in database
4. ❌ Contact development team with details

---

**Testing Complete!** 🎉

When all tests pass, the fuel and add-on cost tracking system is fully operational and ready for production use.

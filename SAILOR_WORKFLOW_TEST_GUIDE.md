# Sailor Workflow - Test and Verification Guide

**Date:** December 27, 2025
**Status:** Testing Phase - Critical Fixes Applied

---

## Critical Fixes Applied (Session 2)

### Fix 1: Duration Hours Issue
**Problem:** `booking.duration_hours` was undefined because bookings only have `duration` field
**Solution:** Changed to parse duration string: `parseInt(booking.duration.replace('h', ''))`
**Impact:** SailorSelect component now receives correct duration value for fee calculation

### Fix 2: HasChanges Function
**Problem:** Save button disabled if only sailors changed without other field changes
**Solution:** Added sailor change detection to `hasChanges()` function
**Impact:** Sailors can now be saved without changing any other booking fields

### Fix 3: History Endpoint Created
**Problem:** POST /api/bookings/sailors/history endpoint was missing
**Solution:** Created new endpoint that logs sailor changes to booking_history
**Impact:** Sailor changes now appear in booking history timeline

---

## Complete Sailor Save Flow

### Step 1: Edit Booking Dialog Opens
```
User clicks Edit Booking → Dialog opens
↓
Dialog loads existing sailors from booking_sailors table
↓
selectedSailors state populated with current sailors
originalSailors state saved for comparison
```

### Step 2: User Selects Sailors
```
User adds/removes sailors via SailorSelect component
↓
SailorSelect calculates fee: hourly_rate × duration_hours
↓
selectedSailors state updated in real-time
hasChanges() detects change (added)
```

### Step 3: User Clicks Save
```
Save button enabled (because hasChanges = true)
↓
Form validation passes
↓
Main booking fields saved via POST /api/bookings/edit
↓
Sailors changed? (selectedSailors !== originalSailors)
  YES → POST /api/bookings/sailors (DELETE old + INSERT new)
         Database trigger automatically updates booking.sailor_fee
       → POST /api/bookings/sailors/history (LOG change)
  NO → Skip sailor operations
↓
router.refresh() called
↓
Page reloads with updated data
```

### Step 4: Verification Points

#### 4a. Sailors Saved to Database ✓
**Check:** POST /api/bookings/sailors endpoint
- [x] Validates user has permission
- [x] Verifies booking exists
- [x] Deletes old sailors
- [x] Inserts new sailors with correct structure:
  ```json
  {
    "booking_id": "uuid",
    "sailor_id": "uuid",
    "hourly_rate": 25.00,
    "fee": 100.00  // hourly_rate × duration
  }
  ```
- [x] Returns success response

#### 4b. Sailor Fee Calculated ✓
**Check:** Database trigger update_booking_sailor_fee
- [x] Trigger fires AFTER INSERT/UPDATE/DELETE on booking_sailors
- [x] Calls calculate_booking_sailor_fee(booking_id)
- [x] Updates bookings.sailor_fee with SUM(booking_sailors.fee)
- [x] Example: 2 sailors with fees €100 + €75 = bookings.sailor_fee = €175

#### 4c. History Logged ✓
**Check:** POST /api/bookings/sailors/history endpoint
- [x] Validates user has permission
- [x] Creates booking_history entry with:
  - [x] action: 'updated'
  - [x] old_data: { sailors: [sailor_ids], sailor_count: 2 }
  - [x] new_data: { sailors: [sailor_ids], sailor_count: 3 }
  - [x] notes: "Changed Sailors (2 → 3)"
- [x] User and timestamp recorded

#### 4d. Sailors Display in Details ✓
**Check:** /bookings/[id] page
- [x] Queries booking_sailors table with sailor info
- [x] Shows Sailors card if sailors.length > 0
- [x] Displays:
  - [x] Sailor name
  - [x] Sailor email
  - [x] Hourly rate (€25/hour)
  - [x] Fee (€100)

#### 4e. Sailor Fee Shows in Commission ✓
**Check:** Commission card on /bookings/[id]
- [x] Shows "Sailor Fee" line item if sailor_fee > 0
- [x] Displays formatted currency (€175.50)
- [x] Purple color for sailor costs

#### 4f. History Shows Sailor Changes ✓
**Check:** Booking History Timeline
- [x] Shows "Changed Sailors" entry
- [x] Displays sailor count change: "(2 → 3)"
- [x] Shows user who made change
- [x] Shows timestamp

---

## Step-by-Step Test Procedure

### Test 1: Create a Sailor
**Prerequisites:** Admin/Manager logged in

1. Go to `/agents`
2. Click "Add Agent"
3. Fill in:
   - First Name: "Test Sailor"
   - Last Name: "Personnel"
   - Email: "sailor@test.com"
   - Role: **"Sailor"** (check dropdown has this option)
   - Hourly Rate: **25** (check this field appears for Sailor role)
   - Is Active: Checked
4. Click "Create Agent"
5. **Verify:** Sailor appears in agents list with "Sailor" role

### Test 2: Create a Booking
**Prerequisites:** Sailor created, boat available

1. Go to `/quick-book`
2. Select boat, date, time (e.g., 4-hour duration)
3. Enter customer details
4. **Verify:** SailorSelect component shows available sailors
5. Add the Test Sailor
6. **Verify:** Fee calculated as €100.00 (25/h × 4h)
7. Create booking
8. Go to booking details

### Test 3: Edit Booking - Add More Sailors
**Prerequisites:** Booking with 1 sailor exists

1. Click "Edit Booking" button
2. Scroll to "Sailor Assignment" section
3. **Verify:** Shows current sailor (Test Sailor)
4. Add another sailor
5. **Verify:**
   - [x] Fee recalculated correctly
   - [x] "Save Changes" button enabled (changed sailors)
6. Click "Save Changes"
7. **Verify:** Success toast appears
8. **Verify:** Page reloads

### Test 4: Verify Sailors Saved
**Prerequisites:** Completed Test 3

1. Look at booking details page
2. Scroll to Commission card
3. **Verify:** "Sailor Fee" shows correct total
4. Scroll down to Sailors card
5. **Verify:**
   - [x] Shows count: "Sailors (2)"
   - [x] Lists both sailors with names
   - [x] Shows hourly rates
   - [x] Shows individual fees
6. Scroll to Booking History section
7. **Verify:**
   - [x] Entry shows "Changed Sailors"
   - [x] Shows change from 1 → 2
   - [x] Shows your username
   - [x] Shows timestamp

### Test 5: Remove a Sailor
**Prerequisites:** Booking with 2 sailors

1. Click "Edit Booking"
2. In Sailor Assignment section, click X to remove one sailor
3. **Verify:**
   - [x] Sailor removed from list
   - [x] Fee recalculated
   - [x] Save button enabled
4. Click "Save Changes"
5. **Verify:** Success message

### Test 6: Verify Removal in Details
**Prerequisites:** Completed Test 5

1. Booking details should show:
   - [x] Sailors card shows 1 sailor (was 2)
   - [x] Sailor Fee updated correctly
2. History shows:
   - [x] "Changed Sailors (2 → 1)"
   - [x] New entry after previous change

### Test 7: Captain Permissions (Non-Admin)
**Prerequisites:** Create a captain user

1. Log out and log in as Captain
2. Try to edit a booking
3. **Verify:** "Sailor Assignment" section NOT shown
4. **Verify:** Captain field NOT editable

### Test 8: Add Sailor Without Other Changes
**Prerequisites:** Booking with 0 sailors, admin logged in

1. Click Edit Booking
2. **Do NOT change any other fields**
3. Only add a sailor
4. **Verify:** "Save Changes" button is ENABLED (this tests the hasChanges fix)
5. Click Save
6. **Verify:** Sailor saved correctly

---

## Troubleshooting Checklist

### Issue: Sailor Selection Not Showing
- [ ] Check sailors table has records with role='sailor'
- [ ] Verify sailor.hourly_rate is set
- [ ] Check user belongs to same company
- [ ] Check SailorSelect component loaded in edit dialog

### Issue: Sailor Not Saving
- [ ] Check POST /api/bookings/sailors returns success
- [ ] Check browser console for errors
- [ ] Verify user has admin/manager/office_staff role
- [ ] Check booking_sailors table has new record
- [ ] Check booking.sailor_fee was updated by trigger

### Issue: Sailor Fee Showing as 0
- [ ] Check booking_sailors.fee is calculated correctly
- [ ] Verify trigger fired (check booking.sailor_fee update time)
- [ ] Manually query: `SELECT * FROM booking_sailors WHERE booking_id = 'xxx'`
- [ ] Check hourly_rate and fee values

### Issue: History Not Showing Sailor Changes
- [ ] Check POST /api/bookings/sailors/history returns success
- [ ] Query booking_history table for recent entries
- [ ] Check notes field contains "Changed Sailors"
- [ ] Verify old_data and new_data have sailor info

### Issue: Save Button Disabled When Only Changing Sailors
- [ ] This was fixed - hasChanges() now includes sailor check
- [ ] If still happening, clear browser cache and reload

---

## Database Verification Queries

Use these in Supabase SQL Editor to verify data:

```sql
-- Check sailors exist
SELECT id, first_name, last_name, hourly_rate, role
FROM users
WHERE role = 'sailor'
LIMIT 10;

-- Check booking_sailors records
SELECT bs.*, b.booking_date, b.duration
FROM booking_sailors bs
JOIN bookings b ON b.id = bs.booking_id
ORDER BY bs.created_at DESC
LIMIT 10;

-- Verify booking.sailor_fee matches sum of fees
SELECT
  b.id,
  b.sailor_fee as total_sailor_fee,
  (SELECT SUM(fee) FROM booking_sailors WHERE booking_id = b.id) as calculated_fee,
  CASE
    WHEN b.sailor_fee = (SELECT COALESCE(SUM(fee), 0) FROM booking_sailors WHERE booking_id = b.id)
    THEN '✓ CORRECT'
    ELSE '✗ MISMATCH'
  END as verification
FROM bookings b
WHERE b.sailor_fee > 0 OR EXISTS (SELECT 1 FROM booking_sailors WHERE booking_id = b.id)
ORDER BY b.updated_at DESC
LIMIT 10;

-- Check booking_history for sailor changes
SELECT
  bh.id,
  bh.booking_id,
  bh.action,
  bh.notes,
  bh.old_data->>'sailor_count' as old_count,
  bh.new_data->>'sailor_count' as new_count,
  bh.created_at
FROM booking_history bh
WHERE bh.notes LIKE '%Sailors%'
ORDER BY bh.created_at DESC
LIMIT 10;
```

---

## Expected Results Summary

After all fixes, the sailor workflow should:

✅ Allow selecting/deselecting sailors from edit dialog
✅ Calculate fees correctly (hourly_rate × duration)
✅ Save sailors to booking_sailors table
✅ Automatically update booking.sailor_fee via trigger
✅ Display sailors in booking details page
✅ Show sailor fees in commission card
✅ Log sailor changes in booking history
✅ Enable save button when only sailors change

---

## Notes

- The sailor system uses a **junction table** (booking_sailors) to support multiple sailors per booking
- Sailor fees are **calculated at booking time** and stored as a snapshot
- Sailor changes are **logged in booking_history** with before/after counts
- The system uses **database triggers** to keep sailor_fee aggregated and synchronized
- Only **admin/manager/office_staff** can assign sailors (enforced at both UI and API level)

---

*Document generated: December 27, 2025*
*Tests to be executed and results documented*

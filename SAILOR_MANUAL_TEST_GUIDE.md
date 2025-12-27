# Sailor Functionality - Complete Manual Test Guide

**Date:** December 27, 2025
**Status:** Ready for Full Testing
**Build:** ✅ Successful

---

## Critical Bugs Found & Fixed

### Bug #1: Empty Array Falsy Check ✅ FIXED
**Problem:** When booking had no sailors, Supabase returned `[]` (empty array), which is falsy in JavaScript
**Fix:** Changed `if (bookingSailors)` to `if (Array.isArray(bookingSailors))`
**Result:** Sailors now load correctly from database

### Bug #2: Duration Hours Undefined ✅ FIXED
**Problem:** Code tried to use `booking.duration_hours` which doesn't exist
**Fix:** Parse duration string: `parseInt(booking.duration.replace('h', ''))`
**Result:** SailorSelect gets correct duration for fee calculation

### Bug #3: hasChanges() Not Detecting Sailor Changes ✅ FIXED
**Problem:** Save button disabled when only sailors changed
**Fix:** Added proper sailor change detection logic
**Result:** Save button enables when sailors change

### Bug #4: User Role Timing Issue ✅ FIXED
**Problem:** `userRole` loaded asynchronously, might be empty when form submits
**Fix:** Query user role inside `handleSubmit` instead of relying on async state
**Result:** Permission check always uses current user role

---

## Full Test Procedure

### Pre-Test Setup
1. Push the code: `git push`
2. Deploy/refresh your development environment
3. Log in as an **admin**, **manager**, or **office_staff** user (required to assign sailors)
4. Open browser DevTools (F12) and go to Console tab

### Test 1: Create a Sailor

**Steps:**
1. Go to `/agents` page
2. Click "Add Agent" button
3. Fill in:
   - First Name: "Test Sailor"
   - Last Name: "TestPerson"
   - Email: "sailor@test.com"
   - Phone: "1234567890"
   - **Role: Select "Sailor"** (not Agent)
   - **Hourly Rate: 25** (important: this should appear only for Sailor role)
4. Check "Is Active"
5. Click "Create Agent"

**Expected Result:**
- ✅ Sailor created successfully
- ✅ Appears in agents list with "Sailor" role
- ✅ Hourly rate €25 is visible

### Test 2: Create a Booking with Sailor

**Steps:**
1. Go to `/quick-book`
2. Select a boat, date, and time
3. Choose duration **4 hours** (for easy math: €25/h × 4h = €100)
4. Enter customer details
5. **Scroll to "Sailor Assignment" section**
6. Click "Add a sailor..." dropdown
7. **Select "Test Sailor - €25/h"**
8. **Verify fee calculated:** Should show €100.00
9. Click "Create Booking"

**Expected Result:**
- ✅ Sailor Assignment section visible
- ✅ Test Sailor appears in dropdown
- ✅ Fee calculated: €25 × 4h = €100.00
- ✅ Booking created successfully
- ✅ Success toast appears

### Test 3: View Sailors in Booking Details

**Steps:**
1. From booking list, click on the booking you just created
2. **Scroll down to see sailor information**

**Expected Result:**
- ✅ Commission card shows "Sailor Fee €100.00" (in purple)
- ✅ **Sailors card appears below Captain card** with:
  - Sailor count: "Sailors (1)"
  - Sailor name: "Test Sailor TestPerson"
  - Sailor email: "sailor@test.com"
  - Hourly rate: "€25.00/hour"
  - Fee: "€100.00"

### Test 4: Edit Booking - Add Another Sailor

**Steps:**
1. Click "Edit Booking" button
2. **Scroll to "Sailor Assignment" section**
3. **Verify current sailor shown:** Test Sailor TestPerson listed
4. Create another sailor (go to `/agents`, add with €30/h rate)
5. Go back to booking, click Edit Booking
6. **In Sailor Assignment section:**
   - Current sailor should still be shown
   - Click "Add a sailor..." dropdown
   - Select the new sailor (€30/h)
   - **Fee should show: €30 × 4h = €120.00**
   - **Total sailor cost should show: €100.00 + €120.00 = €220.00**
7. Click "Save Changes"

**Expected Result:**
- ✅ Sailor Assignment section loads with existing sailor
- ✅ Can add additional sailor
- ✅ Fees calculated correctly
- ✅ Total sailor cost displayed
- ✅ Save button **ENABLED** (this tests the hasChanges fix)
- ✅ Success message appears

### Test 5: Verify Sailors Saved in Details

**Steps:**
1. From Edit dialog, page should reload
2. Scroll to Sailors card in booking details

**Expected Result:**
- ✅ Sailors card shows "Sailors (2)"
- ✅ Both sailors listed with names and fees
- ✅ Commission card shows total "Sailor Fee €220.00"

### Test 6: Check Booking History

**Steps:**
1. Scroll to "Booking History" section in booking details

**Expected Result:**
- ✅ History timeline shows recent entries
- ✅ Should see **"Changed Sailors"** entry showing:
  - Change: 1 → 2
  - User: [Your username]
  - Timestamp: Recent time
  - Previous change if any (captain change, etc.)

### Test 7: Edit Booking - Change Captain AND Add Sailor

**This is the specific test case that failed before**

**Steps:**
1. Click "Edit Booking" button
2. Scroll to "Captain Assignment" section
3. **Change Captain to a different captain**
4. Scroll to "Sailor Assignment" section
5. **Remove one sailor** (click X button)
6. **Verify:**
   - ✅ Save button is ENABLED (not greyed out)
7. Click "Save Changes"

**Expected Result:**
- ✅ Both captain AND sailor changes saved
- ✅ Booking details shows:
   - New captain in Captain card
   - Updated Sailors card with remaining sailors
- ✅ Booking History shows:
   - "Changed Captain" entry
   - "Changed Sailors" entry (with count change)

### Test 8: Remove All Sailors

**Steps:**
1. Edit booking with sailors
2. Remove all sailors (click X on each)
3. Verify Save button enabled
4. Click Save

**Expected Result:**
- ✅ All sailors removed
- ✅ Sailors card **disappears** from booking details (no sailors to show)
- ✅ Sailor Fee **disappears** from Commission card (fee is 0)
- ✅ History shows "Changed Sailors (2 → 0)"

### Test 9: Permission Check - Non-Admin User

**Steps:**
1. Log out
2. Log in as a **Captain** or **Regular Agent** user
3. Edit a booking

**Expected Result:**
- ✅ "Sailor Assignment" section **NOT VISIBLE**
- ✅ Cannot modify sailors (read-only)
- ✅ Only admin/manager/office_staff see sailor controls

---

## Console Debug Output Guide

When you run the tests, you'll see these 🤖 DEBUG messages in the console:

### Message 1: Sailor Save Check
```
🤖 DEBUG: Sailor save check {
  currentUserRole: "admin",
  canAssignCrew: true,
  originalSailorsLength: 1,
  selectedSailorsLength: 2
}
```
✅ Good: `canAssignCrew` is `true`
❌ Bad: `canAssignCrew` is `false` → means your role isn't in the allowed list

### Message 2: Sailors Changed?
```
🤖 DEBUG: Sailors changed? {
  sailorsChanged: true,
  originalLength: 1,
  selectedLength: 2
}
```
✅ Good: `sailorsChanged` is `true`
❌ Bad: `sailorsChanged` is `false` → means change wasn't detected

### Message 3: Calling Sailor API
```
🤖 DEBUG: Calling sailor API with {
  bookingId: "550e8400-e29b-41d4-a716-446655440000",
  sailors: [
    { sailorId: "uuid1", hourlyRate: 25, fee: 100 },
    { sailorId: "uuid2", hourlyRate: 30, fee: 120 }
  ]
}
```
✅ Good: Shows correct sailor data
❌ Bad: sailors array is empty when should have sailors

### Message 4: Sailor API Response
```
🤖 DEBUG: Sailor API response {
  ok: true,
  status: 200,
  data: { success: true, message: "2 sailor(s) assigned to booking", data: [...] }
}
```
✅ Good: `ok` is `true`, `status` is `200`
❌ Bad: `ok` is `false`, `status` is 4xx/5xx → API error

### Message 5: Logging Sailor History
```
🤖 DEBUG: Logging sailor history
```
✅ Good: Appears after successful sailor save
❌ Bad: Doesn't appear → history logging skipped

### Message 6: History API Response
```
🤖 DEBUG: History API response {
  ok: true,
  status: 200,
  data: { success: true }
}
```
✅ Good: `ok` is `true`
❌ Bad: `ok` is `false` → history not logged (but this shouldn't fail the whole update)

---

## Troubleshooting

### Issue: Sailor widget doesn't appear in booking details
**Check:**
- [ ] Are sailors actually saved? Check database with: `SELECT * FROM booking_sailors WHERE booking_id = 'xxx'`
- [ ] Is the query returning sailors? Add `console.log` to the page.tsx
- [ ] Are bookingSailors being passed to the UI? Check if it's null vs []

### Issue: Save button stays disabled even after adding sailor
**Causes:**
- [ ] Empty array falsy check issue (now fixed with Array.isArray)
- [ ] hasChanges() logic broken (now fixed with proper comparison)
- [ ] Sailor not actually being added to selectedSailors state

**Debug:**
- Check console for `hasChanges()` debug logs
- Verify `selectedSailorsLength` increases when you add sailor

### Issue: Only captain saves, sailor doesn't
**Causes:**
- [ ] userRole check failing (now fixed with currentUserRole query)
- [ ] Sailor API returning error (check console for API response)
- [ ] Permission check failing (not admin/manager/office_staff)

**Debug:**
- Check console for "Sailor save check" message
- Verify `canAssignCrew` is `true`
- Check "Sailor API response" for errors

### Issue: Sailor shows in dialog but not in booking details
**Causes:**
- [ ] Sailor saved but query not fetching it
- [ ] Foreign key relationship broken
- [ ] RLS policy blocking read access

**Debug:**
- Check database: `SELECT * FROM booking_sailors`
- Verify foreign key: `SELECT * FROM booking_sailors WHERE booking_id = 'xxx'`

---

## Database Verification

Use these queries in Supabase SQL Editor to verify data:

```sql
-- Check if sailors exist
SELECT id, first_name, last_name, hourly_rate, role
FROM users
WHERE role = 'sailor'
LIMIT 5;

-- Check booking sailors
SELECT * FROM booking_sailors
ORDER BY created_at DESC
LIMIT 10;

-- Check sailor fee was updated
SELECT id, sailor_fee
FROM bookings
WHERE sailor_fee > 0
ORDER BY updated_at DESC
LIMIT 10;

-- Check history logged
SELECT * FROM booking_history
WHERE notes LIKE '%Sailors%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Summary Checklist

After completing all tests, verify:

- [ ] Test 1: Sailor created successfully
- [ ] Test 2: Sailor selected in quick book with correct fee
- [ ] Test 3: Sailor visible in booking details
- [ ] Test 4: Edit booking, add sailor, save works
- [ ] Test 5: Both sailors showing after edit
- [ ] Test 6: Sailor changes logged in history
- [ ] Test 7: Captain AND sailor changes both saved
- [ ] Test 8: Removing all sailors works
- [ ] Test 9: Non-admin can't modify sailors
- [ ] All console debug messages show correct values

---

## If Tests Pass

All sailor functionality is working! The system is ready for:
- Production deployment
- User training
- Data migration (if needed)

---

## If Tests Fail

Share:
1. **Which test failed?** (test number)
2. **What happened?** (expected vs actual)
3. **Console output** (all 🤖 DEBUG messages)
4. **Database query results** (if applicable)

This information will help identify the exact issue.

---

*Test Guide Generated: December 27, 2025*
*Status: ✅ Build Successful, Ready for Testing*

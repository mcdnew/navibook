# Sailor Functionality - Testing Guide (After Fix)

**Date:** December 27, 2025
**Fix Applied:** Simplified SailorSelect component to use direct Select onValueChange handler
**Build Status:** ✅ Successful

---

## What Was Fixed

The SailorSelect component was completely rewritten to use the same simple pattern as the Captain select dropdown. This fixes the state synchronization issue where `selectedSailors` wasn't updating when users added sailors.

### Before (Broken)
```typescript
// Complex multi-step flow:
1. User selects from dropdown → updates addingSailor state
2. User clicks button → calls handleAddSailor
3. handleAddSailor creates newSailors array
4. Calls onSailorsChange(newSailors)
5. Parent updates selectedSailors... but something broke in this chain
```

### After (Fixed)
```typescript
// Simple direct flow like Captain select:
1. User selects from Select dropdown
2. onValueChange directly calls handleAddSailor with sailor ID
3. handleAddSailor creates newSailors array
4. Calls onSailorsChange(newSailors)
5. Parent updates selectedSailors ✓ (now works!)
```

---

## Quick Test (5 minutes)

### Step 1: Build & Push
```bash
npm run build
git push
```

### Step 2: Open Edit Booking Dialog
1. Go to a booking details page
2. Click "Edit Booking" button
3. **CRITICAL:** Open browser Console (F12) - you'll need to watch console output

### Step 3: Add a Sailor
1. Scroll to "Sailor Assignment" section
2. Click the dropdown that says "Add a sailor..."
3. **Select a sailor from the list**

**Expected Result:**
- Dropdown closes automatically
- Sailor appears listed below dropdown with their name and hourly rate
- **Console shows:** `🤖 DEBUG: Adding sailor to SailorSelect { sailor: "John Smith", newLength: 1, ... }`
- Blue debug box shows: `Selected Sailors: 1`

### Step 4: Add Second Sailor
1. Click dropdown again (should now show remaining sailors)
2. Select another sailor

**Expected Result:**
- Second sailor appears in list
- Console shows: `🤖 DEBUG: Adding sailor to SailorSelect { sailor: "Jane Doe", newLength: 2, ... }`
- Blue debug box shows: `Selected Sailors: 2`

### Step 5: Remove a Sailor
1. Click the X button next to a sailor

**Expected Result:**
- Sailor is removed from list
- Console shows: `🤖 DEBUG: Removing sailor from SailorSelect { sailorId: "uuid", newLength: 1 }`
- Blue debug box updates to show correct count

### Step 6: Save Booking
1. Click "Save Changes" button
2. **Watch console for:**
   ```
   🤖 DEBUG: Sailor save check {
     currentUserRole: "admin",
     canAssignCrew: true,
     selectedSailorsLength: 1  ← SHOULD NOT BE 0 ANYMORE!
   }
   ```

**Expected Result:**
- No errors
- Toast shows "Booking Updated!"
- Page refreshes

### Step 7: Verify in Booking Details
1. Scroll to "Sailors" section
2. Should see sailor(s) listed with:
   - Name
   - Hourly rate
   - Fee amount (€)

3. Scroll to "Booking History"
4. Should see entry: "Changed Sailors (0 → 1)" or similar

---

## Console Output Reference

### ✅ GOOD - What You Should See

When you add a sailor:
```
🤖 DEBUG: Adding sailor to SailorSelect
Object {
  sailor: "John Smith",
  newLength: 1,
  newSailors: [{ sailorId: "abc123", hourlyRate: 25, fee: 100 }]
}
```

When you save:
```
🤖 DEBUG: Sailor save check
Object {
  currentUserRole: "admin",
  canAssignCrew: true,
  originalSailorsLength: 0,
  selectedSailorsLength: 1  ← KEY: This should be > 0!
}

🤖 DEBUG: Sailors changed?
Object {
  sailorsChanged: true,
  originalLength: 0,
  selectedLength: 1
}

🤖 DEBUG: Calling sailor API with
Object {
  bookingId: "550e8400-e29b-41d4-a716-446655440000",
  sailors: [{ sailorId: "uuid", hourlyRate: 25, fee: 100 }]
}

🤖 DEBUG: Sailor API response
Object {
  ok: true,
  status: 200,
  data: { success: true, message: "1 sailor(s) assigned to booking", data: [...] }
}

🤖 DEBUG: Logging sailor history
🤖 DEBUG: History API response
Object { ok: true, status: 200, data: { success: true } }
```

### ❌ BAD - What Means It's Still Broken

**Problem:** `selectedSailorsLength: 0` on save
```
🤖 DEBUG: Sailor save check
Object {
  currentUserRole: "admin",
  canAssignCrew: true,
  originalSailorsLength: 0,
  selectedSailorsLength: 0  ← BAD! Should be > 0
}
```
**Cause:** Sailor wasn't added to state. Check if:
- Blue debug box shows correct count
- You're not getting the "Adding sailor" message

**Problem:** No "Adding sailor" message in console
```
(nothing appears when you select and add a sailor)
```
**Cause:** Dropdown might not have sailors loaded. Check if:
- "No sailors available" message appears
- Sailors exist in your Agents section

---

## Full Workflow Test (15 minutes)

### Create a Test Sailor
1. Go to `/agents` page
2. Click "Add Agent" button
3. Fill in:
   - First Name: "Test Sailor"
   - Last Name: "Worker"
   - Email: "sailor.test@example.com"
   - Phone: "1234567890"
   - **Role: "Sailor"** (NOT Captain, NOT Agent)
   - **Hourly Rate: 25**
4. Check "Is Active"
5. Click "Create Agent"

### Create a Booking with Sailor
1. Go to `/quick-book`
2. Select a boat
3. Select date & time
4. **Duration: 4 hours** (for easy math: 25 × 4 = €100)
5. Add customer info
6. **Scroll to "Sailor Assignment"**
7. Click sailor dropdown
8. Select "Test Sailor - €25/h"
9. **Verify:** Shows €100.00 fee below
10. Click "Create Booking"

### Verify in Booking Details
1. Click on the booking
2. **Look for sections** (in order):
   - Booking Info (top)
   - Commission card (should show "Sailor Fee €100.00")
   - Sailors card (should show "Sailors (1)" with sailor details)
   - Captain card
   - Booking History (should show "Changed Sailors (0 → 1)")

### Edit Booking - Add Another Sailor
1. Click "Edit Booking" button
2. **Scroll to "Sailor Assignment"**
3. **Verify:** Existing sailor is shown (Test Sailor)
4. **Create another sailor** in new tab:
   - Go to `/agents`
   - Add "Sailor Two" with €30/h
5. **Back to Edit Booking dialog**
6. Click sailor dropdown
7. Select new sailor (€30/h)
8. **Verify in blue debug box:**
   - Should show "Selected Sailors: 2"
   - Both sailors listed with fees
9. **Total should show:** €100 + €120 = €220.00
10. Click "Save Changes"

### Verify Multiple Sailors Saved
1. **In Booking Details:**
   - Commission card: "Sailor Fee €220.00"
   - Sailors card: "Sailors (2)" with both sailors listed
   - Booking History: "Changed Sailors (1 → 2)"

---

## Troubleshooting

### Issue: Dropdown is empty or says "No sailors available"
**Fix:** Create sailors first
- Go to `/agents`
- Add users with Role = "Sailor"
- Must have hourly_rate > 0
- Must be marked "Is Active"

### Issue: Select a sailor but nothing happens
**Check:**
- [ ] Is console showing "Adding sailor" message?
  - YES → Problem is somewhere else
  - NO → Dropdown selection didn't work
- [ ] Is blue debug box updating?
  - YES → State is updating, likely an API issue
  - NO → State not updating (component issue)

### Issue: Blue debug box shows sailors but Save doesn't work
**Likely causes:**
- [ ] Save button disabled? → Check hasChanges() in console
- [ ] API error? → Check "Sailor API response" in console
- [ ] Permission issue? → Check "canAssignCrew: false" in console

### Issue: Save works but sailors don't appear in details
**Check database:**
```sql
SELECT * FROM booking_sailors
WHERE booking_id = 'your-booking-id';
```
- Should return 1+ rows with sailor_id, fee, etc.
- If empty: API didn't insert correctly
- If populated: Query issue in page.tsx

### Issue: History doesn't show sailor changes
**Check:**
```sql
SELECT * FROM booking_history
WHERE booking_id = 'your-booking-id'
AND notes LIKE '%Sailors%';
```
- Should have entry like "Changed Sailors (0 → 1)"
- If missing: History API failed (check console)

---

## What to Report If Tests Fail

If the sailors still aren't working, please provide:

1. **Screenshot or copy of console output** - All 🤖 DEBUG messages
2. **What happened:**
   - ❌ Dropdown empty (no sailors to select)
   - ❌ Selected sailor but nothing appears in blue box
   - ❌ Blue box updates but Save button disabled
   - ❌ Save works but sailors don't appear in details
   - ❌ Other?
3. **Do you have sailors created?**
   - In `/agents` with Role="Sailor"?
   - With hourly_rate > 0?
4. **User role you're logged in as:**
   - admin, manager, office_staff, captain, sailor, agent?

This will help identify exactly what's still not working.

---

## Summary

The sailor system should now work exactly like the captain system:
- Simple dropdown to add
- List shows selected items
- Remove button next to each
- Saves with other booking changes
- Appears in booking details
- Logged in history

✅ **Test it and verify the flow works end-to-end!**

---

*Test Guide Updated: December 27, 2025*

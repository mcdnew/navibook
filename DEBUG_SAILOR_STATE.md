# Debug Guide: Sailor State Update Issue

**Problem:** When user adds sailors in Edit Booking dialog, `selectedSailors` state stays empty (0 length).

**Goal:** Determine where the state update is failing.

---

## Test Procedure

### Step 1: Push Latest Code
```bash
git push
```

### Step 2: Open Edit Booking Dialog

1. Go to a booking details page
2. Click "Edit Booking" button
3. Scroll down to "Sailor Assignment" section
4. **Open browser Console (F12)**

### Step 3: Look for New Debug Display

You should see a **blue box** below the SailorSelect dropdown showing:
```
Selected Sailors: 0
```

Keep your eye on this box - it will update in real-time as you add/remove sailors.

### Step 4: Add a Sailor

1. Click the "Add a sailor..." dropdown
2. Select a sailor from the list
3. **Watch the blue debug box** - it should update to show:
   ```
   Selected Sailors: 1
   [sailor UUID] - €100.00
   ```

### Step 5: Check Console Logs

Look for these **🤖 DEBUG** messages in the console:

#### If it WORKS (should see these):
```
🤖 DEBUG: Adding sailor to SailorSelect
{
  sailor: "Test Sailor",
  newLength: 1,
  newSailors: [...]
}
```

Then you should see the blue box update to show "Selected Sailors: 1"

#### If it FAILS (missing messages):

**Scenario A:** No "Adding sailor" message appears
- Means handleAddSailor() isn't being called
- The button click isn't working
- Check if the component is rendering at all

**Scenario B:** "Adding sailor" message appears but blue box doesn't update
- onSailorsChange is being called
- But setSelectedSailors isn't updating the parent state
- There's a state synchronization issue

**Scenario C:** Blue box updates but shows wrong data
- State is updating but with wrong values
- Check the newSailors object in the log

---

## Detailed Logging Breakdown

### When You Click "Add Sailor" Button:

**Console should show:**
```
🤖 DEBUG: Adding sailor to SailorSelect
Object {
  sailor: "John Smith",
  newLength: 1,
  newSailors: [{
    sailorId: "uuid-here",
    hourlyRate: 25,
    fee: 100
  }]
}
```

**Then blue box should show:**
```
Selected Sailors: 1
uuid-here - €100.00
```

### When You Remove Sailor (Click X):

**Console should show:**
```
🤖 DEBUG: Removing sailor from SailorSelect
Object {
  sailorId: "uuid-here",
  newLength: 0
}
```

**Then blue box should update to:**
```
Selected Sailors: 0
```

---

## When You Click Save Changes

**Console should show (in order):**

1. First, the booking edit API call succeeds
2. Then you should see:

```
🤖 DEBUG: Sailor save check
{
  currentUserRole: "admin",
  canAssignCrew: true,
  originalSailorsLength: 0,
  selectedSailorsLength: 1  ← THIS SHOULD BE 1 IF YOU ADDED A SAILOR!
}
```

**If selectedSailorsLength is still 0:**
- The state was NOT updated when you added the sailor
- The blue debug box should have shown the sailor, but didn't?
- Or did the blue box show 1, but selectedSailorsLength is still 0?

---

## What To Report

When you test, please run the test and report:

1. **Did the blue debug box update?**
   - YES → State is updating in component
   - NO → State is not updating

2. **What console messages appeared?**
   - Copy the exact 🤖 DEBUG messages you see

3. **What was selectedSailorsLength on Save?**
   - Should be 0 initially
   - Should be > 0 after adding sailor
   - What did you see?

4. **When you REMOVED the sailor (X button)?**
   - Did the blue box update back to 0?
   - Did console show the remove message?

---

## Example Test Results

### GOOD Test (Expected Behavior):
```
1. Open dialog
   Blue box shows: "Selected Sailors: 0"

2. Add John Smith sailor
   Console: "🤖 DEBUG: Adding sailor..."
   Blue box updates to: "Selected Sailors: 1"
   Blue box shows: "uuid-1234... - €100.00"

3. Add Jane Doe sailor
   Console: "🤖 DEBUG: Adding sailor..."
   Blue box updates to: "Selected Sailors: 2"

4. Click Save
   Console: "🤖 DEBUG: Sailor save check"
   Shows: "selectedSailorsLength: 2" ✅

5. After save, booking details shows both sailors ✅
```

### BAD Test (Current Behavior):
```
1. Open dialog
   Blue box shows: "Selected Sailors: 0"

2. Add sailor
   ??? Blue box doesn't update or shows 0
   ??? No console message?
   ??? Console message but no state update?

3. Click Save
   Console: "🤖 DEBUG: Sailor save check"
   Shows: "selectedSailorsLength: 0" ❌

4. Booking doesn't show sailor ❌
```

---

## Run This Test

1. Push the code: `git push`
2. Refresh browser
3. Open Edit Booking dialog
4. Open Console (F12)
5. Try adding 2-3 sailors and removing some
6. **Screenshot or copy all console output**
7. **Describe what the blue debug box showed**
8. **Try to save and note selectedSailorsLength**

This information will pinpoint exactly where the issue is!

---

*Debug Guide Created: December 27, 2025*

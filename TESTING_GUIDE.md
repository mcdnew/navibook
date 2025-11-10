# 🧪 NaviBook Testing Guide

**Last Updated:** 2025-11-09
**Application URL:** http://localhost:3001
**Test Account:** admin@navibook.com / Admin123!

---

## 🎯 Features Completed & Ready for Testing

### ✅ Phase 1: Booking Management System (100% Complete)

1. **Booking Details Page** - Full booking information display
2. **Quick Status Actions** - Confirm, Complete, No-Show buttons
3. **Cancel Booking** - With required cancellation reason
4. **Enhanced List Filters** - Search, filter by status/date/boat, sort
5. **Edit Booking** - Update customer info, package, deposit

---

## 📋 Pre-Test Setup

### 1. Ensure Server is Running
```bash
cd /home/claudiu/projects/navibook/day-charter
pnpm run dev
```
Server should be at: **http://localhost:3001**

### 2. Create Test Bookings (if needed)
```bash
node scripts/create-test-bookings.js
```

This creates 4 test bookings:
- **John Smith** - Pending Hold (expires in 15min)
- **Maria Garcia** - Confirmed (next week)
- **Thomas Anderson** - Completed (yesterday)
- **Sophie Laurent** - Confirmed (today)

### 3. Login
- Navigate to http://localhost:3001
- Login with: **admin@navibook.com** / **Admin123!**

---

## 🧪 Testing Checklist

### Test 1: Bookings List & Filters ⭐
**Location:** `/bookings`

**Steps:**
1. ✅ Navigate to Bookings from dashboard
2. ✅ Verify you see 4 test bookings
3. ✅ Check status badges are color-coded:
   - 🟠 Orange for "Pending Hold"
   - 🟢 Green for "Confirmed"
   - 🔵 Blue for "Completed"
   - 🔴 Red for "Cancelled"

**Test Filters:**
4. ✅ Click status tabs (Pending, Confirmed, Completed) - counts should update
5. ✅ Use search box - try searching "John" or "Maria"
6. ✅ Date filter - select "Today" (should show Sophie Laurent)
7. ✅ Boat filter - select a specific boat
8. ✅ Sort dropdown - try "Price (High to Low)"
9. ✅ Click "Clear All" to reset filters

**Expected Result:**
- All filters work independently and in combination
- Results count updates: "Showing X of Y bookings"
- Active filters display with blue badges
- List refreshes instantly

---

### Test 2: Booking Details Page ⭐
**Location:** `/bookings/[id]`

**Steps:**
1. ✅ From bookings list, click "View" button on any booking
2. ✅ Verify all sections display:
   - ✅ Customer Information (name, phone, email, passengers, notes)
   - ✅ Booking Details (date, time, duration, boat, package)
   - ✅ Pricing Summary (total, deposit status, balance)
   - ✅ Commission (agent commission amount)
   - ✅ Booking History Timeline
   - ✅ Important Dates (created, hold until, completed, cancelled)
3. ✅ Check status badge at top right
4. ✅ Verify action buttons appear based on status

**Expected Result:**
- All information displays correctly
- Layout is clean and organized
- History timeline shows all changes
- Financial calculations are accurate

---

### Test 3: Confirm Pending Hold ⭐
**Location:** `/bookings/[id]` (John Smith booking)

**Prerequisites:** Booking must be in "pending_hold" status

**Steps:**
1. ✅ View the "John Smith" booking (pending hold)
2. ✅ Verify countdown timer shows "Hold Until: [time]"
3. ✅ Click green "Confirm Booking" button
4. ✅ Dialog appears with deposit checkbox
5. ✅ Check "Mark deposit as paid" checkbox
6. ✅ Click "Confirm Booking" in dialog
7. ✅ Verify success toast: "Booking Confirmed!"
8. ✅ Page refreshes automatically
9. ✅ Status badge changes to green "CONFIRMED"
10. ✅ "Hold Until" disappears
11. ✅ "Confirm Booking" button disappears
12. ✅ New entry in booking history: "confirmed"

**Expected Result:**
- Status changes from pending_hold → confirmed
- Deposit marked as paid
- Hold timer removed
- History logged automatically
- Toast notification appears

---

### Test 4: Edit Booking ⭐
**Location:** `/bookings/[id]` (any non-cancelled/completed booking)

**Steps:**
1. ✅ View any confirmed booking (e.g., Maria Garcia)
2. ✅ Click blue "Edit Booking" button
3. ✅ Dialog opens with current booking data
4. ✅ Notice warning about date/time changes
5. ✅ Make changes:
   - ✅ Change customer name to "Maria Rodriguez"
   - ✅ Update phone number
   - ✅ Change passenger count
   - ✅ Select different package type
   - ✅ Update deposit amount
   - ✅ Add/modify notes
6. ✅ Click "Save Changes"
7. ✅ Verify success toast: "Booking Updated!"
8. ✅ Page refreshes with new data
9. ✅ Check booking history shows "updated" entry

**Validation Tests:**
10. ✅ Try passenger count > boat capacity - should show error
11. ✅ Try empty customer name - should show error
12. ✅ Verify "Save Changes" disabled if no changes made

**Expected Result:**
- All fields update correctly
- Validation works properly
- History logs the update
- Cannot edit completed/cancelled bookings

---

### Test 5: Cancel Booking ⭐
**Location:** `/bookings/[id]` (any confirmed booking)

**Steps:**
1. ✅ View Sophie Laurent booking (confirmed, today)
2. ✅ Click red "Cancel Booking" button
3. ✅ Dialog appears with reason field
4. ✅ Try clicking "Cancel Booking" without reason - should be disabled
5. ✅ Enter reason: "Customer requested cancellation"
6. ✅ Click "Cancel Booking"
7. ✅ Verify success toast: "Booking Cancelled"
8. ✅ Status badge changes to red "CANCELLED"
9. ✅ "Cancelled" date appears in Important Dates
10. ✅ Cancellation reason displays
11. ✅ Action buttons disappear (can't edit cancelled booking)
12. ✅ Go back to bookings list - filter by "Cancelled" to verify

**Expected Result:**
- Booking status changes to cancelled
- Cancellation reason recorded
- Cancelled date/time logged
- Boat availability released (for future bookings)
- No more action buttons available

---

### Test 6: Mark as Completed ⭐
**Location:** `/bookings/[id]` (confirmed booking in the past)

**Prerequisites:** Need a confirmed booking with date = yesterday or earlier

**Steps:**
1. ✅ If no past bookings exist, create one:
   ```bash
   # Manually update a booking date to yesterday in Supabase dashboard
   ```
2. ✅ View the past booking
3. ✅ Click blue "Mark as Completed" button
4. ✅ Verify success toast appears
5. ✅ Status changes to blue "COMPLETED"
6. ✅ "Completed At" timestamp appears
7. ✅ Action buttons change (no more complete/cancel)

**Expected Result:**
- Status → completed
- Completed timestamp recorded
- Can no longer edit or cancel

---

### Test 7: Mark as No-Show ⭐
**Location:** `/bookings/[id]` (confirmed booking in the past)

**Steps:**
1. ✅ View a confirmed booking with past date
2. ✅ Click gray "Mark as No-Show" button
3. ✅ Verify success toast
4. ✅ Status changes to gray "NO SHOW"
5. ✅ Check booking history

**Expected Result:**
- Status → no_show
- Timestamp recorded
- History updated

---

### Test 8: Create New Booking ⭐
**Location:** `/quick-book`

**Steps:**
1. ✅ Navigate to Quick Book page
2. ✅ Fill out form:
   - ✅ Select tomorrow's date
   - ✅ Choose start time 10:00
   - ✅ Select duration (4h)
   - ✅ Enter 5 passengers
3. ✅ Verify available boats appear
4. ✅ Select a boat (check "Recommended" badge)
5. ✅ Enter customer details:
   - Name: Test Customer
   - Phone: +30 6912345678
   - Email: test@example.com
6. ✅ Select package type
7. ✅ Verify commission auto-calculates
8. ✅ Choose confirmation option:
   - **Option A:** "Hold for 15 Minutes" (creates pending_hold)
   - **Option B:** "Confirm Immediately" (creates confirmed)
9. ✅ Click submit button
10. ✅ Verify success dialog appears
11. ✅ Click "View in Dashboard"
12. ✅ Verify booking appears in list

**Expected Result:**
- Booking created successfully
- Shows in bookings list
- Status matches selected option
- Commission calculated correctly

---

### Test 9: Real-Time Updates ⭐
**Location:** `/quick-book` or `/bookings`

**Prerequisites:** Open app in 2 browser windows/tabs

**Steps:**
1. ✅ Window 1: Open `/quick-book`
2. ✅ Window 2: Open `/bookings` list
3. ✅ Window 1: Create a new booking
4. ✅ Window 2: Should see toast notification "New booking created"
5. ✅ Window 2: List should auto-update with new booking
6. ✅ Window 1: Cancel a booking
7. ✅ Window 2: Should see cancellation notification

**Expected Result:**
- Changes in one window reflect in other window
- Toast notifications appear
- No manual refresh needed
- Real-time sync working

---

### Test 10: Booking History Timeline ⭐
**Location:** `/bookings/[id]` - scroll to "Booking History"

**Steps:**
1. ✅ View any booking that has been modified
2. ✅ Check timeline shows:
   - ✅ "Created" entry (green dot)
   - ✅ "Updated" entries (blue dot) if edited
   - ✅ "Confirmed" entry (green dot) if confirmed
   - ✅ "Cancelled" entry (red dot) if cancelled
3. ✅ Verify timestamps are accurate
4. ✅ Check most recent entry is at top

**Expected Result:**
- Complete audit trail
- All changes logged
- Chronological order (newest first)
- Clear visual indicators

---

## 🐛 Known Issues / Edge Cases

### Expected Behaviors:
1. **15-Minute Hold Timer**: Holds auto-expire after 15 minutes (requires cron job in production)
2. **Date Changes**: Cannot change booking date via edit (must cancel & rebook)
3. **Capacity Warnings**: System warns but allows booking undersized boats
4. **Completed Bookings**: Only show complete/no-show buttons for past bookings

### Not Implemented Yet:
- ❌ Automatic hold expiration (needs scheduled job)
- ❌ Email notifications
- ❌ Payment processing integration
- ❌ Calendar drag-and-drop
- ❌ Weather integration

---

## 📊 Test Results Template

Copy this template to track your testing:

```
## Test Session: [Date]
Tester: [Your Name]
Version: NaviBook v1.0

### Test Results:
- [ ] Test 1: Bookings List & Filters
- [ ] Test 2: Booking Details Page
- [ ] Test 3: Confirm Pending Hold
- [ ] Test 4: Edit Booking
- [ ] Test 5: Cancel Booking
- [ ] Test 6: Mark as Completed
- [ ] Test 7: Mark as No-Show
- [ ] Test 8: Create New Booking
- [ ] Test 9: Real-Time Updates
- [ ] Test 10: Booking History Timeline

### Issues Found:
1. [Describe any bugs]

### Performance Notes:
- Page load times: [Fast/Slow]
- Filter responsiveness: [Good/Bad]
- Real-time updates: [Working/Not Working]

### Browser Tested:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (iPhone)
- [ ] Mobile (Android)
```

---

## 🎯 Success Criteria

### All Tests Passing Means:
✅ Booking lifecycle works (create → confirm → complete)
✅ Filters provide quick navigation
✅ Edit/cancel operations work correctly
✅ History tracking is accurate
✅ Real-time updates function
✅ Validation prevents errors
✅ UI is responsive and clean

---

## 🆘 Troubleshooting

### Issue: Bookings List Empty
**Solution:**
```bash
node scripts/create-test-bookings.js
```

### Issue: Login Fails
**Check:**
- `.env.local` file exists
- Supabase credentials are correct
- Database is accessible

### Issue: Real-Time Not Working
**Check:**
- Realtime enabled in Supabase dashboard
- Tables: `bookings`, `boats`, `boat_blocks` have realtime on

### Issue: Actions Don't Work
**Check:**
- Browser console for errors
- API routes exist in `/app/api/bookings/`
- Network tab shows 200 responses

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check server logs in terminal
3. Verify database state in Supabase dashboard
4. Review `DEVELOPMENT_LOG.md` for recent changes

---

**Happy Testing! 🚀**

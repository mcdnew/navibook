# Bug Tracking - NaviBook Day Charter System

This document tracks all bugs discovered and their resolution status.

## Legend
- ✅ **FIXED** - Bug has been resolved and tested
- 🔴 **OPEN** - Bug is known but not yet fixed
- 🟡 **IN PROGRESS** - Bug is currently being worked on

---

## Fixed Bugs

### BUG-001: Agent/User Creation Failed ✅
**Severity:** Critical
**Found in:** Create Agents
**Status:** ✅ FIXED

**Issue:**
When trying to create an agent, the system returned "Failed to create agent - User not allowed" error message.

**Steps to Reproduce:**
1. Try to create a new member (Agent, Power agent, Staff member, Captain, etc)

**Expected:** Create a new member, receive confirmation email from Supabase
**Actual:** "Failed to create agent User not allowed" error

**Solution:** Created admin client with service role key for auth operations

---

### BUG-002: Pending Reservations Not Expiring ✅
**Severity:** Critical
**Found in:** Create Reservation / Bookings / Booking Details
**Status:** ✅ FIXED

**Issue:**
Bookings created with pending/hold status showed correct timing (reservation time, remaining, end of hold time), but the reservation would not drop and the timeslot would not be freed once hold time elapsed. Bookings remained in pending status indefinitely.

**Steps to Reproduce:**
1. Create a new reservation with hold time
2. Wait for hold time to expire

**Expected:** Timeslot freed and reservation dropped when hold time expires
**Actual:** Reservation remains in hold status even after expiry

**Solution:** Added cron job to cleanup expired holds every 5 minutes + manual cleanup on page loads

---

### BUG-003: Canceled Reservations Still in Calendar ✅
**Severity:** Critical
**Found in:** Reservations / Calendar
**Status:** ✅ FIXED

**Issue:**
When canceling a booking, the system indicated it was canceled and timeslot freed, but the reservation did not disappear from the calendar.

**Steps to Reproduce:**
1. Cancel an existing confirmed reservation

**Expected:** Timeslot freed and booking disappears from calendar
**Actual:** Booking remains visible in calendar after canceling

**Solution:** Added filter to exclude cancelled bookings from calendar view

---

### BUG-004: Canceled Bookings with Expired Hold Time ✅
**Severity:** Critical
**Found in:** Reservations / Calendar
**Status:** ✅ FIXED

**Issue:**
When canceling a booking with expired hold time, it showed as canceled but remained in the calendar and it was unclear if the timeslot was truly freed.

**Steps to Reproduce:**
1. Cancel an existing "on hold" reservation after hold time expired

**Expected:** Timeslot freed automatically on reaching hold limit and disappears from calendar
**Actual:** Booking remains in calendar even after canceling

**Solution:** Auto-cleanup of expired holds + excluded from calendar

---

### BUG-005: Advanced Booking Page Error ✅
**Severity:** Critical
**Found in:** Advanced Booking Page
**Status:** ✅ FIXED

**Issue:**
Page returned error and was non-functional.

**Error:**
```
Unhandled Runtime Error
Error: A <Select.Item /> must have a value prop that is not an empty string.
This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

**Steps to Reproduce:**
1. Access Advanced Booking Page

**Expected:** Access page and all functionalities
**Actual:** Page throws error and fails to render

**Solution:** Changed empty string Select.Item value to "all"

---

### BUG-006: Blocked Slots Page Redirecting ✅
**Severity:** Critical
**Found in:** Blocked Slots Page
**Status:** ✅ FIXED

**Issue:**
Blocked Slots page redirected to Dashboard instead of showing functionality. Unable to block slots/days for maintenance.

**Steps to Reproduce:**
1. Access Blocked Slots Page

**Expected:** Access page and block slots functionality
**Actual:** Redirects to Dashboard

**Solution:** Updated role permissions to include admin and manager roles

---

### BUG-007: Notifications Page Error ✅
**Severity:** Critical
**Found in:** Notifications Page
**Status:** ✅ FIXED

**Issue:**
Page returned build error and was non-functional.

**Error:**
```
Build Error: Module not found: Can't resolve '@/components/ui/switch'
./app/(dashboard)/notifications/notifications-client.tsx:7:1
```

**Steps to Reproduce:**
1. Access Notifications Page

**Expected:** Access page and all functionalities
**Actual:** Build error - module not found

**Solution:** Created missing Switch component and installed @radix-ui/react-switch

---

### BUG-008: Fleet Management - Cannot Reactivate Boats ✅
**Severity:** Critical
**Found in:** Fleet Management Page
**Status:** ✅ FIXED

**Issue:**
When a boat was deactivated, there was no way to reactivate it.

**Steps to Reproduce:**
1. Go to Fleet Management
2. Deactivate a boat
3. Try to reactivate it

**Expected:** Should be able to reactivate deactivated boats
**Actual:** Button disabled, no reactivation option

**Solution:** Created toggle-status endpoint and updated UI to allow reactivation

---

### BUG-009: Fleet Management - Cannot Delete Boats ✅
**Severity:** High
**Found in:** Fleet Management Page
**Status:** ✅ FIXED

**Issue:**
No option to permanently delete boats from the fleet.

**Steps to Reproduce:**
1. Go to Fleet Management
2. Look for delete option

**Expected:** Should be able to delete boats that have no bookings
**Actual:** Only deactivate option available

**Solution:** Added permanent delete API and UI (only for inactive boats with no bookings)

---

### BUG-010: Blocked Slots - Insufficient Permissions ✅
**Severity:** Critical
**Found in:** Blocked Slots Page
**Status:** ✅ FIXED

**Issue:**
Admin users received "Insufficient permissions" error when trying to create blocked slots.

**Steps to Reproduce:**
1. Login as admin
2. Try to create a blocked slot

**Expected:** Admin should be able to create blocked slots
**Actual:** Returns 403 Insufficient permissions error, then RLS policy violation

**Solution:** Updated API permissions + Fixed RLS policies in database to use 'admin', 'manager', 'power_agent' instead of 'company_admin'
**Migration:** Applied `009_fix_blocked_slots_rls.sql`

---

### BUG-011: Booking History Timeline Missing Details ✅
**Severity:** Critical
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** `02c8ad7`

**Issue:**
Booking history timeline was incomplete - showing when changes occurred but not WHO made the changes or WHAT specifically changed (before/after values).

**Root Cause:**
- Database had all necessary data (user_id, old_data JSONB, new_data JSONB)
- UI wasn't displaying the information properly

**Solution:**
1. Created `lib/booking-history-utils.ts` - Utility to parse JSONB changes
2. Created `app/(dashboard)/bookings/[id]/booking-history-timeline.tsx` - Interactive timeline component
3. Updated booking history query to JOIN users table
4. Added expandable details with before/after comparisons

**Files Modified:**
- `app/(dashboard)/bookings/[id]/page.tsx`

**Files Created:**
- `lib/booking-history-utils.ts`
- `app/(dashboard)/bookings/[id]/booking-history-timeline.tsx`

---

### BUG-012: Dashboard Needs Enhanced Bookings View ✅
**Severity:** Important
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** `02c8ad7`

**Issue:**
Dashboard "Recent Bookings" section needed enhancement with multiple views - users wanted to see latest created bookings, today's charters, and urgent actions requiring attention, not just upcoming bookings.

**Solution:**
Created comprehensive tabbed interface with 4 tabs:
1. **Upcoming Bookings** - Next 10 future bookings by date
2. **Latest Created** - Newest 10 bookings by creation timestamp
3. **Today's Charters** - Operational view for current day
4. **Urgent Actions** - Holds expiring <2hrs, unconfirmed for today/tomorrow

**Files Created:**
- `app/(dashboard)/dashboard/dashboard-bookings-tabs.tsx`

**Files Modified:**
- `app/(dashboard)/dashboard/page.tsx`

**Features:**
- Badge counts for each tab
- Urgency indicators with color coding
- Clickable links to booking details
- Responsive design with mobile-friendly labels

---

### BUG-013: Waitlist Entries Remain After Conversion ✅
**Severity:** Important
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** `aef874a`

**Issue:**
When converting a waitlist entry to a booking, the waitlist entry remained visible and had to be manually deleted instead of automatically disappearing from the waitlist.

**Root Cause:**
- Conversion process correctly updated status to 'converted'
- UI filter wasn't excluding converted entries by default

**Solution:**
1. Modified waitlist filter to automatically exclude entries with status='converted'
2. Removed 'Converted' from status filter dropdown
3. Converted entries are now preserved in database for audit but hidden from active view

**Files Modified:**
- `app/(dashboard)/waitlist/waitlist-client.tsx`

**Result:**
When a waitlist entry is converted to a booking, it automatically disappears from the waitlist view while being preserved for audit trail.

---

### BUG-014: Cannot Change Captain in Edit Booking Dialog ✅
**Severity:** Important
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** `aef874a`

**Issue:**
Users could not change the captain assignment when editing an existing booking - the captain field was missing from the edit dialog.

**Solution:**
1. Added captain loading from database (filtering by role='captain')
2. Added Select dropdown to edit booking dialog UI
3. Updated API to accept and save captain_id
4. Handled 'none' value for no captain assignment

**Files Modified:**
- `app/(dashboard)/bookings/[id]/edit-booking-dialog.tsx`
- `app/api/bookings/edit/route.ts`

**Features:**
- Shows all captains from the same company
- Displays hourly rates (e.g., "John Smith - €25/h")
- Shows "(Owner - No Charge)" for captains with 0 hourly rate
- Includes "No Captain" option for unassigning

---

### Mobile Rendering Issues: Quick Book Boat Selection Cards ✅
**Severity:** Medium
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** `c37c175`

**Issue:**
Mobile rendering problems in the quick booking flow:
1. Boat selection cards overflow on small screens
2. "Too Small" warning text wrapping awkwardly
3. No responsive font sizing
4. Badge text overflow

**Solution:**
Implemented comprehensive mobile responsive improvements:

**Responsive Layout:**
- Changed card layout from always-horizontal to responsive stacking
- Cards stack vertically on mobile (<640px), horizontal on desktop
- Added min-height (88px) for comfortable touch targets

**Text & Typography:**
- Improved "Too Small" warning: "Needs X more seats" (concise)
- Added responsive font sizing: text-base on mobile, text-lg on desktop
- Applied break-words to prevent text overflow

**Overflow Prevention:**
- Added min-w-0 to flex containers
- Added flex-shrink-0 to price section
- Optimized price section layout

**Files Modified:**
- `app/(mobile)/quick-book/page.tsx`

---

### BUG-015: Dark Mode Inconsistency on Booking Details Page ✅
**Severity:** High
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** `e033604`

**Issue:**
Booking Details page had a light/white background in dark mode while other pages (Bookings, Fleet, Reports) had proper dark backgrounds. The inconsistency was very obvious.

**Root Cause:**
Page used `bg-gray-50` (light gray) instead of `bg-background` which respects theme changes.

**Solution:**
Changed background class from `bg-gray-50` to `bg-background` on line 152.

**Files Modified:**
- `app/(dashboard)/bookings/[id]/page.tsx`

**Result:**
Booking Details page now properly respects dark mode theme, consistent with all other dashboard pages.

---

### BUG-016: Cannot Manage Payment Status from Pricing Summary ✅
**Severity:** High
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** `e033604`

**Issue:**
Users could not manage payment status (paid/unpaid) from the "Pricing Summary" section in the Booking Details page. The deposit status was displayed as a read-only badge.

**Solution:**
1. Created interactive `PaymentStatusToggle` dropdown component
2. Created API endpoint `/api/bookings/payment-status` for updates
3. Replaced read-only Badge with clickable PaymentStatusToggle

**Files Created:**
- `app/(dashboard)/bookings/[id]/payment-status-toggle.tsx`
- `app/api/bookings/payment-status/route.ts`

**Files Modified:**
- `app/(dashboard)/bookings/[id]/page.tsx`

**Features:**
- Dropdown button with visual states (green for paid, orange for unpaid)
- Click to toggle between "Mark as Paid" and "Mark as Unpaid"
- Loading state during update
- Toast notifications for success/error
- Auto-refresh page data after update
- Disabled state prevents redundant clicks

---

### BUG-017: Dark Theme Display Improvements ✅
**Severity:** High
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** *(Pending)*

**Issue:**
Multiple dark theme inconsistencies in Booking Details page:
1. Action buttons container had bright white background
2. Special Requests field had white background
3. Button hover states used light colors incompatible with dark mode

**Solution:**

**Action Buttons Container:**
- Changed `bg-white` → `bg-card` (line 234 in booking-actions.tsx)
- Now properly respects dark mode theme

**Special Requests Field:**
- Changed `bg-gray-50` → `bg-muted` (line 220 in page.tsx)
- Background now adapts to theme

**Button Styles:**
- Mark as No-Show: Removed hard-coded light colors, uses default outline variant
- Edit Booking: Changed to `border-blue-500 text-blue-600 dark:text-blue-400`
- Customer Portal Link: Changed to `border-purple-500 text-purple-600 dark:text-purple-400`

**Files Modified:**
- `app/(dashboard)/bookings/[id]/booking-actions.tsx`
- `app/(dashboard)/bookings/[id]/page.tsx`

**Result:**
All elements now have proper contrast in both light and dark modes. Dark theme is consistent across the entire Booking Details page.

---

### BUG-018: Inconsistent Payment Calculation Between Pages ✅
**Severity:** Critical
**Reported:** 2025-11-18
**Fixed:** 2025-11-18 (Corrected Implementation)
**Commit:** *(Pending)*

**Issue:**
The Booking Details page and Payments page showed inconsistent financial data. The Booking Details page used the `deposit_paid` boolean flag to calculate outstanding balance, while the Payments page used actual `payment_transactions`. This created a fundamental inconsistency:

**Scenario demonstrating the problem:**
1. Go to Booking Details page
2. Toggle "Deposit Status" to "Paid"
3. Outstanding Balance decreases (e.g., €1,152 → €652)
4. Go to Payments page
5. Same booking shows "Paid: €0.00" and "Outstanding: €1,152.00"
6. **Inconsistency:** Deposit marked as paid but no actual payment transaction exists!

**Root Cause:**
The original BUG-018 implementation (now corrected) had a flawed approach:
- **Booking Details:** Calculated outstanding = total_price - (deposit_paid ? deposit_amount : 0)
- **Payments Page:** Calculated outstanding = total_price - sum(payment_transactions)
- `deposit_paid` is just a boolean flag, NOT actual money
- Toggling the flag didn't create payment transactions
- Two pages showed different financial realities

**Corrected Solution:**
**Use `payment_transactions` as the single source of truth for all financial calculations.**

1. **Fetch payment_transactions in Booking Details page:**
   - Added payment_transactions to booking query
   - Provides complete payment history

2. **Calculate from actual transactions:**
   - Total Paid = sum(payment_transactions.amount)
   - Outstanding = total_price - total_paid
   - Consistent across all pages

3. **Keep deposit_paid as status indicator only:**
   - Shows "Deposit Status (Flag): Paid/Unpaid"
   - Clearly labeled as indicator, not financial data
   - Useful for quick visual reference

4. **Inconsistency Detection:**
   - Warns if deposit_paid=true but no transactions exist
   - Yellow alert: "Deposit marked as paid, but no payment transactions recorded"
   - Guides users to record actual payments

5. **Enhanced Visual Features:**
   - **Total Paid** - Calculated from actual transactions (green)
   - **Payment History** - List of all transactions with dates and amounts
   - **Payment Progress Bar** - Based on actual paid amount
   - **Color-Coded Outstanding Balance:**
     - Green: Fully paid (≤ €0)
     - Blue: Partial payment (0 < outstanding < total)
     - Orange: No payment yet (outstanding = total)

**Files Created:**
- `app/(dashboard)/bookings/[id]/pricing-summary.tsx` - Interactive component with transaction-based calculations

**Files Modified:**
- `app/(dashboard)/bookings/[id]/page.tsx` - Fetches payment_transactions, passes to PricingSummary
- `app/(dashboard)/bookings/[id]/payment-status-toggle.tsx` - Added onStatusChange callback

**Key Technical Changes:**
```typescript
// WRONG (original implementation):
const paidAmount = depositPaid ? depositAmount : 0
const outstandingBalance = totalPrice - paidAmount

// CORRECT (fixed implementation):
const actualPaidAmount = paymentTransactions.reduce((sum, pt) => sum + pt.amount, 0)
const outstandingBalance = totalPrice - actualPaidAmount
```

**Result:**
- ✅ Booking Details and Payments pages now show identical financial data
- ✅ Outstanding balance calculated from actual payment transactions
- ✅ deposit_paid shown as status indicator only
- ✅ Inconsistency warnings guide users to proper payment recording
- ✅ Complete payment history visible in Booking Details
- ✅ Single source of truth for all financial calculations

---

### BUG-019: Payment Tracking Details Not Updating After Recording Payment ✅
**Severity:** High
**Reported:** 2025-11-18
**Fixed:** 2025-11-18
**Commit:** *(Pending)*

**Issue:**
In the Payment Tracking page, when recording a payment for a booking, the summary statistics (Total Outstanding and Total Collected) updated correctly, but the individual booking's payment details did not update in real-time. The booking continued to show the old values for "Paid" and "Outstanding" amounts until the page was manually refreshed.

Example scenario:
- Daniel Martinez booking shows:
  - Total: €1,152.00
  - Paid: €0.00
  - Outstanding: €1,152.00
- User clicks "Record Payment" and records €500.00 payment
- Toast shows "Payment recorded successfully"
- Summary stats update: Total Outstanding and Total Collected change
- BUT individual booking still shows:
  - Paid: €0.00 (should show €500.00)
  - Outstanding: €1,152.00 (should show €652.00)

**Root Cause:**
The PaymentsClient component received bookings data from the server component as props, but:
1. Used the props directly in useMemo calculations
2. When payment was recorded, called `router.refresh()` to trigger server re-fetch
3. However, the component continued using the stale props data until the server component fully re-rendered
4. This caused a delay in UI updates despite the database being updated correctly

**Solution:**
1. Added local state management for bookings data in PaymentsClient
2. Initialize state from props using `useState(initialBookings)`
3. Added `useEffect` to sync with server updates when props change
4. Updated `handleRecordPayment` to optimistically update local state immediately:
   - After successful payment recording, add the new payment transaction to the booking's array
   - This triggers useMemo recalculation with updated data
   - UI updates instantly without waiting for server refresh
5. Server refresh still occurs in background to ensure data consistency

**Files Modified:**
- `app/(dashboard)/payments/payments-client.tsx`

**Technical Changes:**
```typescript
// Before: Used props directly
export default function PaymentsClient({ bookings }: PaymentsClientProps)

// After: Local state with server sync
export default function PaymentsClient({ bookings: initialBookings }: PaymentsClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)

  // Sync with server updates
  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  // Optimistic update after payment recorded
  setBookings((prevBookings) =>
    prevBookings.map((booking) =>
      booking.id === selectedBooking.id
        ? {
            ...booking,
            payment_transactions: [
              ...(booking.payment_transactions || []),
              result.payment,
            ],
          }
        : booking
    )
  )
}
```

**Result:**
Payment details now update instantly when a payment is recorded. Users see immediate changes to:
- Individual booking "Paid" amount
- Individual booking "Outstanding" amount
- Payment status badge (Unpaid → Partial → Paid)
- Summary statistics (already worked, now consistent with details)

The UI provides instant feedback while maintaining data consistency through background server refresh.

---

## Known Issues (Not Yet Prioritized)

### Navigation Issues
**Description:** Difficult navigation between some pages. Users have to pass via Dashboard to get between certain pages (e.g., from Booking Details to Calendar requires going back to Dashboard first).

**Suggested Fix:** Add consistent navigation links across all pages

---

### Quick Book Page Debug Info
**Status:** ✅ FIXED - Debug info area removed

---

### Quick Book Calendar Alignment
**Description:** Calendar area looks strange, aligned to the left with free space to the right. This affects rendering on mobile (column not centered).

**Status:** 🔴 OPEN - Needs investigation

---

### Mobile Version Column Layout
**Description:** Having a centered, "justified" column could give a better "app" feeling. Being able to move left/right and zoom makes this look awkward sometimes.

**Status:** 🔴 OPEN - Needs design review

---

## Bug Reporting Guidelines

When reporting a bug, please include:

1. **Bug Number** - Sequential numbering (BUG-XXX)
2. **Severity** - Critical, High, Medium, Low
3. **Description** - Clear description of the issue
4. **Steps to Reproduce** - How to recreate the bug
5. **Expected Behavior** - What should happen
6. **Actual Behavior** - What actually happens
7. **Screenshots** - If applicable
8. **Environment** - Browser, OS, screen size (for UI bugs)

---

## Bug Resolution Process

1. **Report** - Bug is documented in this file
2. **Investigate** - Root cause is identified
3. **Fix** - Solution is implemented
4. **Test** - Build and manual testing
5. **Commit** - Changes are committed with reference to bug number
6. **Document** - This file is updated with resolution details

---

Last Updated: 2025-11-18

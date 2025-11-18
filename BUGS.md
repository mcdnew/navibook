# Bug Tracking - NaviBook Day Charter System

This document tracks all bugs discovered and their resolution status.

## Legend
- ✅ **FIXED** - Bug has been resolved and tested
- 🔴 **OPEN** - Bug is known but not yet fixed
- 🟡 **IN PROGRESS** - Bug is currently being worked on

---

## Fixed Bugs

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

## Open Bugs

None currently reported.

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

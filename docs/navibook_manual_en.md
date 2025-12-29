# NaviBook Day-Charter - Complete User Manual & Quick Start Guide

**English Version | Version 1.0 | December 2025**

---

## Quick Navigation

- **New to NaviBook?** → Start with [Quick Start Section](#quick-start-guide-15-minutes)
- **Need comprehensive help?** → See [Complete Manual](#complete-user-manual)
- **Specific topic?** → Use Table of Contents below

---

## Table of Contents

### Quick Start (15 minutes)
1. [What is NaviBook?](#what-is-navibook)
2. [Your First Login](#your-first-login)
3. [Understand Your Role](#understand-your-role)
4. [Create Your First Booking](#create-your-first-booking)
5. [Get Paid](#get-paid)
6. [Manage Your Fleet](#manage-your-fleet)
7. [Manage Your Team](#manage-your-team)
8. [Track Payments](#track-payments)
9. [View Your Dashboard](#view-your-dashboard)
10. [Share with Customer](#share-with-customer)

### Complete Manual Sections
- [User Roles & Permissions](#user-roles--permissions)
- [Booking Management](#booking-management)
- [Crew & Staff Management](#crew--staff-management)
- [Pricing & Rates](#pricing--rates)
- [Payment Processing](#payment-processing)
- [Customer Portal](#customer-portal)
- [Reports & Analytics](#reports--analytics)
- [Boat Fleet Management](#boat-fleet-management)
- [System Settings](#system-settings)
- [Mobile App Guide](#mobile-app-guide)
- [Troubleshooting](#troubleshooting)

---

# QUICK START GUIDE (15 minutes)

## What is NaviBook?

A complete system for managing boat charter bookings, crew, payments, and customers. It provides real-time availability checking, integrated payments via Stripe, and customer self-service capabilities.

## Your First Login

1. Go to: `https://navibook.com`
2. Click **"Login"** (top right)
3. Enter your email and password

**Demo Account (for testing):**
- Email: `admin@navibook.com`
- Password: `Admin123!`

## Understand Your Role

| Your Role | What You Can Do |
|-----------|-----------------|
| **Admin** | Everything: bookings, pricing, staff, payments, settings |
| **Operations Manager** | Bookings, staff, payments, reports (no settings) |
| **Sales Agent** | Create your own bookings, view customers |
| **Captain/Sailor** | View your assigned charters and earnings |
| **Office Staff** | Create bookings, record payments, manage customers |

## Create Your First Booking (5 minutes)

### Quick Book Method (Easiest)

1. Click **"Quick Book"** in navigation
2. **Select a Boat** from dropdown
3. **Choose Date & Duration** (2h, 4h, 6h, 8h)
4. **Enter Customer Details** (name, email, phone)
5. **Select Package** (charter only, with drinks, with food, premium)
6. **Set Passenger Count**
7. **Assign Captain** (optional)
8. **Review Price** - shows all costs
9. **Confirm** - booking created with 15-minute hold
10. Email sent to customer

✅ **Booking created!** The boat is reserved for 15 minutes. Next: Get payment.

## Get Paid (3 minutes)

### Option A: Send Payment Link (Fastest)
1. Go to **Bookings** page
2. Click on your booking
3. Click **"Send Payment Link"**
4. Customer receives email with Stripe payment link
5. You get notification when paid ✓

### Option B: Record Manual Payment
1. Go to booking detail
2. Click **"Record Payment"**
3. Enter payment method, amount, and reference
4. Save - booking marked as paid ✓

## Manage Your Fleet (3 minutes)

1. Go to **Fleet** → **Add New Boat**
2. Enter: boat name, type (sailboat/motorboat/jetski), capacity
3. Click **"Create Boat"**
4. Go to **Pricing** → Set prices for durations (2h, 4h, etc.)
5. Prices are used automatically for new bookings

## Manage Your Team (2 minutes)

1. Go to **Agents** → **Add New Agent**
2. Enter: name, email, phone
3. Select role: Captain, Sailor, Sales Agent, etc.
4. Set compensation: hourly rate or commission
5. Click **"Create Agent"**
6. Email sent to new person - they can log in

## Track Payments

Go to **Payments** page to see:
- Pending payments
- Paid bookings
- Payment methods and dates
- Record manual payments

## View Your Dashboard

Click **"Dashboard"** to see:
- Active boats count
- Today's charters
- Revenue this month
- Pending payments
- Team performance

## Share with Customer

1. Open booking detail page
2. Click **"Share with Customer"**
3. Copy unique secure link
4. Send via email, WhatsApp, SMS

Customer can:
- View booking details
- Request changes
- Make payment
- See weather forecast

---

# COMPLETE USER MANUAL

## User Roles & Permissions

### 1. ADMIN - Full System Access

**Can:**
- ✅ Create, edit, cancel any booking
- ✅ Manage all staff and crew
- ✅ Configure pricing and rates
- ✅ Access all payments and reports
- ✅ Modify company settings
- ✅ Archive/delete agents
- ✅ View all customer data

### 2. OPERATIONS_MANAGER - Operations Oversight

**Can:**
- ✅ Create and edit all bookings
- ✅ Manage agents and crew assignments
- ✅ View payments and record transactions
- ✅ Access reports and analytics
- ✅ Create pricing and manage blocked slots
- ❌ Cannot modify core company settings

### 3. OFFICE_STAFF - Administrative Support

**Can:**
- ✅ Create and edit bookings
- ✅ View customer information
- ✅ Record payment transactions
- ✅ Manage notifications
- ❌ Cannot modify pricing or manage agents

### 4. ACCOUNTING_MANAGER - Finance Operations

**Can:**
- ✅ View and record payment transactions
- ✅ Generate payment reports
- ✅ Track refunds and cancellations
- ❌ Cannot modify bookings or pricing

### 5. SALES_AGENT - Booking Creation

**Can:**
- ✅ Create own bookings only
- ✅ View customer information
- ✅ Assign crews to own bookings
- ✅ View commission tracking
- ❌ Cannot see other agents' bookings

### 6. INSTRUCTOR - Training Specialist

**Can:**
- ✅ Create instruction bookings
- ✅ Track hourly rates earned
- ✅ View assigned bookings

### 7. CAPTAIN - Boat Captain (Crew)

**Can:**
- ✅ View upcoming assigned charters
- ✅ View fees earned per charter
- ❌ Cannot create bookings

### 8. SAILOR - Crew Member (Crew)

**Can:**
- ✅ View assigned charter duties
- ✅ View fees earned per charter
- ❌ Cannot create bookings

---

## Booking Management

### Creating a Booking - Two Methods

**Method 1: Quick Book** (Fast, for simple bookings)
1. Click "Quick Book"
2. Select boat → date → duration → customer → package → confirm
3. 15-minute hold activated
4. Send payment link to customer

**Method 2: Advanced Booking** (Complex bookings with multiple crew)
1. Click "Advanced Booking"
2. Step-by-step form for: boat, date, captain, sailors, package, special requests
3. Customize pricing if needed
4. Create booking

### Booking Status Workflow

```
pending_hold (15 min) → confirmed (after payment) → completed
                    ↓                                    ↓
                 expired → cancelled               archived
```

**Status Meanings:**
- **pending_hold**: Booking created, awaiting confirmation (15-min timer)
- **confirmed**: Payment received, booking locked in
- **completed**: Charter finished successfully
- **cancelled**: Cancelled by customer/admin
- **no_show**: Customer didn't appear

### Managing Existing Bookings

**To edit:**
1. Go to Bookings
2. Click on booking
3. Click "Edit Booking"
4. Modify fields (date, customer, package, crew)
5. Save - customer notified

**To cancel:**
1. Open booking
2. Click "Cancel Booking"
3. System shows refund amount (based on policy)
4. Confirm - refund processed automatically

**15-Minute Hold Explained:**
- When you create booking, it's reserved for 15 minutes
- Prevents other users from booking same time
- Hold expires automatically if not confirmed
- Gives customer time to review and pay

---

## Crew & Staff Management

### Adding Team Members

1. Go to **Agents** → **Add New Agent**
2. Enter: first name, last name, email, phone
3. Select role: Captain, Sailor, Sales Agent, Office Staff, Instructor
4. Set compensation:
   - **Hourly Rate**: For captains/sailors (€/hour)
   - **Commission**: For agents (% of booking or fixed amount)
5. Set Active status (can log in)
6. Click "Create Agent"
7. Email sent to new person with setup link

### Assigning Crew to Bookings

**Captain Assignment:**
- One captain per booking
- Select from dropdown (system shows available captains)
- Captain fee automatically calculated
- Captain can see assignment in "My Bookings"

**Sailor Assignments:**
- Multiple sailors per booking
- Add/remove sailors individually
- Each sailor sees assignment in "My Bookings"
- All fees calculated and tracked

### Archiving (Deactivating) Staff

**Why archive instead of delete?**
- Preserves all historical data (bookings, earnings)
- Maintains audit trail
- Can be reactivated later
- Better for compliance

**To archive:**
1. Go to Agents
2. Click Edit on staff member
3. Uncheck "Active (agent can log in)"
4. Save - staff member archived
5. Cannot log in or be assigned to new bookings

**To restore:**
1. Filter agents by "Inactive"
2. Click Edit on archived staff member
3. Check "Active (agent can log in)"
4. Save - staff member can now log in

### Viewing Staff Earnings

**As Admin:**
- Go to Agents
- See "Pending Commission" on each row
- Click staff name for detailed breakdown
- See all bookings and commissions earned

**As Captain/Sailor:**
- Log in and go to "My Bookings" (mobile)
- See upcoming assignments and fee for each
- Dashboard shows total earnings this month

---

## Pricing & Rates

### Understanding Pricing Structure

```
Total Price = Base Price (boat + duration)
            + Package Add-ons (drinks/food)
            + Captain Fee (if assigned)
            + Sailor Fees (if assigned)
```

### Setting Boat Pricing

1. Go to **Pricing** page
2. Click "Add New Pricing" or select existing boat
3. For each duration (2h, 4h, 6h, 8h, full-day):
   - Enter base price (price with no crew/extras)
4. For each package type:
   - Set additional price or percentage markup
5. Save pricing

**Example Price Structure:**

| Boat | Duration | Base | Charter Only | +Drinks | +Food | +Premium |
|-----|----------|------|--------------|---------|-------|----------|
| Sailboat A | 2h | €150 | €150 | €200 | €180 | €250 |
| Motorboat B | 4h | €350 | €350 | €530 | €480 | €680 |

### Bulk Copy Pricing

1. Go to **Pricing**
2. Click "Copy Pricing" on boat to copy FROM
3. Select destination boat(s)
4. Choose what to copy: base prices, add-ons, override existing
5. Click "Copy Pricing"

**Useful for:**
- Creating similar boats with same pricing
- Rolling out price changes across fleet
- Updating multiple boats at once

### Commission Tracking

**For Sales Agents:**
- Commission automatically calculated when you create booking
- Percentage commission: % of booking price
- Fixed commission: flat amount per booking
- Combined: both applied

**Example:** 10% + €5 fixed on €400 booking = €45 commission

**Viewing Commission:**
1. Go to **Agents** page
2. Each agent shows "Pending Commission"
3. Click agent name for detailed breakdown
4. See all bookings and commission amounts

---

## Payment Processing

### Payment Status Overview

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **Pending** | Payment not yet received | Send payment link |
| **Partial** | Some payment received | Collect remaining |
| **Paid** | Full payment received | Confirm booking |
| **Refunded** | Customer refund processed | Archive booking |

### Recording Manual Payments

1. Go to **Payments** page
2. Find booking in "Pending Payments"
3. Click "Record Payment"
4. Enter:
   - Payment method (Cash, Card, Transfer, Other)
   - Amount paid
   - Transaction reference
   - Payment date
   - Any notes
5. Save - booking marked as paid
6. Receipt email sent to customer

**Payment Methods:**
- Cash: Payment in person
- Card: Customer paid via card terminal
- Transfer: Customer made bank transfer
- Other: Check, credit, gift card, etc.

### Sending Payment Links (Stripe)

1. Open booking detail page
2. Click "Send Payment Link"
3. Email sent to customer with Stripe payment link
4. Customer clicks link, enters card details
5. Payment processed automatically
6. You receive notification when paid
7. Booking status updates to "Paid"

**Stripe Details:**
- 2.9% + €0.30 fee per transaction
- International cards supported
- Real-time confirmation
- 3D Secure fraud protection

### Refunds & Cancellations

When booking cancelled:

1. Open booking detail
2. Click "Cancel Booking"
3. System calculates refund:
   - Based on cancellation policy
   - Based on days until charter date
   - Shows percentage and amount
4. Confirm cancellation
5. Refund processed automatically
6. Customer notified

**Refund Schedule (Example):**
- 7+ days before: 100% refund
- 3-6 days before: 50% refund
- 1-2 days before: 0% refund (non-refundable)

---

## Customer Portal

### Generating Shareable Links

1. Open booking detail page
2. Click "Share with Customer"
3. A unique secure link is generated
4. Copy and send via: email, WhatsApp, SMS, etc.
5. Link remains active for 30 days

### What Customers Can Do

**On Customer Portal:**
1. **View Booking Details**
   - Date, time, duration, boat
   - Captain and crew names
   - Number of passengers
   - Special requests
   - Price breakdown
   - Weather forecast

2. **Request Changes**
   - Request different date/time
   - Request different package
   - Request different passenger count
   - Send special requests
   - Request is sent to office staff

3. **Make Payment**
   - Click "Pay Now" button
   - Securely pay via Stripe
   - Get receipt immediately
   - Booking auto-confirms when paid

4. **View Weather**
   - Real-time marine forecast
   - Wind, waves, visibility
   - Safety recommendations
   - Weather alerts if conditions poor

### Processing Change Requests

When customer submits change request:

1. You receive notification
2. Review requested change
3. Options:
   - **Approve**: Accept change, notify customer
   - **Reject**: Decline change, explain to customer
   - **Modify**: Counter-offer different change
4. Click action, customer notified
5. Booking updates and confirmation sent

---

## Reports & Analytics

### Dashboard Overview

Main dashboard shows:

**Key Metrics:**
- Active Boats: Available boats to book
- Today's Charters: Number of charters happening now
- Pending Payments: Total revenue waiting for payment
- This Month Revenue: Total income year-to-date

**Quick Stats:**
- Revenue by agent (bar chart)
- Bookings by status (pie chart)
- Upcoming charters (next 7 days)
- Team performance (sales, revenue, commission)

### Revenue Reports

1. Go to **Reports** page
2. Select date range (preset or custom)
3. View reports:

**Revenue Summary**
- Total revenue for period
- Total cost (captain, sailor, fuel fees)
- Net profit
- Average booking value

**Revenue by Agent**
- Bookings created per agent
- Total revenue generated
- Commission owed
- Click agent for drill-down details

**Revenue by Boat**
- Bookings taken per boat
- Revenue generated
- Occupancy rate
- Identify best/worst performing boats

**Revenue by Duration**
- 2h, 4h, 6h, 8h, full-day bookings
- Volume and revenue per duration
- Identify popular durations

### Booking Status Reports

- **Confirmed**: Locked in by customer
- **Cancelled**: Cancelled by customer (shows refund %)
- **No-Show**: Customer didn't appear
- **Completed**: Charter finished successfully
- **Pending**: Awaiting confirmation

**Analysis:**
- Cancellation rate
- No-show rate
- Completion rate
- Trend over time

### Boat Utilization

1. Select boat from dropdown
2. See for selected time period:
   - Total available hours
   - Total booked hours
   - Utilization % (booked ÷ available)
   - Revenue per hour

**Use to:**
- Identify underperforming boats
- Plan maintenance during low-booking periods
- Price adjust based on demand

### Agent Performance Reports

See each agent's metrics:
- Bookings created
- Total revenue generated
- Commission owed
- Average booking value
- Cancellation rate

**Use to:**
- Evaluate agent performance
- Adjust commission structure
- Identify top performers
- Plan training needs

### Exporting Reports

1. Generate report with date range and filters
2. Click "Export to CSV" button
3. File downloads to your computer
4. Open in Excel, Google Sheets, etc.

---

## Boat Fleet Management

### Adding a New Boat

1. Go to **Fleet** page
2. Click "Add New Boat"
3. Fill in:
   - Name: Unique boat name (required)
   - Type: Sailboat, Motorboat, or Jetski (required)
   - Capacity: Max passengers (required)
   - Description: Features, amenities (optional)
   - Image: Upload boat photo (optional)
4. Set Default Captain (optional)
5. Set Fuel Consumption rates
6. Click "Create Boat"
7. Boat ready to accept bookings

### Editing Boat Information

1. Go to **Fleet** page
2. Click "Edit" on boat
3. Modify: name, type, capacity, description, captain, fuel rates
4. Click "Save Changes"

### Configuring Fuel Consumption

Each boat tracks fuel for cost calculations:

1. Go to **Fleet**
2. Click boat name to open detail
3. Click "Fuel Configuration"
4. Enter:
   - Consumption Rate: Liters per hour
   - Fuel Price: €/liter
5. Save

**Fuel Cost Calculation:**
- Cost = Consumption Rate × Duration Hours × Price/Liter
- Example: 20L/h × 4 hours × €1.50/L = €120 fuel cost
- Shows in booking cost breakdown

### Setting Default Captain

1. Go to **Fleet**
2. Click boat to edit
3. Find "Default Captain" field
4. Select captain from dropdown
5. Save

**When default captain assigned:**
- New bookings auto-suggest this captain
- Can override for specific bookings
- Useful for boats captain usually works with

### Activating/Deactivating Boats

**To deactivate:**
1. Go to **Fleet**
2. Click "Edit" on boat
3. Uncheck "Active Status"
4. Save - boat no longer appears in booking dropdowns

**To reactivate:**
1. Go to **Fleet**
2. Click "Edit" on boat
3. Check "Active Status"
4. Save - boat available for bookings again

### Deleting a Boat

Only available if boat has NO bookings:

1. Go to **Fleet**
2. Click "Edit" on boat
3. Click "Delete Boat" button
4. Confirm deletion
5. Boat permanently deleted (only if no bookings)

**If boat has bookings:**
- Cannot delete directly
- Deactivate boat instead
- Keep data for historical records

---

## System Settings

### Company Settings (Admin Only)

1. Go to **Settings** → **Company Settings**
2. Configure:

**Basic Information:**
- Company Name: Your business name
- Description: About your company
- Website: Link to your website (optional)

**Location:**
- Address: Business address
- City & Country: For location-based features
- Coordinates: Auto-set for weather services

**Contact Information:**
- Phone: Main business phone
- Email: Business email for notifications
- Support Email: Customer support contact

**Package Types:**
- Available packages: charter only, with drinks, with food, with instruction, with premium service
- Enable/disable packages per company

**Add-on Pricing:**
- Drinks per person: €X when "drinks" package selected
- Food per person: €Y when "food" package selected

### Cancellation Policies (Admin Only)

Define refund percentages based on cancellation timing:

1. Go to **Settings** → **Cancellation Policies**
2. Edit policy:

**Refund Schedule:**
- 7+ days before: X% refund
- 3-6 days before: X% refund
- 1-2 days before: X% refund
- Day of/after: X% refund (typically 0%)

3. Click "Save Policy"
4. Automatically applied when cancelling bookings

### Notification Preferences

Enable/disable notification types:

1. Go to **Notifications** page
2. For each event type, toggle:
   - ☐ Email notifications
   - ☐ SMS notifications
   - ☐ In-app notifications

**Notification Events:**
- Booking confirmation
- Payment reminder (24h before)
- Cancellation notification
- Payment received
- Change request received

---

## Mobile App Guide

### Installation

**iOS (Apple):**
1. Open Safari
2. Go to `https://navibook.com`
3. Tap Share button (bottom)
4. Select "Add to Home Screen"
5. Name the app, tap "Add"

**Android (Google):**
1. Open Chrome
2. Go to `https://navibook.com`
3. Tap menu (⋮)
4. Select "Install app" or "Add to Home screen"
5. Confirm installation

### Navigation

**Bottom Navigation (Mobile):**
- **Home**: Dashboard/quick actions
- **Calendar**: Visual booking timeline
- **Bookings**: Your bookings list
- **Customers**: Customer lookup
- **Menu**: Additional pages

### Crew View (Captains & Sailors)

**"My Bookings" Tab:**
- Shows all upcoming assigned charters
- Tap charter to see details:
  - Date, time, duration
  - Boat name and type
  - Passenger count
  - Your fee for this charter
  - Special requests
  - Assigned crew

### Agent View (Sales)

**Quick Book:**
- Streamlined form for fast entry
- Select boat → date/time → duration
- Enter customer info → confirm

**Calendar:**
- Visual timeline of all boats
- See availability at a glance
- Tap time slot to create booking

**Bookings:**
- Your created bookings
- Sort by date or status
- Tap to view/edit details
- One-click payment link send

### Mobile Features

**Responsive Design:**
- Auto-adjusts to screen size
- Single column on small phones
- Larger buttons for touch
- Optimized scrolling

**Offline Support:**
- View cached data offline
- Create bookings (sync when online)
- View past bookings
- Limited without internet

**Notifications:**
- Push notifications for assignments
- Payment status updates
- Booking reminders

---

## Troubleshooting

### Login Issues

**Cannot log in:**
1. Verify username (email) is correct
2. Check password (case-sensitive, no extra spaces)
3. Click "Forgot Password" on login page
4. Check email for reset link
5. Set new password

**Account locked:**
- Wait 15 minutes and try again
- Or reset password via email

### Booking Issues

**Boat appears unavailable:**
1. Check if date is blocked (maintenance)
2. Check if time overlaps with existing booking
3. Check captain isn't already booked at that time
4. Try different time or captain

**Hold expired:**
1. 15-minute holds auto-expire
2. Create new booking again
3. Make sure to pay before hold expires

**Cannot save customer information:**
1. Check all required fields are filled (name, email, etc.)
2. Check email format is valid (name@domain.com)
3. Refresh page and try again
4. Try different browser

### Payment Issues

**Payment link doesn't work:**
1. Check link hasn't expired (30 days max)
2. Regenerate payment link
3. Check email spam folder
4. Try different browser

**Customer paid but booking not updated:**
1. Wait 1-2 minutes for sync
2. Refresh page to update
3. Check Stripe dashboard for transaction

**Refund not processed:**
1. Check booking status is "Cancelled"
2. For Stripe: refund takes 3-5 business days
3. For manual: record refund in system separately

### Crew Assignment Issues

**Can't find captain:**
1. Check captain is active (not archived)
2. Check captain not already booked at that time
3. Check captain has "Captain" role
4. Type part of captain's name in dropdown to filter

**Sailor won't add:**
1. Check sailor is active
2. Check sailor not already booked at that time
3. Check sailor has "Sailor" role
4. Add new sailor if doesn't exist yet

### Report Issues

**Reports show zero data:**
1. Check date range
2. Check filters aren't too restrictive
3. Check bookings exist in system
4. Refresh page

**Export file is empty:**
1. Ensure report has data before exporting
2. Adjust date range if needed
3. Try exporting again

### Performance Issues

**App is slow:**
1. Check internet connection (need 5Mbps+)
2. Close other apps/tabs
3. Clear browser cache (F5, Ctrl+Shift+R)
4. Try different browser

**Buttons won't respond:**
1. Wait a moment (network requests take time)
2. Refresh page
3. Check internet connection
4. Log out and log back in

### Data Issues

**Bookings disappeared:**
1. Check status filters (may be filtered to show only "confirmed")
2. Check date range filters
3. Check role permissions (agents only see own bookings)
4. Contact admin if should exist but doesn't

**Commission not calculating:**
1. Check commission is set on agent (not 0%)
2. Check booking was created by agent (not admin)
3. Check booking is confirmed (pending don't count)
4. Wait up to 1 hour for calculation

---

## Key Terms & Concepts

| Term | Meaning |
|------|---------|
| **Charter** | A boat rental booking |
| **Hold** | 15-minute reservation preventing double-booking |
| **Confirmed** | Payment received, booking locked in |
| **Crew** | Captain and/or sailors assigned to booking |
| **Commission** | Payment to agent for creating booking |
| **Refund** | Money returned to customer for cancellation |
| **No-Show** | Customer didn't appear for booked charter |
| **Deposit** | Payment due upfront before charter |
| **Package** | Add-ons like drinks or food service |
| **Portal** | Customer self-service website |
| **Webhook** | Automatic notification from Stripe |
| **RLS** | Row-Level Security (database access control) |

---

## FAQ

**Q: How long is a booking hold?**
A: 15 minutes. After that, if not confirmed, the time slot opens for other users.

**Q: Can customers modify their bookings?**
A: Yes, via the customer portal. They can request date/time changes. Admin approves/rejects.

**Q: What if a captain cancels?**
A: Archive them (set inactive). Reassign their upcoming charters to a different captain.

**Q: Can I create bookings in the past?**
A: No. You can only book future dates.

**Q: What if a customer loses their portal link?**
A: Generate a new shareable link from the booking detail page.

**Q: Can salespeople see other salespeople's bookings?**
A: No. Agents only see bookings they created. Admins see everything.

**Q: How do I adjust prices after booking?**
A: Edit the booking detail and adjust the price manually. Confirmation sent to customer.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions). Mobile: Safari (iOS), Chrome (Android).

---

## Key Numbers to Remember

- **15 minutes**: Booking hold duration
- **30 days**: Payment link expiration
- **5 days**: Pending payment reminder
- **2.9% + €0.30**: Stripe payment fee

---

## Quick Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Go to Bookings |
| `Ctrl/Cmd + Q` | Go to Quick Book |
| `Esc` | Close dialogs |
| `Enter` | Submit forms |

---

## Need Help?

1. Check troubleshooting section above
2. Re-read relevant manual section
3. Contact your system administrator
4. Submit support ticket with details

---

**NaviBook Day-Charter Manual**
**Version 1.0 | December 2025**
**For more information, visit: https://navibook.com**

# NaviBook Day-Charter - Complete User Manual

**Version:** 1.0
**Last Updated:** December 2025
**Application:** Boat Charter Management System

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Features by Role](#core-features-by-role)
5. [Booking Management](#booking-management)
6. [Crew & Staff Management](#crew--staff-management)
7. [Pricing & Rates](#pricing--rates)
8. [Payment Processing](#payment-processing)
9. [Customer Portal](#customer-portal)
10. [Reports & Analytics](#reports--analytics)
11. [Boat Fleet Management](#boat-fleet-management)
12. [System Settings](#system-settings)
13. [Mobile App Guide](#mobile-app-guide)
14. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is NaviBook?

NaviBook is a complete **boat charter management platform** designed for Mediterranean day-charter businesses. It provides:

- **Booking Management**: Create, confirm, and manage charter reservations
- **Crew Scheduling**: Assign captains and sailors to charters
- **Real-Time Availability**: Prevent double-bookings with automatic conflict detection
- **Integrated Payments**: Accept online payments via Stripe and manual payment recording
- **Customer Portal**: Shareable links for customers to view and modify bookings
- **Reporting & Analytics**: Comprehensive business insights
- **Mobile-First Design**: Full functionality on smartphones and tablets
- **Multi-Tenancy**: Separate data for multiple charter companies

### System Requirements

- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** (always required)
- **Mobile device** (iOS 12+ or Android 8+) for mobile app
- **Email address** for account creation and notifications

---

## Getting Started

### First Login

1. Open NaviBook in your browser: `https://navibook.com`
2. Click **"Login"** at the top right
3. Enter your email and password
4. You'll be directed to your role-specific dashboard

**Demo Account (Testing):**
- Email: `admin@navibook.com`
- Password: `Admin123!`

### Initial Setup (Admins Only)

Before using the system, administrators must complete:

1. **Add Your Fleet**
   - Go to: **Fleet** → **Add New Boat**
   - Enter: Boat name, type (sailboat/motorboat/jetski), capacity
   - Set: Default captain, fuel consumption rates

2. **Configure Pricing**
   - Go to: **Pricing** → **Add Pricing**
   - Set: Price per boat, per duration (2h, 4h, 6h, 8h, full-day)
   - By package type (charter only, with drinks, with food, premium)

3. **Add Your Team**
   - Go to: **Agents** → **Add Agent**
   - Create accounts for: Sales agents, captains, sailors, office staff
   - Set: Roles, commission percentages, hourly rates

4. **Configure Company Settings**
   - Go to: **Settings** → **Company Settings**
   - Set: Company name, location, cancellation policy, refund rates

---

## User Roles & Permissions

NaviBook has **9 distinct user roles** with different capabilities:

### 1. ADMIN
**Full system access - Business owner/manager level**

Permissions:
- ✅ Create, edit, cancel all bookings
- ✅ Manage all agents, captains, sailors
- ✅ Configure pricing and rates
- ✅ Access all payments and financial reports
- ✅ Modify company settings and policies
- ✅ Archive/delete agents
- ✅ View all customer data
- ✅ Generate comprehensive reports

### 2. OPERATIONS_MANAGER
**Operations oversight - Manager level**

Permissions:
- ✅ Create and edit all bookings
- ✅ Manage agents and crew assignments
- ✅ View payments and record transactions
- ✅ Access reports and analytics
- ✅ Create pricing and manage blocked slots
- ✅ Cannot modify core company settings
- ✅ Cannot change cancellation policies

### 3. OFFICE_STAFF
**Administrative support - Administrative level**

Permissions:
- ✅ Create and edit bookings
- ✅ View customer information
- ✅ Record payment transactions
- ✅ Manage notifications
- ✅ Cannot modify pricing or agent management
- ✅ Cannot access financial reports
- ✅ Limited to operational support

### 4. ACCOUNTING_MANAGER
**Finance operations - Finance specialist**

Permissions:
- ✅ View and record payment transactions
- ✅ Generate payment reports
- ✅ Track refunds and cancellations
- ✅ Cannot modify bookings
- ✅ Cannot create pricing
- ✅ Cannot manage agents

### 5. SALES_AGENT
**Booking creation - Sales representative**

Permissions:
- ✅ Create bookings (own bookings only)
- ✅ View customer information
- ✅ Assign crews to own bookings
- ✅ View commission tracking
- ✅ Cannot view other agents' bookings
- ✅ Cannot modify pricing or agents
- ✅ Cannot access financial data

### 6. INSTRUCTOR
**Training specialist - Sailing school**

Permissions:
- ✅ Create instruction bookings
- ✅ Track hourly rates earned
- ✅ View assigned bookings
- ✅ Cannot modify pricing
- ✅ Cannot manage other staff

### 7. CAPTAIN
**Boat captain - Crew level**

Permissions:
- ✅ View assigned upcoming charters
- ✅ View fees earned per charter
- ✅ Cannot create bookings
- ✅ Cannot modify prices
- ✅ Mobile-first experience

### 8. SAILOR
**Crew member - Crew level**

Permissions:
- ✅ View assigned charter duties
- ✅ View fees earned per charter
- ✅ Cannot create bookings
- ✅ Cannot modify anything
- ✅ Mobile-first experience

### 9. COMPANY_ADMIN (Legacy)
**Retained for backward compatibility - Use ADMIN instead**

---

## Core Features by Role

### For ADMIN / OPERATIONS_MANAGER

#### Dashboard Overview
- Quick stats: Active boats, today's bookings, pending payments
- Revenue summary: Total revenue, by boat, by agent
- Upcoming charters: Next 7 days at a glance
- Team performance: Bookings and commission by agent
- Quick actions: New booking, add boat, add agent

#### Pages Available
| Page | Purpose | Access |
|------|---------|--------|
| Dashboard | Business overview | ✓ All admins |
| Bookings | Full booking list | ✓ All admins |
| Booking Detail | Edit any booking | ✓ All admins |
| Calendar | Visual timeline | ✓ All admins |
| Advanced Booking | Create complex bookings | ✓ All admins |
| Quick Book | Fast booking creation | ✓ All admins |
| Pricing | Configure rates | ✓ Admin, Ops Manager |
| Fleet | Manage boats | ✓ Admin, Ops Manager |
| Agents | Manage staff | ✓ Admin, Ops Manager |
| Customers | Customer database | ✓ All admins |
| Payments | Payment management | ✓ Admin, Accounting |
| Reports | Analytics & reports | ✓ Admin, Ops Manager |
| Waitlist | Customer queue | ✓ Admin, Ops Manager |
| Blocked Slots | Maintenance blocks | ✓ Admin, Ops Manager |
| Notifications | Notification history | ✓ All admins |
| Weather | Marine forecasts | ✓ All admins |
| Settings | System configuration | ✓ Admin only |

### For SALES_AGENT

#### Dashboard
- Your upcoming bookings
- Your commission tracking
- Quick booking creation button
- Pending customer actions

#### Pages Available
- **Quick Book**: Fast booking creation
- **Calendar**: View all boats (read-only)
- **My Bookings**: Bookings you created
- **Customers**: Customer lookup and notes
- **Waitlist**: Check customer preferences
- **Notifications**: Your booking alerts

**Restrictions:**
- Cannot view other agents' bookings
- Cannot modify pricing
- Cannot assign sailors (only captain)
- Cannot access financial reports
- Cannot manage company settings

### For CAPTAINS / SAILORS (Crew)

#### Mobile Dashboard ("My Bookings")
- Upcoming assigned charters
- Charter details (date, time, boat, passenger count)
- Fee earned for each charter
- Past assignments and earnings

#### Pages Available (Mobile-Optimized)
- **My Bookings**: Your assigned charters
- **Dashboard**: Quick charter preview (if on desktop)

**Restrictions:**
- Cannot create bookings
- Cannot modify charter details
- Cannot assign themselves
- Can only view their own assignments
- Cannot access pricing or financial data

### For OFFICE_STAFF

#### Pages Available
- **Bookings**: View all, create/edit bookings
- **Quick Book**: Create bookings quickly
- **Customers**: Customer information and notes
- **Payments**: Record manual payments
- **Notifications**: Manage notification preferences
- **Waitlist**: Add/remove from customer waitlist

**Restrictions:**
- Cannot access financial reports
- Cannot modify pricing
- Cannot manage agents or captains
- Cannot change company settings
- Cannot view commission data

---

## Booking Management

### Creating a Booking

NaviBook provides two methods to create bookings:

#### Method 1: Quick Book (Recommended for Fast Entry)

**Perfect for:** Fast charter creation, simple requirements

1. Click **"Quick Book"** in navigation or Dashboard
2. **Select Boat**
   - Dropdown list of available boats
   - Shows boat type and capacity

3. **Choose Date & Time**
   - Date picker shows unavailable dates grayed out
   - Time selection with 24-hour format
   - Duration dropdown: 2h, 4h, 6h, 8h, full-day

4. **Enter Customer Details**
   - First name (required)
   - Last name (required)
   - Email (required)
   - Phone (optional)
   - Number of passengers (required)

5. **Select Package Type**
   - Charter only (no extras)
   - With drinks per person
   - With food per person
   - Premium (drinks + food)

6. **Assign Captain** (optional)
   - Dropdown filters captains available at selected time
   - Set captain fee

7. **Review Pricing**
   - Base price: Boat + duration + package
   - Captain fee: If assigned
   - Total price: Sum of all fees

8. **Confirm Booking**
   - Creates a **15-minute hold**
   - Hold prevents other users from booking same time
   - Confirmation email sent to customer
   - Payment link can be sent to customer

**The 15-Minute Hold:**
- Once confirmed, boat is reserved for 15 minutes
- Gives customer time to review details
- Expires automatically if not confirmed
- Expired holds free up boat for others

#### Method 2: Advanced Booking (Complex Charters)

**Perfect for:** Multiple sailors, special requests, complex pricing

1. Click **"Advanced Booking"** in navigation
2. **Step 1: Boat & Date**
   - Select boat and date/time with availability check
   - Multi-select date picker for blocked slots view

3. **Step 2: Duration & Passengers**
   - Choose duration (2h - 8h)
   - Enter number of passengers
   - Set number of required sailors

4. **Step 3: Captain Assignment**
   - Dropdown of available captains
   - Shows captain hourly rate
   - Can leave unassigned

5. **Step 4: Sailor Assignments**
   - Search and add sailors individually
   - Remove sailors with ✕ button
   - Shows hourly rates per sailor
   - Each sailor appears in "My Bookings"

6. **Step 5: Package & Requests**
   - Select package type
   - Special requests/notes field
   - Payment deposit amount (optional)

7. **Step 6: Price Customization**
   - Review all calculated prices
   - Can adjust individual costs
   - Final total price

8. **Confirm & Create**
   - Creates booking with all details
   - Sends confirmation email
   - Hold timer starts (15 minutes)

### Editing an Existing Booking

1. Navigate to **Bookings** → Find booking in list
2. Click booking to open detail page
3. Click **"Edit Booking"** button (top right)
4. Modify any field:
   - Date/time/duration
   - Customer details
   - Package type
   - Captain/sailor assignments
   - Special requests
   - Pricing customization
5. Click **"Save Changes"**
6. Confirmation email sent to customer if major changes

**What you can edit:**
- ✅ Date, time, duration
- ✅ Customer details
- ✅ Package type
- ✅ Captain/sailor crew
- ✅ Special requests
- ✅ Payment amount due

**What you cannot edit:**
- ❌ Boat (create new booking instead)
- ❌ Completed bookings
- ❌ Cancelled bookings

### Booking Status Workflow

```
pending_hold (15 min)
    ↓
confirmed ←─── payment received
    ↓
completed ← charter finished
    ↓
archived

Alternative paths:
pending_hold → [expired/timeout] → cancelled
confirmed → cancelled (by admin/customer)
confirmed → no_show (customer didn't appear)
```

**Status Meanings:**

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **pending_hold** | Booking created, awaiting confirmation | Send payment link to customer |
| **confirmed** | Booking confirmed, payment received | Day before: crew confirmation |
| **completed** | Charter finished successfully | Archive booking |
| **cancelled** | Booking cancelled by customer/admin | Process refund if applicable |
| **no_show** | Customer didn't appear for charter | Record notes, process refund |

### Confirming a Pending Booking

When status is `pending_hold`:

1. Open booking in Bookings list
2. Click **"Confirm Booking"** button
   - Or send customer payment link
   - Or record payment manually
3. Once payment received, click **"Mark as Paid"**
4. Status changes to `confirmed`
5. Crew receives assignment notification

### Cancelling a Booking

1. Open booking detail page
2. Click **"Cancel Booking"** button
3. Confirm cancellation in dialog
4. System automatically calculates refund:
   - Based on cancellation policy
   - Based on days until charter date
   - Shows refund amount before confirming
5. Booking status → `cancelled`
6. Customer receives refund notification

**Cancellation Policy Example:**
- 7+ days before: 100% refund
- 3-7 days before: 50% refund
- Less than 3 days: 0% refund (non-refundable)

### Boat Unavailability & Conflicts

The system prevents double-bookings:

- **Real-time checking**: Cannot book if boat already booked
- **Grayed out dates**: Unavailable dates shown in light gray
- **Conflict notification**: If you try to book taken time, error message explains conflict
- **Blocked slots**: Maintenance or closure blocks appear as unavailable
- **Hold system**: 15-minute holds prevent other users from booking

**What prevents booking a boat:**
- ❌ Another booking at same time
- ❌ Crew member (captain/sailor) already assigned elsewhere
- ❌ Maintenance block in that timeframe
- ❌ Boat marked as inactive/out of service

---

## Crew & Staff Management

### Adding a New Crew Member

1. Go to **Agents** page
2. Click **"+ Add New Agent"** button
3. Fill in personal information:
   - First name (required)
   - Last name (required)
   - Email (required, unique)
   - Phone (optional)
4. Select role from dropdown:
   - **Sales Agent**: Creates bookings
   - **Captain**: Crew, commands boat
   - **Sailor**: Crew member
   - **Instructor**: Sailing school instructor
   - **Office Staff**: Administrative support
5. Configure compensation:
   - **Commission %**: For agents (% of booking price)
   - **Commission Fixed**: For agents (fixed amount per booking)
   - **Hourly Rate**: For captains/sailors (€/hour)
6. Set **Active Status**:
   - Active: Can log in and work
   - Inactive: Cannot log in, but history preserved (archived)
7. Click **"Create Agent"**
   - Temporary password is generated
   - Activation email sent to new user
   - User must set their own password on first login

### Editing Crew Information

1. Go to **Agents** page
2. Find crew member in list (search or filter by role)
3. Click **"Edit"** (pencil icon)
4. Modify any field:
   - Name, email, phone
   - Role
   - Commission/hourly rates
   - Active/inactive status (to archive)
5. Click **"Save Changes"**

### Archiving (Deactivating) Crew

**Why archive instead of delete?**
- Preserves historical data (bookings, earnings, payments)
- Maintains audit trail
- Can be reactivated later if needed
- Better for compliance and reporting

**To archive:**
1. Go to **Agents** page
2. Click **"Edit"** on crew member
3. Uncheck **"Active (agent can log in)"**
4. Click **"Save Changes"**
4. Crew member no longer appears in active list
5. Cannot log in or be assigned to new charters

**To restore:**
1. Filter agents by **"Inactive"** status
2. Click **"Edit"** on archived crew member
3. Check **"Active (agent can log in)"**
4. Click **"Save Changes"**
5. Crew member can now log in and be assigned

### Assigning Crew to Bookings

Crew assignment happens during booking creation/editing:

**Assigning Captain:**
1. In Quick Book or Advanced Booking form
2. Find **"Assign Captain"** field
3. Click dropdown to see available captains
4. System filters captains NOT already booked at that time
5. Select captain, confirm fee amount
6. If you change to different captain, fee updates automatically

**Assigning Sailors:**
1. In Advanced Booking form (Step 4)
2. Find **"Sailor Assignments"** section
3. Search sailor by name or role
4. Click **"+ Add"** to add sailor
5. Repeat for multiple sailors
6. Click **"Remove"** (✕) to unassign sailor
7. All sailors receive notification of assignment

**Captain vs Sailor:**
- **One captain per booking**: Commands boat, responsible
- **Multiple sailors per booking**: Crew assistance
- **Both earn fees**: Based on hourly rate × duration
- **Both see assignment**: In "My Bookings" on mobile app

### Viewing Crew Earnings

**As Admin/Manager:**
1. Go to **Agents** page
2. Scroll to bottom to see statistics:
   - Total bookings assigned
   - Total revenue generated
   - Pending commission owed
3. Click crew member name for detailed history
4. View all bookings they created/worked on

**As Captain/Sailor:**
1. Log in and go to **"My Bookings"** (mobile)
2. See upcoming assignments
3. Each charter shows fee earned
4. Dashboard shows total earnings this month

---

## Pricing & Rates

### Understanding Pricing Structure

NaviBook uses **four-level pricing**:

```
Price = Base Price (boat + duration)
       + Package Add-ons (drinks/food)
       + Captain Fee (if assigned)
       + Sailor Fees (if assigned)
```

**Example:**
- Boat A: €200 base (2 hours)
- Package drinks: €50 (5 passengers × €10/person)
- Captain fee: €50/hour × 2 hours = €100
- Sailor fee: €30/hour × 2 hours × 2 sailors = €120
- **Total: €470**

### Setting Boat Pricing

1. Go to **Pricing** page
2. Click **"+ Add New Pricing"** or find existing boat
3. Select boat from dropdown
4. For each duration (2h, 4h, 6h, 8h, full-day):
   - Enter base price for boat
   - This is price with no crew or extras
5. For each package type:
   - Set additional price (added to base)
   - Or percentage markup
6. Click **"Save Pricing"**

**Example Pricing Structure:**

| Boat | Duration | Base Price | Charter Only | +Drinks | +Food | +Premium |
|-----|----------|-----------|--------------|---------|-------|----------|
| Sailboat A | 2h | €150 | €150 | €200 | €180 | €250 |
| Sailboat A | 4h | €280 | €280 | €380 | €340 | €480 |
| Motorboat B | 2h | €200 | €200 | €280 | €250 | €350 |
| Motorboat B | 4h | €350 | €350 | €530 | €480 | €680 |

### Bulk Copy Pricing

To copy pricing from one boat to another:

1. Go to **Pricing** page
2. Click **"Copy Pricing"** button on boat you want to copy FROM
3. Select destination boat(s)
4. Choose what to copy:
   - ☐ Base prices
   - ☐ Package add-ons
   - ☐ Override existing
5. Click **"Copy Pricing"**
6. All prices copied to destination boats

**Useful for:**
- Creating similar boats with same pricing
- Rolling out price changes across fleet
- Updating multiple boats at once

### Managing Package Add-on Costs

Package add-on costs are configured per company:

1. Go to **Settings** → **Company Settings**
2. Find **"Package Configuration"** section
3. Set per-person costs:
   - **Drinks cost per person**: €X per person
   - **Food cost per person**: €Y per person
4. Save changes

**How add-ons work:**
- When booking with "drinks" package: drinks_cost × passengers added to total
- When booking with "food" package: food_cost × passengers added to total
- When booking with "premium" package: (drinks + food) × passengers added

### Commission Tracking

**For Sales Agents:**

Commission automatically calculated when you create booking:
- **Percentage commission**: Fixed % of booking price
- **Fixed commission**: Flat amount per booking
- **Combined**: Both applied together

**Example:**
- Agent has: 10% commission + €5 fixed
- Booking price: €400
- Commission earned: (€400 × 10%) + €5 = €45

**Viewing Commission:**
1. Go to **Agents** page
2. Each agent row shows "Pending Commission"
3. Click agent name for detailed breakdown
4. See all bookings and commissions earned

---

## Payment Processing

### Understanding Payment Status

Bookings have payment tracking:

| Status | Meaning | Next Action |
|--------|---------|-------------|
| **Pending** | Payment not yet received | Send payment link to customer |
| **Partial** | Some payment received | Collect remaining amount |
| **Paid** | Full payment received | Ready for confirmation |
| **Refunded** | Customer refund processed | Booking archived |
| **Cancelled** | Booking cancelled, refund issued | N/A |

### Recording a Manual Payment

1. Go to **Payments** page
2. Find booking in "Pending Payments" list
3. Click **"Record Payment"** button
4. Enter payment details:
   - **Payment Method**:
     - Cash
     - Credit/Debit Card
     - Bank Transfer
     - Other
   - **Amount Paid**: €X
   - **Transaction Reference**: Invoice number or receipt ID
   - **Payment Date**: When payment received
   - **Notes**: Any additional info
5. Click **"Save Payment"**
6. Booking status updates to "Paid"
7. Receipt email sent to customer

**Payment Methods:**
- **Cash**: Payment in person
- **Card**: Customer paid via card terminal
- **Transfer**: Customer made bank transfer
- **Other**: Check, credit, gift card, etc.

### Sending Payment Links to Customers

To request payment via Stripe:

1. Open booking detail page
2. Click **"Send Payment Link"** button
3. Email is sent to customer with:
   - Link to Stripe payment page
   - Amount due
   - Booking details
   - 30-day expiration on link
4. Customer clicks link, enters card details
5. Payment processed automatically
6. You receive notification when paid
7. Booking status updates to "Paid"

**Stripe Payment Limitations:**
- 2.9% + €0.30 fee per transaction
- International cards supported
- 3D Secure for fraud prevention
- Real-time confirmation

**Alternative: Manual Payment Recording**
- No fees for cash/transfer
- Same day confirmation
- Requires reference number

### Refunds & Cancellations

When booking cancelled:

1. Open booking detail page
2. Click **"Cancel Booking"** button
3. System calculates refund amount:
   - Based on cancellation policy
   - Based on days until charter date
   - Shows percentage and amount
4. Confirm cancellation
5. Refund is calculated and noted
6. If paid by Stripe: Auto-refund issued
7. If paid cash/transfer: Manual refund recorded

**Refund Schedule (Example):**
- **7+ days before charter**: 100% refund (minus any platform fees)
- **3-6 days before charter**: 50% refund
- **1-2 days before charter**: 0% refund (non-refundable)
- **Day of charter**: 0% refund

**Note:** Modify refund schedule in **Settings** → **Cancellation Policies**

---

## Customer Portal

### Sharing a Booking with Customer

NaviBook provides secure shareable links so customers can:
- View booking details
- Request changes
- Make payments
- Check weather forecast

**To generate a shareable link:**

1. Open booking detail page
2. Click **"Share with Customer"** button
3. A unique secure link is generated
4. Copy link (appears as pop-up)
5. Send link to customer via:
   - Email
   - WhatsApp
   - SMS
   - Other messaging
6. Link remains active for 30 days

### What Customers Can Do

**On Customer Portal:**

1. **View Booking Details**
   - Date, time, duration, boat
   - Captain and crew names
   - Number of passengers
   - Special requests
   - Price breakdown
   - Weather forecast for charter day

2. **Request Changes**
   - Request different date/time
   - Request different package
   - Request different number of passengers
   - Send special requests/notes
   - Request is sent to office staff for approval

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
2. Go to **Bookings** → **Change Requests** section
3. Review requested change
4. Options:
   - **Approve**: Accept change, confirm with customer
   - **Reject**: Decline change, explain reason to customer
   - **Modify**: Counter-offer different change
5. Click action, notify customer
6. Booking updates and confirmation sent

---

## Reports & Analytics

### Dashboard Overview (Admin/Manager)

Main dashboard shows:

**Key Metrics:**
- **Active Boats**: How many boats available to book
- **Today's Charters**: Number of charters happening now
- **Pending Payments**: Total revenue waiting for payment
- **This Month Revenue**: Total income year-to-date

**Quick Stats:**
- Revenue by agent (bar chart)
- Bookings by status (pie chart)
- Upcoming charters (next 7 days)
- Team performance (sales, revenue, commission)

### Revenue Reports

1. Go to **Reports** page
2. Select date range:
   - Preset: This month, Last month, This year, All time
   - Custom: Choose start and end date
3. View reports:

**Revenue Summary**
- Total revenue for period
- Total cost (captain, sailor, fuel fees)
- Net profit
- Average booking value

**Revenue by Agent**
- Each agent shows:
  - Bookings created
  - Total revenue
  - Commission owed
- Sortable by any column
- Click agent for drill-down

**Revenue by Boat**
- Each boat shows:
  - Bookings taken
  - Revenue generated
  - Occupancy rate
  - Earnings per boat
- Identify best/worst performing boats

**Revenue by Duration**
- 2h, 4h, 6h, 8h bookings
- Volume and revenue per duration
- Popular durations

### Booking Status Reports

- **Confirmed**: Bookings confirmed by customer
- **Cancelled**: Bookings cancelled by customer (shows refund %)
- **No-Show**: Customer didn't appear
- **Completed**: Charter finished successfully
- **Pending**: Awaiting confirmation

**Analysis:**
- Cancellation rate (% of bookings cancelled)
- No-show rate (% didn't appear)
- Completion rate (% that happened)
- Trend over time

### Boat Utilization

1. Select boat from dropdown
2. See for selected time period:
   - Total available hours
   - Total booked hours
   - Utilization % (booked ÷ available)
   - Revenue per hour
   - Most popular durations

**Use to:**
- Identify underperforming boats
- Plan maintenance during low-booking periods
- Price adjust based on demand
- Retire unused boats

### Agent Performance Reports

See each agent's metrics:
- **Bookings created**: Total bookings
- **Total revenue generated**: Sum of booking prices
- **Commission owed**: Calculated based on settings
- **Average booking value**: Revenue ÷ bookings
- **Cancellation rate**: % of their bookings cancelled

**Use to:**
- Evaluate agent performance
- Adjust commission structure
- Identify top performers
- Plan training needs

### Exporting Reports

To export report data:

1. Generate report with date range and filters
2. Click **"Export to CSV"** button
3. File downloads to your computer
4. Open in Excel, Google Sheets, etc.
5. Use for further analysis, presentations, or records

---

## Boat Fleet Management

### Adding a New Boat

1. Go to **Fleet** page
2. Click **"+ Add New Boat"** button
3. Fill in boat details:

**Basic Information:**
- **Name**: Unique boat name (required)
- **Type**: Sailboat, Motorboat, or Jetski (required)
- **Capacity**: Max passengers (required)
- **Description**: Features, amenities, notes (optional)
- **Image**: Upload boat photo (optional)

**Operations:**
- **Default Captain**: Pre-select usual captain (optional)
- **Status**: Active (can be booked) or Inactive
- **Fuel Consumption**:
  - For motorboats: Liters per hour
  - For sailboats: Fixed rate (accounts for motor usage)
  - For jetskis: Consumption per hour

4. Click **"Create Boat"**
5. Boat appears in Fleet list
6. Ready to accept bookings

### Editing Boat Information

1. Go to **Fleet** page
2. Find boat in list
3. Click **"Edit"** (pencil icon)
4. Modify any field:
   - Name, type, capacity
   - Description or features
   - Default captain
   - Active/inactive status
   - Fuel consumption rates
5. Click **"Save Changes"**

### Configuring Fuel Consumption

Each boat has fuel tracking for cost calculations:

1. Go to **Fleet** page
2. Click boat name to open boat detail
3. Click **"Fuel Configuration"** section
4. Enter:
   - **Consumption Rate**: Liters per hour
   - **Fuel Price**: €/liter
5. Click **"Save Configuration"**

**Fuel Cost Calculation:**
- Cost = Consumption Rate × Duration Hours × Price/Liter
- Example: 20L/h × 4 hours × €1.50/L = €120 fuel cost
- Shows in booking cost breakdown
- Helps identify true profitability

### Setting Default Captain

To pre-assign a captain to a boat:

1. Go to **Fleet** page
2. Click boat to edit
3. Find **"Default Captain"** field
4. Select captain from dropdown
5. Save changes

**When default captain assigned:**
- New bookings auto-suggest this captain
- Can override for specific bookings
- Useful for boats captain usually works with

### Activating/Deactivating Boats

**To deactivate boat (remove from bookings):**

1. Go to **Fleet** page
2. Click **"Edit"** on boat
3. Uncheck **"Active Status"**
4. Click **"Save Changes"**
5. Boat no longer appears in booking dropdowns
6. Existing bookings unaffected

**To reactivate boat:**

1. Go to **Fleet** page
2. Click **"Edit"** on boat
3. Check **"Active Status"**
4. Click **"Save Changes"**
5. Boat available for bookings again

### Deleting a Boat

Only available if boat has NO bookings:

1. Go to **Fleet** page
2. Click **"Edit"** on boat
3. Click **"Delete Boat"** button at bottom
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
- **Company Name**: Your business name
- **Description**: About your company
- **Website**: Link to website (optional)

**Location:**
- **Address**: Business address
- **City & Country**: For location-based features
- **Coordinates**: Auto-set for weather services

**Contact Information:**
- **Phone**: Main business phone
- **Email**: Business email for notifications
- **Support Email**: Customer support contact

**Package Types:**
- **Available packages**: Charter only, with drinks, with food, with instruction, with premium service
- **Enable/disable** packages per company

**Add-on Pricing:**
- **Drinks per person**: €X when "drinks" package selected
- **Food per person**: €Y when "food" package selected
- Automatically added to booking total

### Cancellation Policies (Admin Only)

Define refund percentages based on cancellation timing:

1. Go to **Settings** → **Cancellation Policies**
2. Edit policy:

**Refund Schedule:**
- **7+ days before**: X% refund
- **3-6 days before**: X% refund
- **1-2 days before**: X% refund
- **Day of/after**: X% refund (typically 0%)

**Example Policy:**
- 7+ days: 100% refund (minus platform fees)
- 3-6 days: 50% refund
- 1-2 days: 25% refund
- Day of: 0% refund (non-refundable)

3. Click **"Save Policy"**
4. Automatically applied when cancelling bookings
5. Shows refund amount before confirming cancellation

### Notification Preferences

Enable/disable notification types:

1. Go to **Notifications** page
2. For each event type, toggle:
   - ☐ Email notifications
   - ☐ SMS notifications (if enabled)
   - ☐ In-app notifications

**Notification Events:**
- Booking confirmation
- Payment reminder (24h before)
- Cancellation notification
- Payment received
- Change request received
- Agent/crew notifications

---

## Mobile App Guide

### Installation

**iOS (Apple):**
1. Open Safari
2. Go to `https://navibook.com`
3. Tap Share button (bottom)
4. Select "Add to Home Screen"
5. Name the app, tap "Add"
6. App icon appears on home screen

**Android (Google):**
1. Open Chrome
2. Go to `https://navibook.com`
3. Tap menu (⋮)
4. Select "Install app" or "Add to Home screen"
5. Confirm installation
6. App appears in app drawer

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
  - Captain/crew assigned
- Can see past charters and earnings

**Dashboard:**
- Quick stats on earnings
- This month earnings
- Upcoming assignments
- Last payment date

### Agent View (Sales)

**Quick Book:**
- Streamlined form for fast entry
- Select boat → date/time → duration
- Enter customer info → confirm
- No complex fields, just essentials

**Calendar:**
- Visual timeline of all boats
- See availability at a glance
- Tap time slot to create booking
- Drag to reschedule if needed

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
- Team messages

---

## Troubleshooting

### Login Issues

**Problem: Cannot log in**

1. Verify username (email) is correct
2. Check password:
   - Passwords are case-sensitive
   - No spaces at beginning/end
3. Try resetting password:
   - Click "Forgot Password" on login page
   - Enter email
   - Check email for reset link
   - Click link to set new password
4. Check browser:
   - Clear cookies for navibook.com
   - Try different browser (Chrome, Firefox, Safari)
   - Disable browser extensions
5. If still issues:
   - Contact admin with email address
   - Admin can reset password manually

**Problem: Account locked after failed login attempts**
- Wait 15 minutes, try again
- Or reset password via email
- Contact admin if persistent

### Booking Issues

**Problem: Boat appears unavailable but shouldn't be**

1. Check dates carefully:
   - Date might be blocked by maintenance
   - Time slot might overlap with existing booking
   - Check calendar for color indicators
2. Check captain availability:
   - Selected captain might be assigned elsewhere
   - Try different captain or leave unassigned
3. Check blocked slots:
   - Go to **Blocked Slots** page
   - Look for maintenance blocks on that date
   - Contact admin to remove if error
4. Try different time:
   - Earlier or later time might be available
   - Check 15-minute increments if available

**Problem: Hold expired, booking didn't confirm**

1. 15-minute holds automatically expire
2. To re-book:
   - Go to **Quick Book** again
   - Create new booking with same details
   - Complete payment promptly
3. To extend hold:
   - Contact customer
   - Resend payment link
   - Confirm payment before hold expires

**Problem: Customer information won't save**

1. Check all required fields filled:
   - First name, last name, email
   - Email must be valid (name@domain.com)
   - Phone should be 10+ digits
2. Try refresh page
3. Check browser console for errors (F12)
4. Try different browser
5. Contact admin if error persists

### Payment Issues

**Problem: Payment link doesn't work**

1. Check link hasn't expired (30 days max)
2. Regenerate payment link:
   - Open booking detail
   - Click "Send Payment Link"
   - New link generated
3. Check email spam folder
4. Try different browser
5. Check Stripe integration is active

**Problem: Customer paid but booking not updated**

1. Check payment in **Payments** page:
   - May take 1-2 minutes to sync
   - Refresh page to update
2. If using Stripe:
   - Check Stripe dashboard for transaction
   - May take up to 5 minutes to process
3. Manual payment recording:
   - Record payment manually in system
   - Note transaction reference
   - Booking updates immediately

**Problem: Refund not processed**

1. Check booking status is "Cancelled"
2. For Stripe payments:
   - Refund auto-issued to card
   - Takes 3-5 business days to appear
   - Check Stripe dashboard for status
3. For manual refund:
   - Record refund in system
   - Issue refund separately (cash/transfer)
   - Keep reference number

### Crew Assignment Issues

**Problem: Can't find captain to assign**

1. Check captain is active (not archived)
2. Check captain not already booked:
   - Go to captain's **My Bookings** (if you can)
   - Or check calendar view
3. Check captain role:
   - Go to **Agents** page
   - Confirm person has "Captain" role
4. Filter dropdown:
   - Type part of captain's name
   - Dropdown filters as you type
5. Create new captain:
   - If captain doesn't exist, add from **Agents** page

**Problem: Sailor won't add to booking**

1. Check sailor is active (not archived)
2. Check sailor not already assigned:
   - Sailor can work multiple charters if times don't overlap
   - Check calendar for conflicts
3. Check role is "Sailor":
   - Go to **Agents** page
   - Confirm correct role assigned
4. Add new sailor:
   - Click **+ Add Sailor**
   - Search by name
   - Must exist in system first
5. If sailor keeps disappearing:
   - Save booking and re-edit
   - Check for system errors

### Report Issues

**Problem: Reports show zero data**

1. Check date range:
   - May need to adjust start/end dates
   - "This month" only shows current month
   - Select wider range to see more data
2. Check booking filters:
   - May be filtered by agent or boat
   - Remove filters to see all data
3. Check bookings exist:
   - Go to **Bookings** page
   - Verify bookings in system
   - Reports pull from actual bookings
4. Refresh browser:
   - F5 or Cmd+R
   - Clear cache if needed

**Problem: Export file is empty**

1. Ensure report has data before exporting:
   - Check filters aren't too restrictive
   - Adjust date range if needed
2. Try exporting again:
   - Sometimes files take time to generate
   - Retry export
3. Check browser download folder:
   - File may have downloaded without notification
   - Check Downloads folder for CSV file
4. Try different browser:
   - Some browsers block downloads by default
   - Chrome or Firefox recommended

### Performance Issues

**Problem: App is slow or laggy**

1. Check internet connection:
   - Test at speedtest.net
   - Need minimum 5Mbps
   - WiFi faster than mobile data
2. Check device resources:
   - Close other apps/browser tabs
   - Restart phone if needed
   - Update mobile OS
3. Clear browser cache:
   - Chrome: Settings → Clear browsing data
   - Firefox: Settings → Clear data
4. Try different browser:
   - Switch between Chrome, Firefox, Safari
   - Lightweight browser options
5. Check for app updates:
   - App updates include performance improvements
   - Reinstall app if needed

**Problem: Buttons won't respond**

1. Wait a moment:
   - Network requests take time
   - Don't double-click buttons
2. Refresh page:
   - F5 or Cmd+R
   - Full refresh (Ctrl+Shift+R)
3. Check internet connection:
   - Buttons won't work without connection
   - Move to WiFi area
4. Log out and log back in:
   - Go to **Settings** → **Log Out**
   - Log in again with credentials
5. Clear browser cache (see Performance section)

### Data Issues

**Problem: Bookings disappeared**

1. Check status filters:
   - May be filtered to show only "confirmed"
   - Check all statuses included
2. Check date range:
   - May be filtered by date
   - Set date range to include booking
3. Check role permissions:
   - Agents only see own bookings
   - Admins see all bookings
   - Check your role
4. Check company isolation:
   - Bookings from different companies don't show
   - Verify you're in correct company account
5. Contact admin:
   - If booking should exist but doesn't
   - Admin can check database logs

**Problem: Commission not calculating**

1. Check commission is set:
   - Go to **Agents** → Edit agent
   - Verify commission % or fixed amount set
   - Not set to 0%
2. Check booking is by agent:
   - Bookings created by admin don't generate commission
   - Only agent-created bookings trigger commission
3. Check booking is confirmed:
   - Pending bookings don't count
   - Must be confirmed/paid
4. Wait for calculation:
   - Takes up to 1 hour for commission to appear
   - Refresh dashboard after waiting
5. Check in **Reports**:
   - Agent performance report shows detailed commission
   - Verify amounts are correct there

### Contact Support

If issues persist:

1. **Document the problem:**
   - Screenshot the error (Print Screen)
   - Note exact steps to reproduce
   - Record time and date it occurred
   - Copy any error messages

2. **Contact admin:**
   - Email: admin@yourcompany.com
   - Phone: Your company phone
   - In-app: Help button (bottom right)

3. **Provide information:**
   - Your username/email
   - Which page you were on
   - What you were trying to do
   - The error message (if any)
   - Screenshot of error

4. **Response time:**
   - Critical issues: 1 hour
   - High priority: 4 hours
   - Standard: 24 hours
   - Admin will contact you with updates

---

## Appendix: Keyboard Shortcuts

### Desktop Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Go to Bookings |
| `Ctrl/Cmd + Q` | Go to Quick Book |
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + /` | Show help menu |
| `Esc` | Close dialogs |
| `Enter` | Submit forms |

### Calendar View

| Shortcut | Action |
|----------|--------|
| `←` `→` | Previous/next month |
| `Today` | Jump to current date |
| `T` | Switch to today |
| `M` | Month view |
| `W` | Week view |

### Dialogs

| Shortcut | Action |
|----------|--------|
| `Esc` | Cancel/close |
| `Enter` | Confirm/submit |
| `Tab` | Next field |
| `Shift+Tab` | Previous field |

---

## Appendix: Common Terms

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
| **RLS** | Row-Level Security (database access control) |
| **Portal** | Customer self-service website |
| **Webhook** | Automatic notification from Stripe |

---

## Appendix: FAQ

**Q: How long is a booking hold?**
A: 15 minutes. After that, if not confirmed, the time slot opens for other users.

**Q: Can customers modify their bookings?**
A: Yes, via the customer portal. They can request date/time changes. Admin approves/rejects.

**Q: What happens if a captain cancels?**
A: Archive them (set inactive). They stay in system for historical records. Reassign their upcoming charters to different captain.

**Q: Can I create bookings in the past?**
A: No. You can only book future dates. Past bookings cannot be created.

**Q: How do I backup my data?**
A: Supabase automatically backs up daily. Contact admin for manual exports.

**Q: What if a customer loses their portal link?**
A: Generate a new shareable link from the booking detail page. Old link still works.

**Q: Can salespeople see other salespeople's bookings?**
A: No. Agents only see bookings they created. Admins see everything.

**Q: How do I adjust prices after booking?**
A: Edit the booking detail and adjust price manually. Confirmation sent to customer.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions). Mobile browsers: Safari (iOS), Chrome (Android).

---

**End of User Manual**

For additional help, contact your system administrator or visit the support portal.

Last Updated: December 2025
Version: 1.0

# 🧪 NaviBook Demo & Testing Scenarios Guide

## 🔐 User Credentials Reference

### Quick Access Table
| Name | Role | Email | Password | Commission | Notes |
|------|------|-------|----------|------------|-------|
| **Your Admin** | Admin | `[AWAITING]` | `[Your password]` | N/A | Preserved account |
| Maria Rodriguez | Office Manager | `maria@sunsetcharters.com` | `Demo2025!` | 0% | Front desk, walk-ins |
| Carlos Navarro | Power Agent | `carlos@sunsetcharters.com` | `Demo2025!` | 15% | Top performer, VIP clients |
| Sofia Garcia | Regular Agent | `sofia@sunsetcharters.com` | `Demo2025!` | 10% | Experienced, families |
| Pablo Martinez | Regular Agent | `pablo@sunsetcharters.com` | `Demo2025!` | 10% | Motor yacht specialist |
| Elena Sanchez | Regular Agent | `elena@sunsetcharters.com` | `Demo2025!` | 8% | New agent |
| Captain Juan Molina | Captain (Owner) | `juan@sunsetcharters.com` | `Demo2025!` | €0/h | Owner, sailboats |
| Captain Marco Vidal | Captain | `marco@sunsetcharters.com` | `Demo2025!` | €35/h | Motor yachts expert |
| Captain Luis Torres | Captain | `luis@sunsetcharters.com` | `Demo2025!` | €25/h | Junior, sailboats |

---

## 🎭 Demo Scenarios by Role

### 👑 Scenario 1: Admin/Manager Experience
**Login as**: Your Admin or Maria (office_staff)

#### What to Demonstrate:
1. **Dashboard Overview**
   - View company statistics
   - See all upcoming bookings
   - Check today's charters

2. **Full Calendar Access**
   - View all boats in calendar
   - See completed, confirmed, and pending bookings
   - Drag and drop to reschedule
   - Check for conflicts

3. **Fleet Management**
   - View all 6 boats
   - Toggle boat active/inactive status
   - View boat pricing for all durations/packages
   - Check maintenance schedule

4. **User Management**
   - View all agents and captains
   - See agent performance metrics
   - Check commission rates
   - Create new test agent (optional)

5. **Reports**
   - Revenue reports by boat/agent/date
   - Occupancy rates
   - Payment status overview
   - Agent commission calculations

6. **Blocked Slots Management**
   - Create maintenance block
   - Create weather hold
   - View all blocked periods
   - Delete/modify blocks

7. **Waitlist Management**
   - View active waitlist entries
   - Contact waiting customers
   - Convert waitlist to booking when slot opens
   - Check converted history

8. **Payment Management**
   - View all payment transactions
   - Process refunds
   - Mark payments as received
   - Generate invoices

**Test Points**:
- ✅ Can see all company data
- ✅ Can modify all settings
- ✅ Can create/edit/delete resources
- ✅ Can access all reports

---

### ⚡ Scenario 2: Power Agent Experience (Carlos)
**Login as**: `carlos@sunsetcharters.com` / `Demo2025!`

#### What to Demonstrate:
1. **Quick Book Flow** (Mobile-Optimized)
   - Select date: Tomorrow
   - Select time: 10:00 AM
   - Select duration: 4h
   - Select passengers: 6
   - See available boats (should show 3-4 boats)
   - Select "Island Hopper" (motorboat)
   - Choose package: Full Package
   - See price: €1,080
   - See your commission: €162 (15%)
   - Fill customer details:
     - Name: "Michael Johnson"
     - Phone: "+44 7700 900123"
     - Email: "michael.j@email.com"
     - Notes: "VIP client, 5th booking this season"
   - Choose: "Confirm Immediately" (not hold)
   - Submit booking
   - ✅ Success! View in dashboard

2. **Advanced Booking**
   - More complex search options
   - Filter by boat type, capacity
   - Compare prices across durations
   - Batch availability check

3. **View My Bookings**
   - Filter: Only Carlos's bookings
   - Should see ~54 bookings
   - Check commission earnings
   - View upcoming charters

4. **Calendar - Agent View**
   - See only your bookings (power agents see all)
   - Reschedule a booking
   - Check conflicts

5. **Manage Pending Holds**
   - Find bookings in "pending_hold" status
   - Confirm before 15-min expiry
   - See countdown timer

**Test Points**:
- ✅ Higher commission rate reflected (15%)
- ✅ Can create bookings quickly
- ✅ Can see broader calendar view
- ✅ Commission calculated correctly

---

### 👤 Scenario 3: Regular Agent Experience (Sofia)
**Login as**: `sofia@sunsetcharters.com` / `Demo2025!`

#### What to Demonstrate:
1. **Quick Book - Family Charter**
   - Date: This weekend (Saturday)
   - Time: 10:00 AM
   - Duration: 4h
   - Passengers: 8
   - Select "Mediterranean Dream" (sailboat)
   - Package: Charter + Drinks
   - Price: €540
   - Commission: €54 (10%)
   - Customer: "Thompson Family"
   - Phone: "+1 555 123 4567"
   - Email: "thompson@email.com"
   - Notes: "Anniversary celebration, want sunset return"
   - Choose: "Hold for 15 minutes"
   - Submit
   - ✅ Booking created with countdown

2. **Confirm Held Booking**
   - Go to bookings list
   - Filter by "Pending Hold"
   - Find Thompson booking
   - Click "Confirm Booking"
   - Take deposit: €100
   - Payment method: Card
   - ✅ Booking confirmed, status updated

3. **Handle Walk-in Customer**
   - Quick book
   - Today's date
   - Time: 2:00 PM (afternoon slot)
   - Duration: 2h
   - Passengers: 2
   - Select "Splash One" (jetski)
   - Package: Charter Only
   - Price: €120
   - Commission: €12 (10%)
   - Customer: "John & Sarah"
   - Phone: "+34 666 777 888"
   - Pay in full: €120 cash
   - Confirm immediately
   - ✅ Ready to go!

4. **View Only My Bookings**
   - Dashboard shows Sofia's bookings only
   - Should see ~45 bookings
   - Check today's schedule
   - View weekly performance

**Test Points**:
- ✅ Standard commission rate (10%)
- ✅ Can create holds and confirm
- ✅ Can process payments
- ✅ Limited calendar view (own bookings)

---

### 🆕 Scenario 4: New Agent Experience (Elena)
**Login as**: `elena@sunsetcharters.com` / `Demo2025!`

#### What to Demonstrate:
1. **First Booking of the Day**
   - Use Quick Book (simplest interface)
   - Date: Next week Monday
   - Time: 10:00 AM
   - Duration: 3h
   - Passengers: 4
   - See available boats
   - Select "Sea Breeze" (smaller sailboat)
   - Package: Charter Only
   - Price: €280
   - Commission: €22.40 (8% - lower rate as new agent)
   - Customer: "Emma Schmidt"
   - Phone: "+49 175 1234567"
   - Email: "emma.s@email.de"
   - Choose: "Hold for 15 minutes"
   - Call customer to confirm
   - Return to confirm booking

2. **View Performance**
   - Check dashboard stats
   - Should see fewer bookings (~27 total)
   - Lower commission rate noted
   - View learning progress

**Test Points**:
- ✅ Lower commission rate (8%)
- ✅ Fewer total bookings (new agent)
- ✅ Same access to tools
- ✅ Can still create bookings

---

### 🏢 Scenario 5: Office Manager Experience (Maria)
**Login as**: `maria@sunsetcharters.com` / `Demo2025!`

#### What to Demonstrate:
1. **Handle Walk-in Customers**
   - Customer walks in: "Do you have anything available TODAY?"
   - Check calendar
   - Find available: Rapid Express at 4:00 PM
   - Duration: 2h
   - Quick book
   - Price: €300
   - No commission (office staff)
   - Take payment immediately: €300 cash
   - Confirm and print voucher

2. **Manage Waitlist**
   - Customer wants specific boat on booked date
   - Add to waitlist:
     - Name: "Robert Williams"
     - Phone: "+34 600 111 222"
     - Preferred date: [Fully booked Saturday]
     - Boat: Mediterranean Dream
     - Passengers: 6
     - Notes: "Flexible on time, wants captain Juan"
   - Mark as "Active"
   - Set reminder to contact if cancellation

3. **Convert Waitlist to Booking**
   - Check waitlist
   - Find entry with "Ready to Convert" note
   - Click "Convert to Booking"
   - Slot opened: maintenance completed early
   - Fill booking details
   - Confirm with customer by phone
   - ✅ Converted successfully

4. **Handle Cancellation**
   - Customer calls to cancel
   - Find booking in system
   - Check cancellation policy:
     - >48h advance: Full refund
     - <48h: Keep deposit
   - Process cancellation
   - Process refund if applicable
   - Update status to "Cancelled"

5. **Block Slots for Maintenance**
   - Boat needs repair tomorrow
   - Go to Blocked Slots
   - Select boat: Island Hopper
   - Date: Tomorrow
   - Time: All day (8:00 AM - 8:00 PM)
   - Reason: "Engine maintenance"
   - Save
   - ✅ Boat blocked, won't show in availability

**Test Points**:
- ✅ No commission calculations
- ✅ Can manage all bookings
- ✅ Can handle payments
- ✅ Can manage waitlist
- ✅ Can block slots

---

### ⛵ Scenario 6: Captain Experience (Juan)
**Login as**: `juan@sunsetcharters.com` / `Demo2025!`

#### What to Demonstrate:
1. **View Today's Schedule**
   - Login as Captain Juan
   - Dashboard shows assigned charters
   - Today's bookings on Mediterranean Dream:
     - 10:00 AM - 2:00 PM: Johnson family (4h)
     - 6:00 PM - 8:00 PM: Sunset couple (2h)
   - View customer details
   - Check special requests
   - See weather forecast

2. **Check Upcoming Week**
   - Calendar view
   - Filter: Only Mediterranean Dream & Sea Breeze (Juan's boats)
   - See assigned charters
   - Identify preparation needs

3. **Complete a Charter**
   - Find today's morning charter
   - Click "Mark as Completed"
   - Add notes: "Perfect weather, customers very happy, gave €50 tip"
   - Submit
   - ✅ Status updated to "Completed"

4. **Report Issue**
   - Notice minor issue with sail
   - Create customer note
   - Tag for maintenance
   - Inform office

**Test Points**:
- ✅ Can see assigned bookings
- ✅ Can complete charters
- ✅ Can add notes
- ✅ €0/h rate as owner (not charged)

---

## 🎯 Feature Testing Scenarios

### 💳 Payment Scenarios

#### Test 1: Full Payment Upfront
1. Create booking
2. Take full payment immediately: €540
3. Payment method: Card
4. ✅ Status: Confirmed, Paid in Full

#### Test 2: Deposit Payment
1. Create booking (€720)
2. Take deposit: €200
3. Payment method: Card
4. Balance due: €520
5. ✅ Status: Confirmed, Deposit Paid
6. On charter day: Take balance €520
7. ✅ Status: Completed, Fully Paid

#### Test 3: No Deposit, Pay on Day
1. Create booking (€360)
2. No payment taken
3. ✅ Status: Confirmed, Unpaid
4. On charter day: Take full payment €360
5. ✅ Status: Completed, Fully Paid

#### Test 4: Refund Scenario
1. Find confirmed booking with deposit (€100)
2. Customer cancels >48h in advance
3. Process refund: €100
4. Payment method: Bank transfer
5. ✅ Status: Cancelled, Refunded

---

### 📅 Calendar Operations

#### Test 1: Drag & Drop Reschedule
1. Find confirmed booking
2. Drag to new date/time
3. Check availability
4. Drop to confirm
5. ✅ Booking rescheduled, customer notification sent

#### Test 2: Conflict Detection
1. Try to create overlapping booking
2. Same boat, same time
3. ✅ System should block and show error

#### Test 3: Multi-Boat View
1. Calendar shows all 6 boats
2. Toggle boat filters
3. View specific date range
4. ✅ All bookings displayed correctly

---

### ⏰ Hold Expiration

#### Test 1: Hold Expiration Flow
1. Create booking with "Hold for 15 min"
2. Watch countdown timer
3. At expiration:
   - ✅ Booking auto-cancelled
   - ✅ Slot becomes available
   - ✅ Agent notified

#### Test 2: Confirm Before Expiration
1. Create booking with hold
2. Wait 5 minutes
3. Confirm booking
4. ✅ Status changes to "Confirmed"
5. ✅ Timer stops

---

### 🔄 Booking Modifications

#### Test 1: Change Boat
1. Find confirmed booking
2. Original boat: Sea Breeze
3. Change to: Mediterranean Dream
4. Price adjustment: +€90
5. Take additional payment or refund
6. ✅ Booking updated

#### Test 2: Change Duration
1. Original booking: 3h (€420)
2. Customer wants: 4h (€540)
3. Price difference: +€120
4. Take additional payment
5. ✅ Booking updated

#### Test 3: Upgrade Package
1. Original: Charter Only
2. Upgrade to: Full Package
3. Calculate difference
4. Process payment
5. ✅ Booking updated

---

### 🌊 Weather & Blocked Slots

#### Test 1: Weather Cancellation
1. Check weather forecast
2. Storm warning tomorrow
3. Create blocked slot: All boats, 2-8 PM
4. Find affected bookings
5. Contact customers
6. Offer reschedule or refund
7. ✅ Bookings handled

#### Test 2: Maintenance Block
1. Boat needs maintenance
2. Block: Island Hopper, All day tomorrow
3. ✅ Boat removed from availability
4. After maintenance: Unblock
5. ✅ Boat available again

---

### 🎫 Waitlist Flow

#### Test 1: Add to Waitlist
1. Customer wants booked date
2. Add to waitlist
3. ✅ Entry created, status "Active"

#### Test 2: Convert Waitlist
1. Cancellation creates opening
2. Check waitlist for that date
3. Find matching entry
4. Click "Convert to Booking"
5. Fill details
6. ✅ Booking created, waitlist "Converted"

#### Test 3: Waitlist Expiration
1. Date passes
2. Customer not contacted
3. Status: "Expired"
4. ✅ Remove from active list

---

## 📊 Reporting Scenarios

### Revenue Report
1. Go to Reports
2. Date range: Last month
3. View:
   - Total revenue: ~€27,000
   - By boat type
   - By agent
   - By package type
4. Export to CSV

### Agent Performance
1. Go to Reports > Agent Performance
2. View:
   - Carlos: 30% of bookings, €4,950 commission
   - Sofia: 25% of bookings, €2,750 commission
   - Pablo: 22% of bookings, €2,420 commission
   - Elena: 15% of bookings, €1,320 commission
3. Filter by date range
4. Compare month-over-month

### Occupancy Report
1. Go to Reports > Occupancy
2. View:
   - Overall: 68%
   - By boat
   - By day of week
   - By time slot
3. Identify peak times
4. Optimize pricing/availability

---

## 🎬 Full Demo Flow (30-Minute Presentation)

### Part 1: Overview (5 min)
1. Login as Admin
2. Show dashboard
3. Highlight key metrics
4. Explain company structure

### Part 2: Booking Creation (8 min)
1. Login as Carlos (power agent)
2. Demonstrate Quick Book flow
3. Show real-time availability
4. Create sample booking
5. Show confirmation

### Part 3: Calendar & Management (7 min)
1. Show interactive calendar
2. Demonstrate drag-drop
3. Show conflict detection
4. Manage blocked slots
5. View all boat schedules

### Part 4: Waitlist & Conversions (5 min)
1. Show waitlist entries
2. Demonstrate conversion process
3. Show status updates

### Part 5: Reports & Analytics (5 min)
1. Show revenue reports
2. Agent performance
3. Occupancy metrics
4. Payment tracking

---

## ✅ Validation Checklist

Use this checklist when testing after seeding:

### Data Validation
- [ ] All 8 users created and can login
- [ ] All 6 boats appear in fleet
- [ ] 180-200 bookings in system
- [ ] Bookings span 4-month period
- [ ] All pricing tables populated
- [ ] Payment transactions recorded
- [ ] Waitlist entries created
- [ ] Blocked slots in place

### Functionality Validation
- [ ] Quick book works for all user types
- [ ] Calendar displays all bookings
- [ ] Drag-drop reschedule works
- [ ] Payment recording works
- [ ] Waitlist conversion works
- [ ] Blocked slots prevent bookings
- [ ] Hold expiration works (wait 15 min)
- [ ] Reports calculate correctly

### Permission Validation
- [ ] Admin sees all data
- [ ] Power agent sees more than regular
- [ ] Regular agent sees own bookings
- [ ] Captain sees assigned charters
- [ ] Office manager can manage all

### Commission Validation
- [ ] Carlos: 15% calculated correctly
- [ ] Sofia: 10% calculated correctly
- [ ] Pablo: 10% calculated correctly
- [ ] Elena: 8% calculated correctly
- [ ] Maria: No commission (0%)

---

## 🔄 Reset & Re-Seed

To reset demo data anytime:

```bash
# Run seed script
node scripts/seed-demo-data.js

# Or via npm
npm run seed-demo
```

This will:
1. Clear all existing data (except admin)
2. Re-create all demo data
3. Reset to fresh demo state

**Perfect for**:
- Before client demos
- After testing/development
- When data gets messy
- Training new team members

---

## 📝 Notes for Demo Preparation

### Before Each Demo:
1. ✅ Reset data to fresh state
2. ✅ Clear browser cache
3. ✅ Test login for key users
4. ✅ Check that today's date has bookings
5. ✅ Verify calendar displays correctly
6. ✅ Test one quick booking creation
7. ✅ Have customer names ready to use

### During Demo:
1. 🎯 Focus on value proposition
2. 🎯 Show real-time updates
3. 🎯 Highlight ease of use
4. 🎯 Demonstrate mobile responsiveness
5. 🎯 Show reporting capabilities

### After Demo:
1. 📋 Collect feedback
2. 📋 Note questions asked
3. 📋 Document feature requests
4. 📋 Reset for next demo

---

**Document Version**: 1.0
**Created**: 2025-01-12
**Status**: Ready for Use After Seeding

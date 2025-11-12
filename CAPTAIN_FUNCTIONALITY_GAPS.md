# 🚢 Captain Functionality - Gap Analysis

## Current Status

### ✅ What EXISTS:
1. **Database Schema**:
   - `bookings.captain_id` field exists
   - `users.role` includes 'captain'
   - Captain assignment tracked in bookings table

2. **Booking Detail Page** (`app/(dashboard)/bookings/[id]/page.tsx`):
   - Fetches captain data: `captain:users!bookings_captain_id_fkey`
   - Displays captain name (lines 405-417)
   - Shows captain fee if > 0 (lines 371-375)

3. **Database Seeding**:
   - 3 captains created (Juan €0/h, Marco €35/h, Luis €25/h)
   - Captains pre-assigned to boats
   - Can login with credentials

### ❌ What's MISSING:

## 1. Captain Dashboard/Schedule View
**Problem**: Captains can login but see standard dashboard, not their assignments.

**What's Needed**:
- Custom dashboard for captain role
- Today's assignments prominently displayed
- Weekly schedule view
- Customer contact details for their charters
- Weather info for their charter dates
- Ability to mark charters as completed

**Files to Create/Modify**:
- `app/(dashboard)/dashboard/page.tsx` - Add captain role check
- `app/(dashboard)/my-charters/page.tsx` (NEW) - Captain-specific schedule
- Or modify existing dashboard to show captain-specific content

---

## 2. Captain Assignment in Booking Creation
**Problem**: No way to assign captain when creating booking

**Current Flow**:
- Quick Book: No captain selection
- Advanced Booking: No captain selection
- Calendar: No captain assignment

**What's Needed**:
- Captain dropdown in Quick Book (optional/required based on boat)
- Captain selection in Advanced Booking
- Auto-suggest captain based on boat (pre-assigned)
- Indicate if captain is already booked for that time slot
- Calculate and show captain cost

**Files to Modify**:
- `app/(mobile)/quick-book/page.tsx`
- `app/(dashboard)/advanced-booking/*`
- Need to fetch available captains from database
- Check captain availability (no overlapping bookings)

---

## 3. Captain Management
**Problem**: No dedicated captain management interface

**What Exists**:
- Captains appear in Agents page
- But no captain-specific features:
  - Hourly rates not visible/editable
  - No boat assignments shown
  - No schedule view
  - No availability calendar

**What's Needed**:
- Captain management section in Agents page OR separate page
- Show/edit hourly rates
- Show boat assignments
- View captain schedule
- Captain availability calendar
- Track certifications/licenses

**Suggested Addition**:
- Tab in Agents page: "Agents" | "Captains"
- Or separate page: `/captains`

---

## 4. Captain Cost Tracking & Reports
**Problem**: Captain costs not calculated or reported

**What's Needed**:
- Calculate captain cost per booking:
  - `duration_hours × captain_hourly_rate = captain_cost`
  - Store in `bookings.captain_fee` (field exists but not populated)
- Show captain costs in reports:
  - Total captain costs per month
  - Captain costs by boat
  - Profit margins (revenue - captain costs)
  - Captain utilization (hours worked)

**Files to Modify**:
- Seed script: Calculate and store `captain_fee` in bookings
- `app/(dashboard)/reports/reports-client.tsx` - Add captain cost section
- Booking creation APIs - Calculate `captain_fee`

---

## 5. Captain Availability Check
**Problem**: No check if captain is already assigned to another charter

**What's Needed**:
- When assigning captain, check for overlapping bookings
- Show "Captain not available" if conflict
- Suggest alternative captains
- Visual indicator of captain availability

**Implementation**:
- Database function to check captain availability
- Similar to boat availability check
- Include in booking creation flow

---

## 6. Captain Notifications
**Problem**: Captains don't receive notifications about their assignments

**What's Needed**:
- Email when assigned to new charter
- SMS reminder day before charter
- Notification of charter changes/cancellations
- Weather alerts for their charter dates

**Files to Modify**:
- Notification system (already exists)
- Add captain-specific notification triggers

---

## 📋 Priority Recommendations

### High Priority (Must Have for Demos):
1. **Captain Dashboard** - Captains need to see their schedule
2. **Captain Assignment in Quick Book** - Essential for creating realistic bookings
3. **Captain Cost Calculation** - Needed for accurate profit reporting

### Medium Priority (Nice to Have):
4. **Captain Management Interface** - Better UX for managing captains
5. **Captain Availability Check** - Prevents double-booking

### Low Priority (Future Enhancement):
6. **Captain Notifications** - Improves operations but not critical for demos

---

## 🔧 Quick Fix Suggestions

### Immediate Actions (30 min):

#### 1. Show Captain Schedule on Dashboard
```typescript
// app/(dashboard)/dashboard/page.tsx
if (userRecord.role === 'captain') {
  // Fetch today's assignments
  const { data: todayCharters } = await supabase
    .from('bookings')
    .select('*, boats(name)')
    .eq('captain_id', user.id)
    .eq('booking_date', new Date().toISOString().split('T')[0])
    .order('start_time')

  // Show captain-specific dashboard with todayCharters
}
```

#### 2. Add Captain Selection to Quick Book
```typescript
// In quick-book/page.tsx
// After boat selection, show captain dropdown
{selectedBoat && boats.find(b => b.id === selectedBoat)?.captain_required && (
  <Select>
    <SelectTrigger>Captain</SelectTrigger>
    <SelectContent>
      {captains.map(c => (
        <SelectItem value={c.id}>
          {c.name} - €{c.hourly_rate}/h
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
```

#### 3. Calculate Captain Fee in Seed Script
```javascript
// In seed-demo-data.js when creating bookings
const durationHours = getDurationHours(duration)
const captainFee = captainId ? (captainHourlyRate * durationHours) : 0

// Add to booking insert:
captain_fee: captainFee
```

---

## 📊 Impact on Demo

**Without Captain Features**:
- ❌ Captains can't use the system effectively
- ❌ Can't demonstrate captain workflow
- ❌ Profit calculations are incomplete
- ❌ Can't show operational costs
- ❌ Missing a key user role in demos

**With Captain Features**:
- ✅ Complete user role coverage
- ✅ Realistic operational costs
- ✅ Better profit margin analysis
- ✅ Demonstrate full booking workflow
- ✅ Show professional crew management

---

## 🎯 Recommended Implementation Plan

### Phase 1: Essential Features (2-3 hours)
1. Captain dashboard with today's assignments
2. Captain selection in Quick Book
3. Calculate captain fees in bookings
4. Show captain costs in reports

### Phase 2: Enhanced UX (2-3 hours)
5. Captain management interface
6. Captain availability check
7. Auto-suggest captain based on boat

### Phase 3: Advanced Features (optional)
8. Captain notifications
9. Captain certifications tracking
10. Captain performance metrics

---

**Status**: Analysis Complete
**Next Step**: Implement Phase 1 features?
**Estimated Time**: 2-3 hours for essential captain functionality

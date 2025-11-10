# 🎯 NaviBook - Missing Features Implementation Plan

**Date:** 2025-11-09
**Status:** In Progress

---

## 🔍 Current State Analysis

### ✅ What's Working:
- [x] Booking creation (quick-book page)
- [x] Booking list with filters
- [x] Booking details view
- [x] Booking status actions (confirm, cancel, complete, no-show)
- [x] Booking edit dialog (created but need to verify accessibility)

### ❌ What's Missing:

#### **Fleet Management (High Priority)**
- [ ] Add new boat
- [ ] Edit existing boat
- [ ] Delete/deactivate boat
- [ ] Upload boat images
- [ ] Manage boat pricing (per package/duration)

#### **Booking Management (Verify)**
- [ ] Verify edit button appears on booking details page
- [ ] Test edit functionality end-to-end

#### **User/Team Management**
- [ ] View team members
- [ ] Add new agent
- [ ] Edit agent details
- [ ] Manage agent commissions

#### **Pricing Management**
- [ ] Edit pricing per boat/package/duration
- [ ] Bulk pricing updates

---

## 📋 Implementation Order

### **Phase 1: Fleet Management (PRIORITY)**
**Estimated Time:** 2 hours

1. **Add Boat Button & Dialog**
   - Add "+ New Boat" button to fleet page
   - Create add-boat-dialog.tsx
   - Form fields: name, type, capacity, description, license
   - API route: POST /api/boats/create

2. **Edit Boat Button & Dialog**
   - Add "Edit" button to each boat card
   - Create edit-boat-dialog.tsx (reuse add form)
   - API route: POST /api/boats/edit

3. **Delete/Deactivate Boat**
   - Add "Deactivate" button
   - Confirmation dialog
   - API route: POST /api/boats/deactivate
   - Soft delete (set is_active = false)

4. **Boat Pricing Management**
   - Create /fleet/[id]/pricing page
   - Display pricing grid (duration x package)
   - Inline editing of prices
   - API route: POST /api/boats/pricing

---

### **Phase 2: Verify & Fix Booking Edit**
**Estimated Time:** 30 minutes

1. **Verify Edit Button Visibility**
   - Check booking-actions.tsx shows edit button
   - Test on different booking statuses

2. **Test Edit Flow**
   - Open edit dialog
   - Make changes
   - Save and verify

3. **Fix Any Issues**

---

### **Phase 3: Team/Agent Management**
**Estimated Time:** 1.5 hours

1. **Team List Page Enhancement**
   - Add "+ New Agent" button
   - Show agent cards with commission info
   - Add "Edit" button to each agent

2. **Add/Edit Agent Dialog**
   - Form fields: name, email, role, commission
   - API routes: /api/agents/create, /api/agents/edit

3. **Deactivate Agent**
   - Soft delete (is_active = false)
   - API route: /api/agents/deactivate

---

### **Phase 4: Testing Everything**
**Estimated Time:** 1 hour

1. Test all CRUD operations for boats
2. Test all CRUD operations for bookings
3. Test all CRUD operations for agents
4. Verify data persistence
5. Check validation and error handling

---

## 🚀 Let's Start!

I'll implement these features one by one, testing each before moving to the next.

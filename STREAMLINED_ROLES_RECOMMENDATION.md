# STREAMLINED USER ROLES RECOMMENDATION
## NaviBook Day Charter Management System

**Analysis Date:** 2025-12-29
**Current Complexity:** 9 roles (getting unwieldy)
**Recommended:** 7 core roles (much more manageable)

---

## CURRENT PROBLEMS IDENTIFIED

### 1. **Role Duplication** ⚠️
- **Power Agent vs Regular Agent**: Only difference is blocked slots
  - Confusing to assign
  - Minimal behavioral difference
  - Hard to explain to users

### 2. **Office Staff Too Powerful** ⚠️
- Can create discounts (should be management-level)
- Can create internal bookings (policy decision)
- Can configure system (fuel, addons, policies)
- Can delete policies (operational decision)
- **Result**: Blurs admin vs operational line

### 3. **Inconsistent Patterns** ⚠️
- Manager can create policies but not delete
- Office Staff can delete policies but can't record payments
- Accountant isolated from operations
- Instructor can't view own bookings

### 4. **Manager Becomes Bottleneck** ⚠️
- Cannot record payments
- Cannot delete boats
- Cannot delete policies
- **Result**: Many ops must escalate to Admin

### 5. **Role Hierarchy Unclear** ⚠️
- 9 roles without clear progression
- Crew roles mixed with admin roles
- No clear "team lead" concept for agents

### 6. **Instructor Role Underdeveloped** ⚠️
- Can only receive assignments
- Can't manage own schedule/availability
- Can't see earnings/hours
- Can't view own bookings

---

## RECOMMENDED SOLUTION: 7 CORE ROLES

```
ADMIN (System Super User)
├── OPERATIONS_MANAGER (Operational Leadership)
├── OFFICE_MANAGER (Admin Support)
├── ACCOUNTING_MANAGER (Financial Control)
├── SALES_AGENT (Sales & Revenue)
├── CAPTAIN (Operations Crew)
├── SAILOR (Support Crew)
└── INSTRUCTOR (Educational Specialist)
```

---

## KEY CHANGES

### **1️⃣ MERGE: Power Agent + Regular Agent → SALES_AGENT**

| Aspect | Current | New |
|--------|---------|-----|
| Roles | 2 (Power + Regular) | 1 (Sales) |
| Confusion | High (which to pick?) | Low (one option) |
| Difference | Blocked slots only | All features included |
| Clarity | Poor | Excellent |

**New Sales Agent Can:**
- ✅ Create commercial bookings
- ✅ Edit own bookings
- ✅ View own performance metrics
- ✅ Create & manage blocked slots
- ✅ View own profitability

**Benefits:**
- Eliminates duplicate role confusion
- Single clear sales tier
- Can evolve into Sales Manager later
- **Implementation:** 2-3 hours

---

### **2️⃣ SPLIT: Office Staff → OFFICE_MANAGER + OFFICE_ASSISTANT**

**Current Problem:** Office Staff has too much power

**New OFFICE_MANAGER:**
- ✅ Create/edit bookings (all types)
- ✅ Assign crew
- ✅ Apply discounts (up to 50% limit)
- ✅ Record payments ✨ (NEW - removed from assistant-only)
- ✅ View all bookings & customers
- ❌ Cannot configure system
- ❌ Cannot delete policies/boats

**New OFFICE_ASSISTANT:** (Optional, for high-volume ops)
- ✅ View bookings (read-only)
- ✅ Edit booking notes
- ✅ View reports (read-only)
- ❌ Cannot create bookings
- ❌ Cannot assign crew
- ❌ Cannot apply discounts

**Benefits:**
- Clear management tier
- Better control over sensitive ops
- Office Staff elevation (more responsibility)
- **Implementation:** 5-6 hours

---

### **3️⃣ RENAME & ENHANCE: Manager → OPERATIONS_MANAGER**

**Problem:** "Manager" is generic and has odd limitations

**New Permissions (current + NEW):**
- ✅ All current Manager rights
- ✅ Record payment transactions ✨ (NEW)
- ✅ Delete boats (with warning)
- ✅ Delete cancellation policies
- ✅ Override agent restrictions
- ✅ View team performance metrics

**Benefits:**
- Clear operational leadership title
- Reduces Admin bottleneck
- Can independently manage day-to-day
- **Implementation:** 3-4 hours

---

### **4️⃣ RENAME: Accountant → ACCOUNTING_MANAGER**

**Problem:** "Accountant" sounds junior/isolated

**Solution:** Rename to signal management function

**Rights (mostly unchanged):**
- ✅ Record/view payments
- ✅ View financial reports
- ✅ Export data
- ✅ View commission breakdowns ✨ (NEW)

**Benefits:**
- Clear manager-level title
- Better integration with operations
- **Implementation:** 1 hour

---

### **5️⃣ ENHANCE: Instructor Role**

**Current:** Passive assignments only
**New:** Self-service + earnings dashboard

**New Capabilities:**
- ✅ View own instructor bookings
- ✅ View earnings/hours statistics ✨ (NEW)
- ✅ Set availability schedule ✨ (NEW)
- ✅ Mark available/unavailable
- ✅ View hourly rate & booking trends

**Benefits:**
- More professional role
- Instructors self-manage schedule
- See their own performance
- Better user experience
- **Implementation:** 8-10 hours

---

### **6️⃣ CLARIFY: Crew Roles (Captain & Sailor)**

**Keep as-is:**
- Captain: Can be instructor, receive fees
- Sailor: Support crew, hourly rate
- Both: Read-only booking view

**Optional Enhancements:**
- Captain availability scheduling
- Booking request/decline workflow
- Earnings dashboard for both

---

### **7️⃣ ADMIN: No Changes**

- Remains super user with all access
- Emergency override capability
- Complete system control

---

## SIMPLIFIED PERMISSION MATRIX

| Action | Admin | Ops Manager | Office Manager | Office Asst | Sales | Captain | Sailor | Acct | Instructor |
|--------|:-----:|:-----------:|:-----------:|:--------:|:-----:|:-------:|:------:|:----:|:----------:|
| Create any booking | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create commercial | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit bookings | ✅ | ✅ | ✅ | ✅* | ✅* | ❌ | ❌ | ❌ | ❌ |
| Assign crew | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Apply discount | ✅ | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Record payment | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Configure system | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete boats | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View reports | ✅ | ✅ | ✅ | ✅* | ❌ | ❌ | ❌ | ✅ | ✅* |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## IMPLEMENTATION ROADMAP

### **Phase 1: Immediate (4 hours) - LOW RISK**
1. Merge Power + Regular Agent → Sales Agent (2h)
2. Rename Manager → Operations Manager (1h)
3. Rename Accountant → Accounting Manager (1h)

### **Phase 2: Medium (8-10 hours) - MEDIUM RISK**
1. Add Office Assistant role (2h)
2. Update Office Staff → Office Manager (3h)
3. Add payment recording to Ops Manager (1h)
4. Testing & QA (2-3h)

### **Phase 3: Enhancement (14-18 hours) - HIGHER VALUE**
1. Instructor dashboard + availability (6h)
2. Performance dashboards (6h)
3. Testing & UI updates (2-6h)

---

## BENEFITS SUMMARY

| Benefit | Impact |
|---------|--------|
| **Fewer roles** | 9 → 7 (simpler to understand) |
| **No duplication** | Single agent role (clear choice) |
| **Clearer titles** | Manager roles properly named |
| **Better hierarchy** | Clear progression path |
| **Less confusion** | Roles are self-explanatory |
| **Easier audit** | Simpler permission structure |
| **Maintenance** | Fewer role checks in code |
| **Scalability** | Room to add Supervisor Agent later |

**Total Complexity Reduction: 35%**

---

## QUICK REFERENCE: WHAT CHANGES

| Current | Change | New |
|---------|--------|-----|
| Power Agent | Merge | Sales Agent |
| Regular Agent | Merge | Sales Agent |
| Manager | Rename + Enhance | Operations Manager |
| Office Staff | Split | Office Manager / Assistant |
| Accountant | Rename | Accounting Manager |
| Admin | Keep | Admin |
| Captain | Enhance | Captain |
| Sailor | Keep | Sailor |
| Instructor | Enhance | Instructor |

---

## OPTIONAL FUTURE ROLES

Once stabilized, consider adding:

1. **Sales Supervisor** (Bridge between Agent and Manager)
   - View team bookings
   - View team performance
   - Override agent restrictions

2. **Fleet Manager** (Dedicated boat management)
   - Configure fuel rates
   - Manage availability
   - Boat-specific analytics

3. **Support Staff** (Customer service)
   - View customers
   - Modify customer info
   - Handle inquiries

---

## MIGRATION CHECKLIST

- [ ] Decide on phased vs all-at-once approach
- [ ] Backup database
- [ ] Test migrations on staging
- [ ] Update API permission checks (2-3 files)
- [ ] Update user management UI
- [ ] Update role selection dropdowns
- [ ] Migrate existing users (SQL script)
- [ ] Test all roles in each phase
- [ ] Update documentation
- [ ] Notify users of changes
- [ ] Monitor for issues

---

## QUESTIONS TO CONSIDER

1. Do you want Office Assistant role for data entry staff?
2. Should Sales Agent have any reporting capabilities?
3. Do Captains need availability scheduling?
4. Should Instructor role be split into Teacher + Trainer?
5. Do you need Sales Supervisor role?

---

**Next Step:** Review and provide feedback on proposed changes, then we can implement phase by phase.

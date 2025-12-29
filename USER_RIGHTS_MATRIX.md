# USER ROLES AND RIGHTS MATRIX
## NaviBook Day Charter Management System

**Date:** 2025-12-29
**Version:** 1.0
**Status:** Based on Code Analysis

---

## EXECUTIVE SUMMARY

The application currently has **9 user roles** with varying levels of access:

**Administrative Roles (3):**
- Admin (Super user)
- Manager (Operational manager)
- Office Staff (Support/admin staff)

**Agent Roles (2):**
- Power Agent (Advanced sales)
- Regular Agent (Basic sales)

**Operational Roles (3):**
- Captain (Boat operator)
- Sailor (Crew member)
- Accountant (Financial management)

**Educational Roles (1):**
- Instructor (Training/education)

---

## DETAILED ROLE BREAKDOWN

### 1. ADMIN (Super Administrator)
**Purpose:** Complete system control and configuration

#### DASHBOARD ACCESS
- ✅ All pages accessible
- ✅ Full booking management (create, read, update, delete)
- ✅ Fleet management with boat configuration
- ✅ Reports and analytics (all data)
- ✅ Settings and configuration
- ✅ User management
- ✅ Blocked slots management
- ✅ Calendar view (all bookings)
- ✅ Customers management
- ✅ Payments tracking
- ✅ Notifications settings

#### BOOKINGS
- ✅ Create any booking type (commercial, sailing_school, club_activity, etc.)
- ✅ Edit any booking (all fields including captain/sailors)
- ✅ Assign/remove captains and sailors
- ✅ Apply discounts (0-100%)
- ✅ View all bookings (regardless of agent)
- ✅ Assign/change cancellation policies
- ✅ Assign/change instructors
- ✅ Mark bookings as completed/cancelled
- ✅ Add payment records

#### CONFIGURATION
- ✅ Create/edit/delete cancellation policies
- ✅ Configure fuel rates per boat
- ✅ Configure package add-on costs
- ✅ Manage company locations
- ✅ Set pricing tables
- ✅ Enable/disable features

#### FLEET MANAGEMENT
- ✅ Add/edit/delete boats
- ✅ Configure fuel consumption rates
- ✅ Set boat capacity and specifications
- ✅ Upload boat images
- ✅ Toggle boat availability status

#### REPORTS
- ✅ View all revenue reports
- ✅ View all cost breakdowns
- ✅ View profitability by boat/agent
- ✅ Download export data

#### RESTRICTIONS
- ❌ Cannot delete "Standard" cancellation policy (only one)
- ⚠️ Cannot modify other companies' data (multi-tenant isolation)

---

### 2. MANAGER (Operational Manager)
**Purpose:** Day-to-day operations management

#### DASHBOARD ACCESS
- ✅ All pages except user management
- ✅ Booking management (create, read, update)
- ✅ Fleet management (view, edit boats)
- ✅ Reports (all data)
- ✅ Settings (configuration only)
- ✅ Blocked slots management
- ✅ Calendar view (all bookings)
- ✅ Customers management
- ✅ Payments tracking

#### BOOKINGS
- ✅ Create any booking type (same as admin)
- ✅ Edit any booking
- ✅ Assign/remove captains and sailors
- ✅ Apply discounts
- ✅ View all bookings
- ✅ Assign cancellation policies
- ✅ Assign instructors
- ✅ Mark bookings as completed

#### CONFIGURATION
- ✅ Create/edit/delete cancellation policies
- ✅ Configure fuel rates
- ✅ Configure package add-on costs
- ✅ Manage company locations
- ✅ Set pricing tables

#### FLEET MANAGEMENT
- ✅ Edit boat specifications
- ✅ Configure fuel consumption rates
- ✅ Toggle boat availability

#### REPORTS
- ✅ View all reports
- ✅ Download export data

#### RESTRICTIONS
- ❌ Cannot delete "Standard" cancellation policy
- ❌ Cannot manage users/roles
- ❌ Cannot modify company core settings
- ⚠️ Company isolation enforced

---

### 3. OFFICE STAFF (Administrative Support)
**Purpose:** Administrative and operational support

#### DASHBOARD ACCESS
- ✅ Booking management (create, read, update)
- ✅ Fleet management (view only, edit boats)
- ✅ Reports (read-only)
- ✅ Settings (view configuration)
- ✅ Blocked slots management
- ✅ Calendar view (all bookings)
- ✅ Customers management (view, edit)
- ✅ Payments tracking

#### BOOKINGS
- ✅ Create any booking type
- ✅ Edit any booking
- ✅ Assign/remove captains and sailors
- ✅ Apply discounts
- ✅ Assign cancellation policies
- ✅ Assign instructors
- ✅ View all bookings

#### CONFIGURATION
- ✅ Configure fuel rates
- ✅ Configure package add-on costs
- ✅ Manage company locations
- ✅ Create/edit cancellation policies

#### FLEET MANAGEMENT
- ✅ View boat details
- ✅ Configure fuel rates per boat
- ✅ View availability status

#### REPORTS
- ✅ View all reports (read-only)

#### RESTRICTIONS
- ❌ Cannot delete cancellation policies
- ❌ Cannot delete boats
- ❌ Cannot record payments
- ❌ Cannot add/modify pricing tables
- ⚠️ Company isolation enforced

---

### 4. POWER AGENT (Advanced Sales Agent)
**Purpose:** High-volume booking and sales management

#### DASHBOARD ACCESS
- ✅ Quick book (create bookings)
- ✅ My bookings (view own bookings)
- ✅ Blocked slots management (view/create)
- ✅ Calendar view (view only)
- ✅ Fleet management (view only)

#### BOOKINGS
- ✅ Create COMMERCIAL bookings only
- ✅ Edit own bookings
- ❌ Cannot create non-commercial bookings (club_activity, sailing_school, etc.)
- ❌ Cannot assign captains/sailors
- ❌ Cannot change cancellation policies
- ✅ View own bookings only

#### BLOCKED SLOTS
- ✅ Create blocked slots
- ✅ View blocked slots
- ✅ Delete own blocked slots

#### RESTRICTIONS
- ❌ Cannot see admin/manager dashboards
- ❌ Cannot access reports
- ❌ Cannot modify configuration
- ❌ Cannot manage crew
- ❌ Cannot access pricing tables
- ❌ Limited to commercial bookings only
- ⚠️ Company isolation enforced

---

### 5. REGULAR AGENT (Basic Sales Agent)
**Purpose:** Basic booking creation

#### DASHBOARD ACCESS
- ✅ Quick book (create bookings)
- ✅ My bookings (view own bookings)
- ✅ Calendar view (view only)
- ✅ Fleet management (view only)

#### BOOKINGS
- ✅ Create COMMERCIAL bookings only
- ✅ Edit own bookings (limited fields)
- ❌ Cannot create non-commercial bookings
- ❌ Cannot assign captains/sailors
- ❌ Cannot change cancellation policies
- ✅ View own bookings only

#### BLOCKED SLOTS
- ❌ Cannot create/manage blocked slots

#### RESTRICTIONS
- ❌ Cannot see admin/manager dashboards
- ❌ Cannot access reports
- ❌ Cannot modify configuration
- ❌ Cannot manage crew
- ❌ Limited to commercial bookings
- ⚠️ Company isolation enforced

---

### 6. CAPTAIN (Boat Operator)
**Purpose:** Operational crew member, instructor-capable

#### DASHBOARD ACCESS
- ✅ My bookings (assigned bookings only)
- ✅ Weather information

#### BOOKINGS
- ✅ View assigned bookings
- ❌ Cannot create/edit bookings
- ❌ Cannot manage other crew
- ✅ Can be assigned as instructor
- ✅ Receives instructor fee when assigned

#### RESTRICTIONS
- ❌ Cannot access booking creation
- ❌ Cannot access admin functions
- ❌ Cannot access reports
- ❌ Cannot modify bookings
- ✅ Read-only access to own assignments

#### SPECIAL CAPABILITIES
- ✅ Can have "instructor" role (new)
- ✅ Can be assigned to sailing school bookings
- ✅ Can earn instructor fees

---

### 7. SAILOR (Crew Member)
**Purpose:** Support crew member

#### DASHBOARD ACCESS
- ✅ My bookings (assigned bookings only)
- ✅ Weather information

#### BOOKINGS
- ✅ View assigned bookings
- ❌ Cannot create/edit bookings
- ❌ Cannot manage other crew

#### RESTRICTIONS
- ❌ Cannot access booking creation
- ❌ Cannot access admin functions
- ❌ Cannot access reports
- ❌ Cannot modify bookings
- ✅ Read-only access to own assignments

---

### 8. ACCOUNTANT (Financial Manager)
**Purpose:** Financial operations and payment tracking

#### DASHBOARD ACCESS
- ✅ Payments section
- ✅ Reports (financial data only)

#### CAPABILITIES
- ✅ Record payment transactions
- ✅ View payment history
- ✅ Manage payment records
- ✅ View financial reports

#### RESTRICTIONS
- ❌ Cannot create/edit bookings
- ❌ Cannot manage crew
- ❌ Cannot modify configuration
- ❌ Limited to financial operations only
- ⚠️ Company isolation enforced

---

### 9. INSTRUCTOR (Educational Specialist)
**Purpose:** Training and education role

#### DASHBOARD ACCESS
- ✅ View instructor bookings
- ✅ View instructor statistics
- ✅ My bookings (sailing school & private class)

#### CAPABILITIES
- ✅ Be assigned to sailing school bookings
- ✅ Be assigned to private class bookings
- ✅ Earn instructor fees
- ✅ View hourly rate information
- ✅ View teaching hours and earnings

#### RESTRICTIONS
- ❌ Cannot create/edit bookings
- ❌ Cannot manage configuration
- ❌ Cannot access most admin functions
- ⚠️ Company isolation enforced

---

## PERMISSION MATRIX (QUICK REFERENCE)

| Action | Admin | Manager | Office | P.Agent | R.Agent | Captain | Sailor | Accountant | Instructor |
|--------|-------|---------|--------|---------|---------|---------|--------|------------|-----------|
| **BOOKINGS** |
| Create any booking | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create commercial | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create sailing school | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create with discount | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit any booking | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit own booking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign captain | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign sailors | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign instructor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Change policy | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View all bookings | ✅ | ✅ | ✅ | ❌ | ❌ | ✅* | ✅* | ❌ | ✅* |
| View own bookings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **CONFIGURATION** |
| Create policy | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit policy | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete policy | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configure fuel | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configure addons | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **FLEET** |
| View boats | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Add/edit boat | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete boat | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **REPORTS** |
| View reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅* | ❌ |
| Export data | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PAYMENTS** |
| Record payment | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View payments | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **OTHER** |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Blocked slots | ✅ | ✅ | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Can do
- ❌ = Cannot do
- ✅* = Own items only / Limited access

---

## API ENDPOINT ACCESS MATRIX

| Endpoint | Admin | Manager | Office | P.Agent | R.Agent | Captain | Sailor | Accountant | Instructor |
|----------|-------|---------|--------|---------|---------|---------|--------|------------|-----------|
| `/api/bookings/create` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/bookings/edit` | ✅ | ✅ | ✅ | ✅* | ✅* | ❌ | ❌ | ❌ | ❌ |
| `/api/bookings/dashboard` | ✅ | ✅ | ✅ | ✅* | ✅* | ✅ | ✅ | ❌ | ✅* |
| `/api/bookings/sailors` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/company/cancellation-policies` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/boats/fuel-config` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/company/package-config` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/payments/record` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/api/company/location` | ✅ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/api/company/info` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## KEY INSIGHTS & RECOMMENDATIONS

### Current Strengths
1. **Clear role separation** between management and sales
2. **Operational roles** (Captain/Sailor) have read-only access
3. **Financial isolation** with accountant role
4. **New instructor role** for educational bookings
5. **Agent restrictions** to commercial bookings

### Areas to Consider Refining

1. **Office Staff Permissions** - Currently has too much access:
   - Can create discounts and internal bookings
   - Can configure system (fuel, addons, policies)
   - Consider separating into: Office Admin + Data Entry roles

2. **Power Agent vs Regular Agent** - Only difference is blocked slots:
   - Consider adding: View profitability, longer booking history
   - Or remove power agent distinction

3. **Manager Limitations** - Cannot:
   - Delete policies (only admin can)
   - Delete boats
   - Record payments
   - Manage users
   - Consider elevating to admin-level for day-to-day operations

4. **Payment Recording** - Only Accountant + Admin can record:
   - Office staff cannot record payments (inconsistency)
   - Consider adding Office Staff to payment recording

5. **Instructor Role** - Could be more sophisticated:
   - Should be able to view/filter their own instructor bookings
   - Should see earnings/hours statistics
   - Consider: Availability scheduling per instructor

6. **New Potential Roles to Consider**:
   - **Supervisor Agent** - Power Agent + Can view team bookings/performance
   - **Support Staff** - Office Staff without configuration access
   - **Assistant Accountant** - Can view payments but not record
   - **Fleet Manager** - Dedicated boat configuration specialist
   - **Marketing Manager** - View reports, manage channels

---

## SECURITY NOTES

✅ **Implemented:**
- Company data isolation via RLS policies
- Role-based access control
- Agent restriction to commercial bookings
- RLS on: payment_transactions, cancellation_policies, bookings

⚠️ **Monitor:**
- Office Staff has broad access - may need sub-roles
- No audit log visible - track changes?
- No permission override capability - is this needed?

---

**Next Steps:**
1. Review role definitions with business stakeholders
2. Identify gaps between intended vs actual access
3. Simplify or merge similar roles (if needed)
4. Add new roles based on business requirements
5. Implement role-specific dashboards/views

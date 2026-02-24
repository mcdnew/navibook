# NaviBook Demo Environment — Happy Sail Estepona

**All demo accounts use the same password: `Demo1234!`**

---

## Demo Company

| Field | Value |
|-------|-------|
| **Name** | Happy Sail Estepona |
| **Location** | Puerto Deportivo de Estepona, Costa del Sol, Spain |
| **Coordinates** | 36.4240°N, 5.1473°W (used in weather widget) |
| **Email** | info@happysail.es |

---

## Login Credentials

| Email | Password | Role | What they see |
|-------|----------|------|---------------|
| `admin@navibook.com` | `Admin123!` | Super Admin | Everything (system-level) |
| `admin@happysail.es` | `Demo1234!` | Admin | Full company control |
| `ops@happysail.es` | `Demo1234!` | Operations Manager | Bookings, crew, reports, payments |
| `agent.marco@happysail.es` | `Demo1234!` | Sales Agent (15% commission) | Own bookings, customers |
| `agent.laura@happysail.es` | `Demo1234!` | Sales Agent (12% commission) | Own bookings, customers |
| `captain.javier@happysail.es` | `Demo1234!` | Captain | My Bookings view (assigned charters) |
| `captain.diego@happysail.es` | `Demo1234!` | Captain | My Bookings view (assigned charters) |
| `sailor.miguel@happysail.es` | `Demo1234!` | Sailor | My Bookings view (assigned charters) |

---

## Fleet

| Boat | Type | Capacity | Captain | Fuel |
|------|------|----------|---------|------|
| **Rayo del Sol** | RIB / Speedboat | 6 pax | Optional (Diego when assigned) | 45 L/h × €1.80 = €81/h |
| **Brisa del Sur** | Sailboat | 8 pax | Javier (always required) | 4 L/h × €1.80 = €7.20/h |
| **Bahía de Oro** | Motor Yacht | 10 pax | Diego (always required) | 55 L/h × €1.80 = €99/h |

---

## Personnel Costs

| Person | Role | Pay Arrangement | Rate |
|--------|------|-----------------|------|
| Javier Ruiz | Captain | Per-day (flat) | **€120 / booking** |
| Diego Santos | Captain | Per-hour | **€25 / hour** |
| Miguel Torres | Sailor | Per-hour | **€15 / hour** |

**Diego's fee by duration:** 2h=€50 · 3h=€75 · 4h=€100 · 8h=€200
**Miguel's fee by duration:** 2h=€30 · 3h=€45 · 4h=€60 · 8h=€120

---

## Packages & Amenity Costs

| Package | Included | Cost (operator) |
|---------|----------|-----------------|
| `charter_only` | Boat + captain only | — |
| `charter_drinks` | + Soft drinks, water, beer, sangria | **€12 / person** |
| `charter_food` | + Tapas, bocadillos, catering platters | **€22 / person** |
| `charter_full` | + Drinks & Food | **€34 / person** |

---

## Sample Pricing (Brisa del Sur — Sailboat)

| Duration | Charter Only | + Drinks | + Food | Full Package |
|----------|-------------|----------|--------|--------------|
| 2 hours | €190 | €225 | €250 | €285 |
| 3 hours | €260 | €308 | €342 | €390 |
| 4 hours | €330 | €391 | €434 | €495 |
| 8 hours | €590 | €699 | €777 | €887 |

---

## Demo Data Overview

**Date range:** November 2025 → March 17, 2026 (3 months history + 3 weeks future)

| Status | Count |
|--------|-------|
| Completed | 30 |
| Confirmed (upcoming) | 18 |
| Cancelled | 4 |
| No-show | 2 |
| Pending hold | 1 |
| **Total** | **55** |

**Financial snapshot (non-cancelled):**

| Metric | Value |
|--------|-------|
| Total revenue | €29,798 |
| Captain fees | €4,785 |
| Sailor fees | €840 |
| Fuel costs | €12,667 |
| Payment transactions | 77 |

---

## Key Customers for Demo Stories

| Customer | Type | Bookings | Notes |
|----------|------|----------|-------|
| **Elena Vásquez** | VIP | 4 | Champagne on arrival, prefers Brisa del Sur; Valentine's Day special |
| **Marco & Giulia Bianchi** | Repeat | 3 | Anniversary trips, motor yacht preferred |
| **James Mitchell** | Repeat | 2 | London tourist, Christmas + Feb visits |
| **Sophie Andersen** | Repeat | 3 | Danish sailor, always books Brisa del Sur |
| **Michael O'Brien** | Cancelled + Rebooked | 2 | Cancelled Dec (Levante wind), rebooked for Mar 10 full-day |
| **Patrick O'Sullivan** | Multi-service | 2 | Mar 1 full-day with sailor Miguel assigned |

**Customer notes** (visible in /customers): Elena, Bianchi, Mitchell, Andersen have saved notes and preferences.

---

## Waitlist & Special Entries

| Entry | Type | Detail |
|-------|------|--------|
| Oliver Schmidt | Waitlist (active) | Corporate event, wants Bahía de Oro full-day, Mar ~19 |
| Camille Moreau | Waitlist (contacted) | Bachelorette sailing party, 6 pax, Brisa del Sur |
| Rayo del Sol — Mar 19 | Blocked slot | Annual engine service + hull inspection (all day) |

---

## Testing Scenarios

### 1. New Booking (Quick Book)
- Login as `agent.marco@happysail.es`
- Go to **Quick Book** (`/quick-book`)
- Select Bahía de Oro, 4h, charter_full, Diego as captain → pricing loads
- Submit → watch the 15-min hold timer

### 2. Captain's View
- Login as `captain.javier@happysail.es`
- Redirects automatically to **My Bookings** (`/my-bookings`)
- Shows upcoming sailboat assignments with dates, times, passengers, earnings

### 3. VIP Customer Portal
- Open any Elena Vásquez booking → generate portal link
- Share portal URL → customer can view booking and request changes
- Change requests come back to admin via email notification

### 4. Cost Analytics (Reports)
- Login as admin → go to **Reports** (`/reports`)
- Filter by boat to see Bahía de Oro profitability (high fuel, high revenue)
- Compare Javier (flat €120) vs Diego (€25/h × hours) for same duration
- Sailboat Brisa del Sur has minimal fuel costs (€7.20/h vs €99/h for motor yacht)

### 5. Calendar / Availability
- Go to **Calendar** (`/calendar`)
- See Rayo del Sol blocked on Mar 19 (maintenance)
- See busy days with multiple boats booked simultaneously

### 6. Agent Commission
- Go to **Agents** (`/agents`)
- Marco: 15% commission — on a €840 booking = €126 commission
- Laura: 12% commission

### 7. Waitlist Management
- Go to **Waitlist** (`/waitlist`)
- Oliver Schmidt wants Bahía de Oro (it's fully booked) → contact when available
- Camille Moreau — bachelorette party, status: contacted

### 8. Payment Flow
- Go to **Payments** (`/payments`)
- 77 transactions recorded across methods (card, cash, bank transfer)
- Completed bookings have deposit + final payment entries

---

## Resetting Demo Data

To restore the demo to this state at any time:

```bash
node scripts/seed-demo-data.js
```

This fully resets all data while preserving `admin@navibook.com`.

---

*NaviBook Day-Charter · Demo Environment · Happy Sail Estepona*
*Last seeded: February 2026*

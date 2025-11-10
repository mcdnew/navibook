# 🏗️ NaviBook System Architecture

**Last Updated:** 2025-11-09
**System Version:** 0.1.0-alpha
**Tech Stack:** Next.js 14, Supabase, TypeScript

---

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Agent Mobile │  │ Admin Desktop│  │ Captain App  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
     ┌────▼──────────────────▼──────────────────▼────┐
     │           NEXT.JS 14 APP ROUTER                │
     │  ┌──────────────────────────────────────────┐ │
     │  │         Middleware (Auth Check)          │ │
     │  └──────────────────────────────────────────┘ │
     │  ┌──────────────┐  ┌───────────────────────┐ │
     │  │  API Routes  │  │   Server Components   │ │
     │  └──────┬───────┘  └──────┬────────────────┘ │
     └─────────┼──────────────────┼───────────────────┘
               │                  │
          ┌────▼──────────────────▼────┐
          │   SUPABASE (Backend)        │
          │  ┌────────────────────────┐ │
          │  │  PostgreSQL Database   │ │
          │  │  - 12 Tables           │ │
          │  │  - RLS Policies        │ │
          │  │  - Triggers            │ │
          │  │  - Functions           │ │
          │  └────────────────────────┘ │
          │  ┌────────────────────────┐ │
          │  │  Realtime Engine       │ │
          │  │  - WebSocket subscr.   │ │
          │  └────────────────────────┘ │
          │  ┌────────────────────────┐ │
          │  │  Auth System           │ │
          │  │  - Email/Password      │ │
          │  │  - JWT Tokens          │ │
          │  └────────────────────────┘ │
          └─────────────────────────────┘
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
companies
    ├──< users (company_id)
    │      ├──< bookings (agent_id)
    │      ├──< bookings (captain_id)
    │      ├──< agent_commissions (agent_id)
    │      ├──< captain_fees (captain_id)
    │      └──< boat_blocks (created_by)
    │
    ├──< boats (company_id)
    │      ├──< pricing (boat_id)
    │      ├──< bookings (boat_id)
    │      ├──< boat_blocks (boat_id)
    │      └──< weather_suitability (boat_id)
    │
    └──< weather_forecasts (company_id)
           └──< weather_suitability (forecast_id)

booking
    └──< booking_history (booking_id)
    └──< external_bookings (booking_id)
```

### Core Tables Detail

#### 1. **companies** - Multi-tenant Support
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
address         TEXT
phone           TEXT
email           TEXT
tax_id          TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```
**Purpose:** Support multiple charter companies
**RLS:** Users can only see their company

#### 2. **users** - User Accounts
```sql
id                      UUID PRIMARY KEY → auth.users(id)
company_id              UUID → companies(id)
role                    user_role (enum)
first_name              TEXT NOT NULL
last_name               TEXT NOT NULL
email                   TEXT UNIQUE
phone                   TEXT
commission_percentage   DECIMAL(5,2)
commission_fixed        DECIMAL(10,2)
is_active               BOOLEAN
device_fingerprint      TEXT
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```
**Roles:** admin, office_staff, manager, accountant, power_agent, regular_agent, captain
**RLS:** Users see only company users; can edit own profile

#### 3. **boats** - Fleet Management
```sql
id              UUID PRIMARY KEY
company_id      UUID → companies(id)
name            TEXT NOT NULL
boat_type       boat_type (enum: sailboat, motorboat, jetski)
capacity        INTEGER
description     TEXT
image_url       TEXT
license_number  TEXT
is_active       BOOLEAN
hourly_rate     DECIMAL(10,2)
daily_rate      DECIMAL(10,2)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```
**Purpose:** Track available boats
**RLS:** View company boats; admin can modify

#### 4. **pricing** - Duration-based Pricing
```sql
id           UUID PRIMARY KEY
boat_id      UUID → boats(id)
duration     duration_type (enum: 2h, 3h, 4h, 8h)
package_type package_type (enum)
price        DECIMAL(10,2)
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
UNIQUE(boat_id, duration, package_type)
```
**Purpose:** Flexible pricing per boat/duration/package
**RLS:** View company pricing; admin can modify

#### 5. **bookings** - Main Booking Table ⭐
```sql
id                  UUID PRIMARY KEY
company_id          UUID → companies(id)
boat_id             UUID → boats(id)
agent_id            UUID → users(id)
captain_id          UUID → users(id)
-- Booking details
booking_date        DATE
start_time          TIME
end_time            TIME
duration            duration_type
-- Customer
customer_name       TEXT NOT NULL
customer_email      TEXT
customer_phone      TEXT NOT NULL
passengers          INTEGER
-- Pricing
package_type        package_type
total_price         DECIMAL(10,2)
deposit_amount      DECIMAL(10,2)
deposit_paid        BOOLEAN
-- Commission
agent_commission    DECIMAL(10,2)
captain_fee         DECIMAL(10,2)
-- Status
status              booking_status
source              TEXT (direct, website, hotel)
notes               TEXT
hold_until          TIMESTAMPTZ (15-min soft hold)
-- Audit
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
completed_at        TIMESTAMPTZ
cancelled_at        TIMESTAMPTZ
cancellation_reason TEXT
-- Anti-double-booking constraint
CONSTRAINT no_overlap EXCLUDE USING gist (
    boat_id WITH =,
    tstzrange(
        date_time_to_timestamptz(booking_date, start_time),
        date_time_to_timestamptz(booking_date, end_time)
    ) WITH &&
) WHERE (status NOT IN ('cancelled', 'no_show'))
```
**Critical Features:**
- ✅ GIST exclusion constraint prevents double bookings at database level
- ✅ Auto-calculates commission via trigger
- ✅ Soft hold mechanism (15-minute window)
- ✅ Comprehensive audit trail

**RLS:** Agents see own bookings; admin/office see all

---

## 🔐 Security Architecture

### Row Level Security (RLS) Policies

**Philosophy:** Secure by default - database enforces access control

#### User Access Patterns

```sql
-- Helper function: Get user's role
CREATE FUNCTION get_user_role() RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: Check if admin/office
CREATE FUNCTION is_admin_or_office() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'office_staff', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

#### Critical Policies

**Bookings (Most Important!):**
```sql
-- Agents see only their bookings
-- Admin/Office see all
CREATE POLICY "View bookings based on role"
  ON bookings FOR SELECT
  USING (
    company_id = get_user_company()
    AND (
      is_admin_or_office()
      OR agent_id = auth.uid()
      OR captain_id = auth.uid()
    )
  );
```

**Security Levels:**
1. **Database Level:** RLS policies (cannot bypass)
2. **API Level:** Middleware auth check
3. **UI Level:** Conditional rendering

---

## 🏛️ Application Architecture

### Folder Structure

```
day-charter/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── actions.ts            # Server actions
│   ├── (dashboard)/              # Desktop layout
│   │   ├── dashboard/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── fleet/page.tsx
│   │   ├── agents/page.tsx
│   │   ├── reports/page.tsx
│   │   └── calendar/page.tsx
│   ├── (mobile)/                 # Mobile layout
│   │   ├── quick-book/page.tsx
│   │   └── my-bookings/page.tsx
│   ├── api/                      # API routes
│   │   └── webhooks/
│   │       └── booking/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                       # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── booking/                  # (To be created)
│   │   ├── booking-form.tsx
│   │   ├── availability-checker.tsx
│   │   └── booking-calendar.tsx
│   └── fleet/
│       ├── boat-card.tsx
│       └── boat-status.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── types.ts             # Generated types
│   ├── hooks/                   # (To be created)
│   │   ├── use-bookings.ts
│   │   ├── use-realtime.ts
│   │   └── use-weather.ts
│   ├── stores/                  # (To be created)
│   │   ├── booking-store.ts
│   │   └── user-store.ts
│   └── utils/
│       └── utils.ts             # cn() helper
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   └── functions/               # Edge functions
│       └── fetch-weather/
├── scripts/
│   ├── migrate.js               # Run migrations
│   ├── seed-data.js             # Seed test data
│   └── enable-realtime.js       # Enable realtime
├── middleware.ts                # Auth middleware
├── .env.local                   # Environment vars
└── [Documentation files]
```

---

## 🔄 Data Flow Patterns

### 1. **Booking Creation Flow**

```
User fills form → Client validation (Zod)
                 ↓
              Form submit (server action)
                 ↓
              Server validation
                 ↓
              Check availability (SQL function)
                 ↓
              Create booking with hold
                 ↓
              Database trigger:
                - Calculate commission
                - Log history
                - Notify realtime
                 ↓
              Return success/error
                 ↓
              Update UI (optimistic)
```

### 2. **Real-time Update Flow**

```
User A creates booking
        ↓
Database INSERT
        ↓
PostgreSQL NOTIFY
        ↓
Supabase Realtime broadcasts
        ↓
User B's browser receives via WebSocket
        ↓
React Query invalidates cache
        ↓
UI re-renders with new data
```

### 3. **Authentication Flow**

```
User enters credentials
        ↓
Submit to server action
        ↓
Supabase Auth validates
        ↓
JWT token generated
        ↓
Token stored in cookie (httpOnly)
        ↓
Middleware reads token on each request
        ↓
Validates & refreshes if needed
        ↓
Proceeds or redirects to /login
```

---

## 🎨 UI/UX Patterns

### Component Patterns

**Server Components** (Default):
```tsx
// Fetches data on server, no client JS
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('boats').select()
  return <div>{/* render */}</div>
}
```

**Client Components** (Interactive):
```tsx
'use client'
// Forms, interactive elements
export function BookingForm() {
  const [state, setState] = useState()
  return <form>{/* interactive */}</form>
}
```

**Server Actions** (Mutations):
```tsx
'use server'
// Database mutations
export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  // ... mutation logic
  revalidatePath('/bookings')
  redirect('/bookings')
}
```

---

## 🚀 Performance Optimizations

### 1. **Database**
- ✅ Indexes on frequently queried columns
- ✅ GIST indexes for geometric operations
- ✅ Efficient RLS policies with helper functions
- 🔄 Query optimization (to be monitored)

### 2. **Frontend**
- ✅ Server-side rendering (SSR)
- ✅ Static generation where possible
- 🔄 Image optimization (when images added)
- 🔄 Code splitting (automatic with Next.js)

### 3. **Caching**
- ✅ React Query for data caching
- ✅ Next.js automatic caching
- 🔄 Redis for session storage (future)
- 🔄 CDN for static assets (production)

---

## 🔌 API Architecture

### Internal APIs (Server Actions)

**Location:** `app/(auth)/actions.ts`, etc.
**Pattern:** Server Actions (Next.js 14)
**Security:** Automatic CSRF protection

```typescript
'use server'
export async function login(formData: FormData) {
  // Runs on server only
  // Direct database access
  // Type-safe
}
```

### External APIs (REST)

**Location:** `app/api/webhooks/*/route.ts`
**Pattern:** Route Handlers
**Auth:** API key validation

```typescript
// app/api/webhooks/booking/route.ts
export async function POST(request: Request) {
  // Validate API key
  // Process webhook
  // Return JSON response
}
```

---

## 🛠️ Development Tools

### Code Quality
- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js recommended config
- **Prettier:** (to be added)

### Testing Stack (Future)
- **Unit:** Vitest
- **Integration:** Testing Library
- **E2E:** Playwright
- **API:** Supertest

### Monitoring (Production)
- **Errors:** Sentry
- **Analytics:** Vercel Analytics
- **Performance:** Web Vitals
- **Database:** Supabase Metrics

---

## 📦 Deployment Architecture

```
GitHub Repository
        ↓
    Git Push
        ↓
Vercel (Auto Deploy)
        ↓
    Build Process:
    - TypeScript compile
    - Next.js build
    - Optimize assets
        ↓
    Deploy to Edge
        ↓
Production URLs:
- Main: navibook.vercel.app
- Preview: [branch].navibook.vercel.app
```

**Environment:**
- **Dev:** localhost:3000
- **Preview:** Vercel preview deployments
- **Production:** Custom domain (future)

---

## 🔮 Future Architecture Considerations

### Scalability
- [ ] Redis for session storage
- [ ] Separate read/write databases
- [ ] Message queue for async tasks
- [ ] Microservices for specific features

### Performance
- [ ] Database query optimization
- [ ] CDN for static assets
- [ ] Image optimization service
- [ ] Lazy loading strategies

### Security
- [ ] Rate limiting
- [ ] DDoS protection
- [ ] SQL injection prevention (Supabase handles)
- [ ] XSS protection (React handles)

---

**Last Updated:** 2025-11-09
**Next Review:** When adding booking system
**Maintainer:** Development Team

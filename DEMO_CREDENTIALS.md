# 🔐 NaviBook Demo Credentials

**⚠️ FOR DEMO/TESTING ONLY - NOT FOR PRODUCTION**

## Quick Reference Table

| Name | Role | Email | Password | Commission | Notes |
|------|------|-------|----------|------------|-------|
| **Your Admin** | Admin | `admin@navibook.com` | `Admin123!` | N/A | Your preserved account |
| Maria Rodriguez | Office Manager | `maria@sunsetcharters.com` | `Demo2025!` | 0% | Front desk operations |
| Carlos Navarro | Power Agent | `carlos@sunsetcharters.com` | `Demo2025!` | 15% | Top performer |
| Sofia Garcia | Regular Agent | `sofia@sunsetcharters.com` | `Demo2025!` | 10% | Experienced agent |
| Pablo Martinez | Regular Agent | `pablo@sunsetcharters.com` | `Demo2025!` | 10% | Motor yacht specialist |
| Elena Sanchez | Regular Agent | `elena@sunsetcharters.com` | `Demo2025!` | 8% | New agent |
| Captain Juan Molina | Captain (Owner) | `juan@sunsetcharters.com` | `Demo2025!` | €0/h | Owner, sailboats |
| Captain Marco Vidal | Captain | `marco@sunsetcharters.com` | `Demo2025!` | €35/h | Motor yachts |
| Captain Luis Torres | Captain | `luis@sunsetcharters.com` | `Demo2025!` | €25/h | Junior captain |

---

## 🎭 Demo Personas

### 👑 Admin - Full System Access
**Login**: `admin@navibook.com` / `Admin123!`

**Use for demonstrating**:
- Complete system overview
- All management functions
- Fleet and user management
- All reports and analytics
- System settings

**Key Features**:
- Full calendar access (all bookings)
- User management
- Fleet management (add/edit/delete boats)
- Blocked slots management
- All reports
- Payment oversight

---

### 🏢 Maria - Office Manager
**Login**: `maria@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- Front desk operations
- Walk-in customer handling
- Waitlist management
- Booking modifications
- No commission focus

**Key Features**:
- Create bookings (no commission)
- Manage waitlist
- Block slots for maintenance
- Handle cancellations/refunds
- Customer service focus

---

### ⚡ Carlos - Power Agent (Top Performer)
**Login**: `carlos@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- High-performing sales agent
- VIP client handling
- Highest commission rate
- Extended permissions

**Key Features**:
- 15% commission rate
- ~30% of all bookings
- Quick book interface
- Advanced booking tools
- Broader calendar view

**Demo Stats**: ~€4,950 in commissions

---

### 👤 Sofia - Regular Agent
**Login**: `sofia@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- Standard agent workflow
- Family-focused bookings
- Typical commission structure

**Key Features**:
- 10% commission rate
- ~25% of all bookings
- Quick book interface
- Own bookings view

**Demo Stats**: ~€2,750 in commissions

---

### 👤 Pablo - Regular Agent
**Login**: `pablo@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- Motor yacht specialist
- Solid performer
- Standard agent tools

**Key Features**:
- 10% commission rate
- ~22% of all bookings
- Motor boat focus
- Standard permissions

**Demo Stats**: ~€2,420 in commissions

---

### 🆕 Elena - New Agent
**Login**: `elena@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- New agent onboarding
- Lower commission (training rate)
- Growing performance

**Key Features**:
- 8% commission rate (training)
- ~15% of all bookings
- Learning curve visible in stats
- Same tools as experienced agents

**Demo Stats**: ~€1,320 in commissions

---

### ⛵ Captain Juan - Owner & Senior Captain
**Login**: `juan@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- Captain's daily schedule
- Assigned charters view
- Charter completion workflow
- Owner perspective

**Key Features**:
- €0/hour rate (owner)
- Pre-assigned to: Mediterranean Dream, Sea Breeze
- 25+ years experience
- Can complete charters
- View assigned bookings

---

### 🚤 Captain Marco - Professional Captain
**Login**: `marco@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- Paid captain workflow
- Motor yacht operations
- Professional crew member

**Key Features**:
- €35/hour rate
- Pre-assigned to: Island Hopper, Rapid Express
- Can view schedule
- Can complete charters
- Track hours worked

---

### 🆕 Captain Luis - Junior Captain
**Login**: `luis@sunsetcharters.com` / `Demo2025!`

**Use for demonstrating**:
- Junior crew member
- Backup/assistant captain
- Entry-level professional

**Key Features**:
- €25/hour rate
- Assists with: Mediterranean Dream, Sea Breeze
- Learning from Juan
- Growing experience

---

## 🎬 Quick Demo Scenarios

### Scenario 1: Quick Booking (5 min)
1. Login as **Carlos** (`carlos@sunsetcharters.com` / `Demo2025!`)
2. Click "New Booking" or go to `/quick-book`
3. Select tomorrow's date
4. Choose 10:00 AM start time
5. Duration: 4 hours
6. Passengers: 6
7. Select "Island Hopper" (motorboat)
8. Choose package: Full Package (€1,080)
9. See commission: €162 (15%)
10. Fill customer details
11. Confirm booking ✅

### Scenario 2: Waitlist Conversion (3 min)
1. Login as **Maria** (`maria@sunsetcharters.com` / `Demo2025!`)
2. Go to Waitlist page
3. Find an active entry
4. Click "Convert to Booking"
5. Select available date/boat
6. Complete conversion ✅

### Scenario 3: Captain Schedule (2 min)
1. Login as **Juan** (`juan@sunsetcharters.com` / `Demo2025!`)
2. View dashboard
3. See today's assigned charters
4. Check customer details
5. Complete a charter ✅

### Scenario 4: Admin Overview (5 min)
1. Login as **Admin** (`admin@navibook.com` / `Admin123!`)
2. View dashboard statistics
3. Open calendar (see all boats)
4. Check fleet management
5. View reports ✅

---

## 📊 Expected Data After Seeding

- **Company**: Sunset Charters Mallorca
- **Users**: 9 total (1 admin + 8 demo users)
- **Boats**: 6 (2 sailboats, 2 motorboats, 2 jetskis)
- **Bookings**: ~190 (spanning 4 months)
  - Completed: ~65
  - Confirmed: ~85
  - Pending: ~15
  - Cancelled: ~10
  - No-show: ~5
- **Payments**: ~120-150 transactions
- **Waitlist**: ~20 entries
- **Blocked Slots**: ~12 maintenance/weather blocks

---

## 🔄 Resetting Demo Data

To reset all demo data to fresh state:

```bash
# Run the seed script
node scripts/seed-demo-data.js

# Or via npm/pnpm
npm run seed-demo
# or
pnpm seed-demo
```

This will:
1. ✅ Preserve your admin account (`admin@navibook.com`)
2. ✅ Clear all other data
3. ✅ Re-create fresh demo data
4. ✅ Generate new bookings/payments
5. ✅ Save seed data to `scripts/seed-data.json`

**Perfect before**:
- Client demos
- Training sessions
- Testing new features
- Showing to stakeholders

---

## ⚠️ Security Notes

### Demo Environment
- **✅ Safe for demos**: All data is fictional
- **✅ Easy passwords**: `Demo2025!` for all demo users
- **✅ No real data**: Generated names, phones, emails
- **✅ Repeatable**: Can reset anytime

### Production Environment
- **❌ DO NOT use these credentials in production**
- **❌ DO NOT keep demo users in production**
- **❌ Change admin password immediately**
- **❌ Delete all demo data before go-live**

### Before Production Launch
1. Run a final seed reset
2. Delete all demo users
3. Delete all demo bookings
4. Create real company data
5. Set strong unique passwords
6. Enable 2FA for admin accounts

---

## 💡 Tips for Effective Demos

### Preparation (5 min before)
1. Reset demo data: `node scripts/seed-demo-data.js`
2. Clear browser cache
3. Test login for 2-3 key users
4. Open key pages in tabs (dashboard, calendar, quick-book)
5. Have customer names ready

### During Demo
1. **Start big**: Login as admin, show overview
2. **Go specific**: Switch to agent, show workflow
3. **Show value**: Highlight commission tracking, real-time updates
4. **Be natural**: Use realistic customer names
5. **Handle questions**: All credentials are in this doc

### After Demo
1. Collect feedback
2. Note feature requests
3. Reset data for next demo

---

## 📞 Support

If you need to reset passwords or have issues:

1. **Reset admin password**: Use Supabase dashboard
2. **Re-run seed**: `node scripts/seed-demo-data.js`
3. **Check logs**: See console output during seeding
4. **Verify data**: Run test queries in Supabase

---

**Last Updated**: 2025-01-12
**Script Version**: 1.0
**Status**: ✅ Ready for Use

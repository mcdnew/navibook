# 🎯 NaviBook Resume Guide

**Quick Start Checklist for Resuming Work**

---

## ⚡ Quick Resume (5 Minutes)

### Step 1: Read Project Memory (2 min)
```bash
cd /path/to/day-charter
```

**Read in this order:**
1. `PROJECT_TRACKER.md` - Get current status
2. Last entry in `DEVELOPMENT_LOG.md` - What was done last
3. `TODO.md` - What's next

### Step 2: Environment Check (1 min)
```bash
# Check environment file exists
ls -la .env.local

# Should see:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# DATABASE_URL=...
```

### Step 3: Start Development Server (2 min)
```bash
# Install any new dependencies
pnpm install

# Start dev server
pnpm run dev
```

**Server should start at:** http://localhost:3000

### Step 4: Quick Test
- ✅ Visit http://localhost:3000 (should show boats)
- ✅ Visit http://localhost:3000/login
- ✅ Login with: admin@navibook.com / Admin123!
- ✅ Check dashboard loads

**If all ✅ → You're ready to code!**

---

## 📋 Detailed Resume (15 Minutes)

### Phase 1: Review Documentation (5 min)

**Read These Files:**

1. **PROJECT_TRACKER.md** ← START HERE
   - Current status overview
   - Last session summary
   - Next session plan

2. **DEVELOPMENT_LOG.md**
   - What was built
   - Decisions made
   - Issues encountered

3. **TODO.md**
   - Current sprint tasks
   - Backlog priorities

4. **ARCHITECTURE.md** (if needed)
   - Technical details
   - Database schema
   - Code patterns

**Questions to Answer:**
- [ ] What phase are we in?
- [ ] What's working?
- [ ] What's not working yet?
- [ ] What's the next priority?

---

### Phase 2: Environment Setup (5 min)

#### Check Node & pnpm
```bash
node --version    # Should be 18+
pnpm --version    # Should be 8+
```

#### Verify Database Connection
```bash
# Test migration script
node scripts/migrate.js

# Should see:
# "Already applied" or "Success"
```

#### Check Supabase
1. Go to https://supabase.com/dashboard
2. Find project: bsrmjbqmlzamluhfmwus
3. Check Tables → Should see 12 tables
4. Check Auth → Should see admin user

---

### Phase 3: Code Review (5 min)

#### Review Recent Changes
```bash
# See what files changed
git status

# See recent commits (if using git)
git log --oneline -10
```

#### Check Key Files
```bash
# Current auth implementation
cat app/(auth)/actions.ts

# Current pages
ls -R app/(dashboard)
ls -R app/(mobile)

# Database schema
ls supabase/migrations
```

#### Test Current Features
1. **Home Page:** http://localhost:3000
   - Should show 6 boats
   - Database Connected badge

2. **Login:** http://localhost:3000/login
   - Test login: admin@navibook.com / Admin123!

3. **Dashboard:** http://localhost:3000/dashboard
   - Check all stats load
   - Try quick action buttons

4. **Pages:** Test these URLs
   - /bookings
   - /fleet
   - /agents
   - /reports
   - /calendar

**All should work without 404 errors**

---

## 🔍 Troubleshooting Guide

### Issue: Server Won't Start

**Error:** `Port 3000 already in use`
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 [PID]

# Or use different port
PORT=3001 pnpm run dev
```

**Error:** `Module not found`
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

---

### Issue: Database Connection Error

**Error:** `Failed to connect to database`

**Fix:**
1. Check `.env.local` exists
2. Verify Supabase URL is correct
3. Test connection:
```bash
node scripts/migrate.js
```

**If still failing:**
1. Go to Supabase Dashboard
2. Check project is not paused
3. Verify database password
4. Update DATABASE_URL in `.env.local`

---

### Issue: Login Not Working

**Error:** `Invalid credentials` or `User not found`

**Fix:**
1. Check admin user exists:
   - Go to Supabase → Authentication → Users
   - Should see admin@navibook.com

2. Reset admin user:
```bash
node scripts/seed-data.js
```

3. Try login again with:
   - Email: admin@navibook.com
   - Password: Admin123!

---

### Issue: Pages Showing 404

**Error:** `This page could not be found`

**Fix:**
1. Check file exists:
```bash
ls app/(dashboard)/bookings/page.tsx
# Should exist
```

2. Restart dev server:
```bash
# Ctrl+C to stop
pnpm run dev
```

3. Clear Next.js cache:
```bash
rm -rf .next
pnpm run dev
```

---

## 🎯 "Where Do I Start?" Decision Tree

```
Have you read PROJECT_TRACKER.md?
├─ No  → Read it now (2 min)
└─ Yes → Continue

Is dev server running?
├─ No  → Run: pnpm run dev
└─ Yes → Continue

Can you login to the app?
├─ No  → Fix login (see Troubleshooting)
└─ Yes → Continue

What do you want to do?
├─ Continue last work → Check TODO.md current sprint
├─ New feature → Read NEXT_STEPS.md
├─ Fix bug → Check GitHub Issues or TODO.md bugs
├─ Understand code → Read ARCHITECTURE.md
└─ Just explore → Click around the app
```

---

## 🚀 Common Development Tasks

### Create a New Page
```bash
# 1. Create directory
mkdir -p app/(dashboard)/new-page

# 2. Create page file
touch app/(dashboard)/new-page/page.tsx

# 3. Add basic structure
# See ARCHITECTURE.md for patterns
```

### Add a New Database Table
```bash
# 1. Create migration file
touch supabase/migrations/004_new_table.sql

# 2. Write SQL
# See existing migrations for pattern

# 3. Run migration
node scripts/migrate.js
```

### Add a New Component
```bash
# 1. Create component file
touch components/booking/new-component.tsx

# 2. Use shadcn if needed
pnpm dlx shadcn@latest add [component-name]
```

---

## 📊 Progress Checkpoints

### Before Starting Work
- [ ] Read PROJECT_TRACKER.md
- [ ] Check last DEVELOPMENT_LOG.md entry
- [ ] Review current sprint in TODO.md
- [ ] Dev server running (pnpm run dev)
- [ ] Can login to app
- [ ] Know what you're building

### During Development
- [ ] Update TODO.md as you complete tasks
- [ ] Test changes in browser
- [ ] Check console for errors
- [ ] Test on mobile view (DevTools)

### After Finishing Session
- [ ] Update PROJECT_TRACKER.md
- [ ] Add entry to DEVELOPMENT_LOG.md
- [ ] Update TODO.md
- [ ] Commit changes (if using git)
- [ ] Note any blockers or questions

---

## 🎓 Learning Resources

### Next.js 14
- [App Router Docs](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 💡 Pro Tips

**Productivity:**
1. Keep PROJECT_TRACKER.md open in one tab
2. Keep TODO.md open in another
3. Use split screen: Code | Browser
4. Test frequently (don't code for hours without testing)

**Debugging:**
1. Check browser console first
2. Check terminal for build errors
3. Check Supabase logs for database issues
4. Use console.log liberally

**Documentation:**
1. Update docs as you work (not after)
2. Write down decisions immediately
3. Note any "gotchas" you discover

**Breaks:**
1. Update PROJECT_TRACKER before breaks
2. Note "where you were" in comments
3. Commit work-in-progress (git stash if needed)

---

## 🔄 /continue Command (Future)

**Concept:** Type `/continue` and AI analyzes memory files

**What it would do:**
1. Read PROJECT_TRACKER.md
2. Read last DEVELOPMENT_LOG.md entry
3. Check TODO.md current sprint
4. Summarize current state
5. Suggest next steps
6. Ask what you want to build

**For now:** Manually read docs and choose from TODO.md

---

## ✅ Ready to Code!

You're ready when:
- [x] You know what phase the project is in
- [x] You know what was done last
- [x] You know what to build next
- [x] Dev server is running
- [x] You can login to the app
- [x] You've tested basic functionality

**If all checked → Start coding! 🚀**

**If stuck → Refer to Troubleshooting section above**

---

## 📞 Quick Reference Card

```
┌─────────────────────────────────────────┐
│         NAVIBOOK QUICK REFERENCE        │
├─────────────────────────────────────────┤
│ Dev Server: pnpm run dev                │
│ URL: http://localhost:3000              │
│ Login: admin@navibook.com / Admin123!   │
├─────────────────────────────────────────┤
│ Read First: PROJECT_TRACKER.md          │
│ Tasks: TODO.md                          │
│ History: DEVELOPMENT_LOG.md             │
│ Technical: ARCHITECTURE.md              │
├─────────────────────────────────────────┤
│ Database: Supabase Dashboard            │
│ Tables: 12                              │
│ Test Boats: 6                           │
├─────────────────────────────────────────┤
│ Current Phase: 2 (Core Features)        │
│ Progress: 35%                           │
│ Next: Booking Creation System           │
└─────────────────────────────────────────┘
```

Print this and keep it visible! 📌

---

**Last Updated:** 2025-11-09
**Next Review:** When onboarding new developers

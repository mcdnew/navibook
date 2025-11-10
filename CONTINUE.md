# 🔄 /continue - Project Resume Protocol

**How to Use This File to Resume Development**

---

## 📖 When You Want to Continue Development

**Read this file first, then follow the steps below.**

This file simulates the `/continue` command by giving you a structured way to get back into the project quickly.

---

## ⚡ 5-MINUTE RESUME

### Step 1: Read Current State (2 min)

**Open and read:** `PROJECT_TRACKER.md`

**Look for:**
- ✅ What's complete
- ❌ What's not done yet
- 🎯 Current focus
- 📊 Progress percentage

**Write down:**
```
Current Phase: _________________
Progress: _____%
Next Priority: _________________
```

---

### Step 2: Check Last Session (1 min)

**Open:** `DEVELOPMENT_LOG.md`

**Read:** The last entry (top of the file)

**Answer these:**
- When was the last session? _______________
- What was built? _______________
- Any blockers? _______________

---

### Step 3: Check Next Tasks (1 min)

**Open:** `TODO.md`

**Look at:** "CURRENT SPRINT" section

**Pick one task:**
```
I will work on: _________________
Estimated time: _____ hours
```

---

### Step 4: Start Working (1 min)

```bash
# Start dev server
pnpm run dev

# Open browser
# http://localhost:3000

# Test login
# Email: admin@navibook.com
# Password: Admin123!
```

**✅ You're ready to code!**

---

## 📋 DETAILED RESUME (If You Have Time)

### Current Project Status

**Read from PROJECT_TRACKER.md:**

```
┌─────────────────────────────────────────┐
│         PROJECT STATUS                  │
├─────────────────────────────────────────┤
│ Phase: ____________                     │
│ Progress: _____%                        │
│ Last Updated: __________                │
├─────────────────────────────────────────┤
│ ✅ What's Working:                      │
│  - _____________________________        │
│  - _____________________________        │
│  - _____________________________        │
├─────────────────────────────────────────┤
│ ❌ What's Not Done:                     │
│  - _____________________________        │
│  - _____________________________        │
│  - _____________________________        │
├─────────────────────────────────────────┤
│ 🎯 Next Priority:                       │
│  _____________________________          │
│                                         │
│ Estimated Time: _____ hours             │
└─────────────────────────────────────────┘
```

---

### Last Development Session

**Read from DEVELOPMENT_LOG.md (last entry):**

```
Date: __________
Duration: _____ hours

What Was Built:
- _____________________________
- _____________________________
- _____________________________

Issues Encountered:
- _____________________________

Decisions Made:
- _____________________________

Next Steps:
- _____________________________
```

---

### Current Sprint Tasks

**Read from TODO.md:**

```
Sprint Goal: _____________________________

Tasks (check completed ones):
[ ] Task 1: _____________________________
[ ] Task 2: _____________________________
[ ] Task 3: _____________________________
[ ] Task 4: _____________________________
[ ] Task 5: _____________________________

Priority Order:
1. _____________________________
2. _____________________________
3. _____________________________
```

---

### Technical Context

**Read from ARCHITECTURE.md (if needed):**

```
Database Tables: 12
Current Pages: 10
API Routes: 2

Key Technologies:
- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- TypeScript
- Tailwind CSS

Recent Changes:
- _____________________________
- _____________________________
```

---

## 🎯 Decision: What to Build Next

### Option 1: Continue Current Sprint
**Best if:** Last session was recent (< 1 week ago)

**Action:**
1. Check TODO.md current sprint
2. Pick next uncompleted task
3. Start coding

**Estimated Time:** Based on task

---

### Option 2: Start New Feature
**Best if:** Current sprint is complete

**Action:**
1. Check TODO.md backlog
2. Move priority task to current sprint
3. Read ARCHITECTURE.md for context
4. Start coding

**Estimated Time:** 3-6 hours

---

### Option 3: Fix Bugs
**Best if:** Issues were noted in last session

**Action:**
1. Check TODO.md bugs section
2. Check DEVELOPMENT_LOG.md for context
3. Fix and test
4. Update docs

**Estimated Time:** 1-2 hours

---

### Option 4: Review & Refactor
**Best if:** Haven't reviewed code in a while

**Action:**
1. Read through recent code
2. Check for improvements
3. Update documentation
4. Refactor if needed

**Estimated Time:** 2-3 hours

---

## 📝 Before You Start Coding

### Environment Checklist
```bash
# ✅ Check these:
[ ] Dev server running (pnpm run dev)
[ ] Can access http://localhost:3000
[ ] Can login to app
[ ] Database connection works
[ ] No build errors in terminal
```

### Documentation Checklist
```bash
# ✅ Have these open:
[ ] PROJECT_TRACKER.md (for reference)
[ ] TODO.md (for tasks)
[ ] ARCHITECTURE.md (if building features)
[ ] Code editor
[ ] Browser with app
```

### Mental Checklist
```bash
# ✅ Know these:
[ ] What I'm building
[ ] Why it's important
[ ] Where it fits in the system
[ ] How long it should take
[ ] What success looks like
```

---

## 🔄 After You Finish Coding

### Update Documentation (10 min)

**1. Update TODO.md:**
```markdown
- [x] Completed task
```

**2. Update PROJECT_TRACKER.md:**
```markdown
## Last Session Summary
Date: [today]
Duration: X hours
What was built: ...
```

**3. Update DEVELOPMENT_LOG.md:**
```markdown
## YYYY-MM-DD - Session X: [Name] (X hours)
### Completed Tasks
- Task 1
- Task 2
```

**4. Commit Changes (if using git):**
```bash
git add .
git commit -m "feat: description of what was built"
```

---

## 🎓 Learning from This Session

### What to Note

**What Went Well:**
- _____________________________
- _____________________________

**What Was Difficult:**
- _____________________________
- _____________________________

**What I Learned:**
- _____________________________
- _____________________________

**Next Time I Should:**
- _____________________________
- _____________________________

---

## 🚀 Quick Commands Reference

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run type-check       # Check TypeScript

# Database
node scripts/migrate.js           # Run migrations
node scripts/seed-data.js         # Seed test data
node scripts/enable-realtime.js   # Enable realtime

# Testing
pnpm run lint             # Run linter
# (tests to be added)
```

---

## 📞 Need Help?

### Common Issues
1. **Can't remember what to do** → Read PROJECT_TRACKER.md
2. **Don't understand code** → Read ARCHITECTURE.md
3. **Lost in the codebase** → Read DEVELOPMENT_LOG.md
4. **Need to plan work** → Read TODO.md
5. **Stuck on setup** → Read RESUME_GUIDE.md

### Quick Links
- **Current Status:** `PROJECT_TRACKER.md`
- **What's Next:** `TODO.md`
- **How It Works:** `ARCHITECTURE.md`
- **How to Start:** `RESUME_GUIDE.md`
- **All Docs:** `DOCS_INDEX.md`

---

## ✅ Ready to Code Checklist

Before you start, ensure:

- [x] I've read PROJECT_TRACKER.md
- [x] I know what was done last
- [x] I know what to build next
- [x] Dev server is running
- [x] I can access the app
- [x] I have docs open
- [x] I know my time budget
- [x] I'm ready to code!

**If all checked → START CODING! 🚀**

---

## 💡 Pro Tip: Use This as a Template

Every time you resume work:

1. **Make a copy of this file**
2. **Fill in the blanks**
3. **Use it as your session plan**
4. **Keep it open while coding**

This gives you:
- ✅ Clear objectives
- ✅ Context awareness
- ✅ Progress tracking
- ✅ Structured approach

---

**Last Updated:** 2025-11-09
**Use This:** Every time you resume development
**Time to Complete:** 5-15 minutes
**Value:** Priceless (saves hours of confusion!)

# ⏰ Cron Jobs Setup Guide

## Overview

The application uses cron jobs to automatically clean up expired booking holds. This system is **optional** and controlled via environment variables.

---

## Current Setup (Default)

**Status:** ✅ Manual Cleanup (Free)

- Cron jobs are **disabled** by default
- Manual cleanup button available for admins/office staff
- No Vercel Pro subscription required
- Perfect for development and demos

---

## How It Works

### Expired Holds Cleanup

**Purpose:** Cancel bookings that have exceeded their hold period

**What it does:**
```sql
-- Finds bookings with status 'pending_hold' where hold_until < NOW()
-- Changes status to 'cancelled'
-- Frees up the time slot for other bookings
```

**Manual Method (Current):**
1. Admin/Office Staff sees "Clean Up Expired Holds" button in Dashboard
2. Click button to run cleanup on-demand
3. Toast notification shows how many holds were cleaned up

**Automatic Method (Requires Vercel Pro):**
- Runs every 5 minutes automatically
- No manual intervention needed
- Better user experience

---

## Enabling Automatic Cron Jobs (Production)

### Prerequisites
- ✅ Vercel Pro account ($20/month)
- ✅ Application deployed to Vercel

### Step 1: Update vercel.json

```json
{
  "_comment": "Cron jobs enabled for production",
  "crons": [
    {
      "path": "/api/cron/cleanup-holds",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule Options:**
- `*/5 * * * *` - Every 5 minutes (recommended)
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

### Step 2: Add Environment Variable

In Vercel Dashboard → Settings → Environment Variables:

```bash
ENABLE_CRON_JOBS=true
```

**Apply to:**
- ✅ Production
- ✅ Preview (optional)
- ⬜ Development (keep manual for local)

### Step 3: Optional - Add Cron Secret (Security)

Generate a random secret:
```bash
openssl rand -hex 32
```

Add to Vercel:
```bash
CRON_SECRET=your-generated-secret-here
```

Update vercel.json:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-holds",
      "schedule": "*/5 * * * *",
      "headers": {
        "Authorization": "Bearer your-generated-secret-here"
      }
    }
  ]
}
```

### Step 4: Deploy

```bash
git add vercel.json
git commit -m "feat: Enable automatic cron jobs for production"
git push
```

Vercel will auto-deploy with cron jobs enabled.

---

## Verification

### Check Cron is Running

1. **Vercel Dashboard:**
   - Project → Deployments → [Latest]
   - Scroll to "Cron Jobs"
   - Should show last execution time

2. **Test Manually:**
   ```bash
   curl https://your-app.vercel.app/api/cron/cleanup-holds
   # Should return: {"success":true,"message":"Cleaned up X expired hold(s)","count":X}
   ```

3. **Check Logs:**
   - Vercel Dashboard → Logs
   - Filter by `/api/cron/cleanup-holds`
   - See execution history

---

## Current Configuration

### Files Modified

**vercel.json:**
```json
{
  "_comment": "Cron jobs disabled by default",
  "crons": []
}
```

**Environment Variables:**
- ⬜ `ENABLE_CRON_JOBS` - Not set (defaults to false)
- ⬜ `CRON_SECRET` - Not set (no auth required for manual cleanup)

**Manual Cleanup Button:**
- Location: Dashboard (top right)
- Visible to: Admin, Office Staff
- Component: `components/manual-cleanup-button.tsx`

---

## Comparison: Manual vs Automatic

| Feature | Manual Cleanup | Automatic Cron |
|---------|---------------|----------------|
| **Cost** | Free | $20/month (Vercel Pro) |
| **Frequency** | On-demand | Every 5 minutes |
| **User Action** | Click button | None |
| **Ideal For** | Demos, Low traffic | Production, High traffic |
| **Cleanup Speed** | Immediate when clicked | Automatic background |
| **Vercel Plan** | Hobby (Free) | Pro ($20/month) |

---

## Recommended Approach

### Development/Demo (Current):
✅ Use Manual Cleanup Button
- Free
- Good enough for testing
- Admins have full control

### Production (When Ready):
✅ Enable Automatic Cron
- Professional experience
- No manual intervention
- Holds expire automatically every 5 min
- Upgrade to Vercel Pro

---

## Troubleshooting

### Manual Cleanup Not Working

**Check:**
1. User is admin or office_staff role
2. Button appears in dashboard
3. Check browser console for errors
4. Verify `/api/cron/cleanup-holds` is accessible

**Test API directly:**
```bash
curl -X POST http://localhost:3000/api/cron/cleanup-holds
```

### Cron Jobs Not Running (Production)

**Check:**
1. Vercel Pro subscription active
2. `ENABLE_CRON_JOBS=true` in environment
3. `vercel.json` has crons array populated
4. Deployment succeeded
5. Check Vercel → Cron Jobs section

**Common Issues:**
- ❌ Hobby plan can't run frequent crons
- ❌ Cron secret mismatch
- ❌ Path incorrect in vercel.json
- ❌ Function timeout (increase if needed)

---

## Migration Path

### From Manual → Automatic

1. **Verify everything works with manual cleanup**
2. **Upgrade Vercel to Pro plan**
3. **Update vercel.json** (add cron schedule)
4. **Add environment variable** (`ENABLE_CRON_JOBS=true`)
5. **Deploy to production**
6. **Verify cron runs** (check Vercel dashboard)
7. **Keep manual button** (as backup/emergency cleanup)

### From Automatic → Manual

1. **Update vercel.json** (set `crons: []`)
2. **Deploy**
3. **Downgrade Vercel to Hobby** (optional)

---

## Cost Analysis

### Option 1: Manual Cleanup (Current)
**Monthly Cost:** $0
- Vercel Hobby: Free
- Supabase Free Tier: Free
- **Total: $0/month**

### Option 2: Automatic Cleanup
**Monthly Cost:** $20-25
- Vercel Pro: $20/month
- Supabase Free Tier: Free
- **Total: $20/month**

### Break-Even Analysis
**When to upgrade:**
- More than 10 bookings per day
- Multiple agents using system
- Need professional reliability
- Can't rely on manual cleanup

---

## Environment Variables Reference

```bash
# .env.local (Development)
ENABLE_CRON_JOBS=false  # Manual cleanup

# .env.production (Vercel)
ENABLE_CRON_JOBS=true   # Automatic cleanup
CRON_SECRET=xyz123      # Optional security
```

---

**Status:** Manual Cleanup Active (Default)
**Cost:** $0/month
**Upgrade Path:** Ready when needed

---

## Quick Commands

```bash
# Test cleanup locally
curl -X POST http://localhost:3000/api/cron/cleanup-holds

# Test cleanup in production
curl -X POST https://your-app.vercel.app/api/cron/cleanup-holds

# Check how many holds would be cleaned
# (View in Supabase SQL Editor)
SELECT COUNT(*) FROM bookings
WHERE status = 'pending_hold'
AND hold_until < NOW();
```

---

**Ready to use! Manual cleanup is available in the dashboard now.**

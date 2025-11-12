# 🚀 Vercel Deployment Guide - Day Charter Application

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Deployment](#initial-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Auto-Deployment Workflow](#auto-deployment-workflow)
7. [Production Data Management](#production-data-management)
8. [Domain Configuration](#domain-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account (repository owner/collaborator)
- ✅ Vercel account (free tier works)
- ✅ Supabase account (for database)

### Local Requirements
- ✅ Git configured and authenticated
- ✅ Project committed and pushed to GitHub
- ✅ Node.js 18+ installed locally
- ✅ pnpm installed globally

---

## Initial Deployment

### Step 1: Connect to Vercel

1. **Visit Vercel Dashboard**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub organization/account
   - Find `navibook/day-charter` repository
   - Click "Import"

3. **Configure Project Settings**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: next build
   Output Directory: .next
   Install Command: pnpm install
   ```

4. **Environment Variables** (Add these now)
   - Click "Environment Variables"
   - See [Environment Variables](#environment-variables) section below
   - Add ALL required variables before deploying

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for build to complete
   - You'll get a URL like: `https://day-charter-xyz123.vercel.app`

---

## Environment Variables

### Required Variables

Copy these from your local `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# Optional: Database Direct Connection (for scripts)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
SUPABASE_DB_PASSWORD=your-database-password

# Production Mode
NODE_ENV=production
```

### How to Add in Vercel

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Environment Variables"
   - Add each variable:
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
     - Value: `https://...`
     - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Repeat for all variables

2. **Important Notes:**
   - ⚠️ Variables starting with `NEXT_PUBLIC_` are exposed to browser
   - 🔒 `SUPABASE_SERVICE_ROLE_KEY` is server-side only (secure)
   - 💾 Changes require redeployment to take effect

---

## Database Setup

### Option A: Use Existing Supabase Project (Recommended)

Your local Supabase project can be used for production:

1. **Keep Same Database**
   - Use the same `NEXT_PUBLIC_SUPABASE_URL`
   - Use the same API keys
   - Production data will be in same database

2. **Separate Production Data**
   - Create separate company for production
   - Or use Row Level Security to isolate data

### Option B: Create New Supabase Project

For complete isolation:

1. **Create New Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `day-charter-production`
   - Region: Choose closest to users
   - Password: Generate strong password
   - Click "Create Project"

2. **Copy Credentials**
   - Settings → API
   - Copy `URL` and `anon` key
   - Copy `service_role` key
   - Settings → Database → Connection String
   - Copy database password

3. **Apply Database Migrations**

   Run in Supabase SQL Editor:
   ```sql
   -- Copy entire contents from:
   -- supabase/migrations/001_initial_schema.sql
   -- supabase/migrations/002_rls_policies.sql
   -- supabase/migrations/003_functions.sql
   -- supabase/migrations/004_add_hourly_rate.sql
   -- supabase/migrations/009_fix_blocked_slots_rls.sql

   -- Or use APPLY_THIS_SQL.sql for captain support
   ```

4. **Create Admin User**

   Via Supabase Dashboard → Authentication → Users:
   - Click "Add User"
   - Email: `admin@yourcompany.com`
   - Password: Strong password
   - Email Confirm: ✅ Auto Confirm

   Then in SQL Editor:
   ```sql
   -- Create company
   INSERT INTO companies (name, phone, email, address)
   VALUES ('Your Company Name', '+1234567890', 'info@company.com', 'Address')
   RETURNING id;

   -- Update admin user (use company ID from above)
   UPDATE users
   SET company_id = 'company-uuid-here',
       role = 'admin',
       first_name = 'Admin',
       last_name = 'User'
   WHERE email = 'admin@yourcompany.com';
   ```

---

## Post-Deployment Setup

### What Happens After First Deploy

1. **Vercel Builds Your App**
   ```
   Installing dependencies (pnpm install)
   → Downloading packages
   → 100+ packages installed

   Building application (next build)
   → Compiling TypeScript
   → Optimizing pages
   → Generating static pages
   → Building routes

   ✓ Build completed successfully
   ```

2. **Deployment URL Generated**
   ```
   Production: https://day-charter.vercel.app
   Preview: https://day-charter-git-main-yourname.vercel.app
   ```

3. **First Visit**
   - Go to your deployment URL
   - Should see login page
   - Login with admin credentials
   - **You'll have EMPTY data** (unless using same DB with existing data)

### Initialize Production Data

#### Option 1: Manual Entry
- Login as admin
- Add boats via Fleet Management
- Add agents via Agents page
- Create bookings manually

#### Option 2: Run Seed Script (Demo Data)

⚠️ **Only for staging/demo environments!**

```bash
# Clone repo on your machine
git clone https://github.com/yourorg/day-charter
cd day-charter

# Install dependencies
pnpm install

# Create .env.local with PRODUCTION credentials
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
DATABASE_URL=postgresql://...
SUPABASE_DB_PASSWORD=your-db-password
EOF

# Run cleanup and seed
node scripts/nuclear-clean-and-seed.js
```

**This creates:**
- 6 demo boats
- 8 demo users (agents + captains)
- 450 demo bookings (6 months)
- Demo credentials (Demo2025!)

---

## Auto-Deployment Workflow

### How It Works

```
┌─────────────────────────────────────────────────────┐
│ 1. You Make Changes Locally                        │
│    - Edit code                                      │
│    - Test locally (pnpm dev)                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 2. Commit & Push to GitHub                         │
│    git add .                                        │
│    git commit -m "feat: new feature"                │
│    git push origin main                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 3. GitHub Webhook Triggers Vercel                  │
│    - Automatic (configured in Vercel)              │
│    - Triggers within seconds                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 4. Vercel Starts Build                             │
│    - Clones latest code from GitHub                │
│    - Runs: pnpm install                             │
│    - Runs: next build                               │
│    - Optimizes assets                               │
│    - Duration: ~2-5 minutes                         │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 5. Deploy to Production                            │
│    - Zero-downtime deployment                       │
│    - New version goes live automatically            │
│    - Old version kept as rollback                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 6. Production Updated                               │
│    - Live at: https://your-domain.com              │
│    - Takes effect immediately                       │
│    - Users see new version on next page load       │
└─────────────────────────────────────────────────────┘
```

### Timeline

```
Time    Event
─────   ──────────────────────────────────────
0:00    Push to GitHub
0:05    Vercel receives webhook
0:10    Build starts
2:00    Dependencies installed
3:30    Next.js build completes
4:00    Deployment starts
4:30    New version LIVE ✅
```

### Branch-Based Deployments

**Main Branch (Production):**
- URL: `https://day-charter.vercel.app`
- Automatic on every push to `main`
- Zero downtime
- Instant rollback available

**Other Branches (Preview):**
- URL: `https://day-charter-git-feature-branch.vercel.app`
- Automatic for every branch
- Perfect for testing
- Separate URL per branch

**Pull Requests:**
- URL: `https://day-charter-pr-123.vercel.app`
- Automatic for every PR
- Comment on PR with preview URL
- Test before merging

---

## Production Data Management

### Database Migrations in Production

When you add new database features:

1. **Test Locally First**
   ```bash
   # Apply migration locally
   # Test thoroughly
   # Commit migration files
   ```

2. **Apply to Production Database**

   **Option A: Supabase SQL Editor** (Safest)
   - Open Supabase Dashboard → SQL Editor
   - Copy SQL from migration file
   - Review carefully
   - Execute
   - Verify success

   **Option B: Via Script** (Automated)
   ```bash
   # Update .env.local with production credentials
   # Run migration script
   node scripts/apply-migrations-direct.js
   ```

3. **Deploy Code**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

### Backup Strategy

**Automatic (Supabase Free Tier):**
- Daily backups (7 days retention)
- Point-in-time recovery (7 days)

**Manual Backup:**
```bash
# Via Supabase Dashboard
Settings → Database → Backups → Download

# Or via pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Before Major Changes:**
1. Create manual backup
2. Test in staging first
3. Apply to production
4. Monitor for errors

---

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Click "Add"
   - Enter: `yourapp.com`
   - Click "Add"

2. **Configure DNS**

   **If using Vercel nameservers:**
   - Change nameservers at your registrar to Vercel's
   - Vercel handles everything automatically

   **If using external DNS:**

   For root domain (`yourapp.com`):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   For www (`www.yourapp.com`):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Usually takes 1-2 minutes
   - Includes www and root domain

4. **Redirect www → root (Optional)**
   ```javascript
   // vercel.json
   {
     "redirects": [
       {
         "source": "/:path*",
         "has": [
           {
             "type": "host",
             "value": "www.yourapp.com"
           }
        ],
         "destination": "https://yourapp.com/:path*",
         "permanent": true
       }
     ]
   }
   ```

---

## Monitoring & Analytics

### Built-in Vercel Analytics

1. **Enable Analytics**
   - Project Settings → Analytics
   - Enable "Web Analytics"
   - Add to project (free tier: 100k events/month)

2. **Add to Code**
   ```javascript
   // app/layout.tsx (already included)
   import { Analytics } from '@vercel/analytics/react'

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

3. **View Metrics**
   - Real-time visitors
   - Page views
   - Top pages
   - Geographic distribution

### Application Logs

**View in Vercel:**
- Project → Deployments → [Latest] → Logs
- Real-time streaming
- Error tracking
- Function execution logs

**Important Logs:**
- Build logs (compilation errors)
- Runtime logs (application errors)
- Edge function logs (API routes)

---

## Environment-Specific Behavior

### Development
- Local: `localhost:3000`
- Hot reload enabled
- Development mode
- Full error details

### Preview (Staging)
- URL: `https://...-git-branch.vercel.app`
- Production build
- Preview database (optional)
- Perfect for testing

### Production
- URL: `https://your-domain.com`
- Optimized build
- Production database
- Error logging only

---

## Scaling & Performance

### Automatic Scaling
- **Concurrent Requests**: Unlimited (Vercel handles)
- **Cold Starts**: < 100ms
- **Global CDN**: Assets served from edge
- **Image Optimization**: Automatic

### Performance Optimizations

**Already Implemented:**
- Next.js App Router (server components)
- Static page generation where possible
- Image optimization via next/image
- Font optimization
- CSS minification

**Monitor Performance:**
- Vercel Analytics → Web Vitals
- Core Web Vitals scoring
- Page load times
- Time to Interactive

---

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Clear cache and rebuild
Vercel Dashboard → Deployments → [Failed Build] → Redeploy
Check "Clear cache" ✅
```

**Error: "Type errors"**
```bash
# Solution: Fix TypeScript errors locally first
pnpm type-check
# Fix all errors
# Commit and push
```

**Error: "Out of memory"**
```bash
# Solution: Optimize build
# Reduce bundle size
# Split large components
# Or upgrade Vercel plan
```

### Runtime Errors

**Error: "Database connection failed"**
- Check environment variables in Vercel
- Verify Supabase project is active
- Test connection locally with same credentials

**Error: "API routes timing out"**
- Check Supabase RLS policies
- Optimize database queries
- Add indexes to slow queries

**Error: "Authentication issues"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure cookies are enabled

### Database Issues

**Error: "Permission denied"**
- Review RLS policies in Supabase
- Check user roles and company_id
- Verify `service_role_key` for admin operations

**Error: "No data showing"**
- Check company_id in users table
- Verify RLS policies allow access
- Run seed script if demo environment

---

## Rollback Procedure

### Quick Rollback

1. **Via Vercel Dashboard:**
   - Project → Deployments
   - Find last working deployment
   - Click "..." menu → "Promote to Production"
   - Instant rollback (< 1 minute)

2. **Via Git:**
   ```bash
   # Revert last commit
   git revert HEAD
   git push origin main
   # Triggers new deployment with previous code
   ```

### Database Rollback

1. **Restore from Backup:**
   - Supabase Dashboard → Database → Backups
   - Select backup point
   - Click "Restore"
   - ⚠️ This will overwrite current data!

2. **Manual SQL Rollback:**
   ```sql
   -- Revert specific changes
   -- Use transaction for safety
   BEGIN;
   -- Your rollback SQL here
   COMMIT; -- or ROLLBACK if something wrong
   ```

---

## Security Checklist

### Before Going Live

- [ ] All environment variables set correctly
- [ ] `SERVICE_ROLE_KEY` is secret (not exposed)
- [ ] Database RLS policies enabled
- [ ] Strong admin password set
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS configured if using external API
- [ ] Rate limiting on API routes (optional)
- [ ] Error logging configured
- [ ] Backup strategy in place

### Regular Security

- [ ] Update dependencies monthly: `pnpm update`
- [ ] Review Supabase logs for suspicious activity
- [ ] Rotate API keys every 6 months
- [ ] Monitor Vercel usage for anomalies
- [ ] Review user permissions quarterly

---

## Cost Estimation

### Vercel (Free Tier)
- **100GB Bandwidth** per month
- **6,000 build minutes** per month
- Unlimited deployments
- Automatic SSL
- **Cost**: $0/month

### Vercel (Pro Tier - $20/month)
- **1TB Bandwidth**
- **24,000 build minutes**
- Team collaboration
- Advanced analytics
- Priority support

### Supabase (Free Tier)
- **500MB Database**
- **1GB File Storage**
- **2GB Data Transfer**
- 50,000 Monthly Active Users
- **Cost**: $0/month

### Supabase (Pro Tier - $25/month)
- **8GB Database**
- **100GB File Storage**
- **250GB Data Transfer**
- Daily backups
- Point-in-time recovery

### Estimated Total
- **Development/Staging**: $0/month (free tiers)
- **Small Production**: $0-45/month
- **Medium Production**: $45-100/month

---

## Quick Reference Commands

```bash
# Local Development
pnpm dev                    # Start dev server
pnpm build                  # Test production build
pnpm type-check             # Check TypeScript

# Database
pnpm clean-db               # Clean database
pnpm seed-demo              # Seed demo data
node scripts/nuclear-clean-and-seed.js  # Full reset

# Git & Deploy
git add .                   # Stage changes
git commit -m "message"     # Commit
git push origin main        # Deploy to production (auto)

# Vercel CLI (optional)
vercel                      # Deploy to preview
vercel --prod               # Deploy to production
vercel env pull             # Download env variables
vercel logs                 # View production logs
```

---

## Support Resources

### Official Documentation
- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs

### Community
- **Vercel Discord**: https://vercel.com/discord
- **Next.js Discussions**: https://github.com/vercel/next.js/discussions
- **Supabase Discord**: https://discord.supabase.com

### Internal Documentation
- `CONTROL_TOWER_REPORTS.md` - Reports guide
- `CAPTAIN_FEATURES_IMPLEMENTATION.md` - Captain features
- `DEMO_CREDENTIALS.md` - Demo login credentials
- `TESTING_SCENARIOS.md` - Testing guide

---

## Deployment Checklist

### First Deployment
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] All environment variables added
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Test deployment successful
- [ ] Login works
- [ ] Can create booking
- [ ] Reports page loads

### Each Deployment
- [ ] Tested locally (pnpm dev)
- [ ] No TypeScript errors (pnpm type-check)
- [ ] Committed to git
- [ ] Pushed to GitHub
- [ ] Vercel build succeeds
- [ ] Production site tested
- [ ] No console errors
- [ ] Database queries working

---

**Status**: Ready for Vercel Deployment
**Version**: 1.0.0
**Last Updated**: 2025-11-12

---

🎯 **Your application is production-ready!** Follow this guide step-by-step for a smooth deployment.

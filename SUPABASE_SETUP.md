# Supabase Setup Guide for NaviBook

This guide will walk you through setting up Supabase for the NaviBook day-charter system.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Sign in or create an account
4. Create a new organization (if you don't have one)
5. Click "New Project"
6. Fill in the details:
   - **Name**: `navibook-day-charter` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose **Europe (eu-central-1)** for Mediterranean operations
   - **Pricing Plan**: Start with Free tier for development

7. Click "Create new project" and wait 2-3 minutes for setup

## Step 2: Get Your API Keys

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll see two important keys:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role key**: Another long string (keep this secret!)

4. Copy these values - you'll need them shortly

## Step 3: Configure Environment Variables

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   WEBHOOK_SECRET=generate-a-random-secret-key
   OPEN_METEO_API_URL=https://marine-api.open-meteo.com/v1/marine
   ```

3. **IMPORTANT**: Never commit `.env.local` to git!

## Step 4: Run Database Migrations

You have two options to run the migrations:

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message
8. Repeat steps 3-7 for:
   - `002_rls_policies.sql`
   - `003_functions.sql`

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Project ref is in your project URL: `https://[project-ref].supabase.co`)

4. Push migrations:
   ```bash
   supabase db push
   ```

## Step 5: Enable Realtime

For real-time booking updates:

1. Go to **Database** → **Replication** in Supabase Dashboard
2. Find the `bookings` table
3. Enable **Realtime** by toggling the switch
4. Also enable Realtime for:
   - `boats`
   - `boat_blocks`
   - `weather_forecasts`

## Step 6: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize if needed (optional for now)
4. For production, configure **SMTP settings** in **Authentication** → **Settings**

## Step 7: Set Up Storage (Optional)

For boat images:

1. Go to **Storage** in the sidebar
2. Click **Create a new bucket**
3. Name it `boat-images`
4. Set as **Public bucket**
5. Click **Create bucket**

## Step 8: Test the Connection

Run this command in your project:

```bash
pnpm run dev
```

The app should start without errors. If you see database connection errors, double-check your `.env.local` file.

## Step 9: Create First Admin User (Via SQL)

Run this in the SQL Editor to create your first admin user:

```sql
-- First, create an auth user (replace with your email and password)
-- You can do this via the Supabase Dashboard: Authentication → Users → Add User

-- Then, after creating the auth user, get their ID from the Users table
-- and insert them into the users table:

INSERT INTO users (
  id,
  company_id,
  role,
  first_name,
  last_name,
  email,
  is_active
)
SELECT
  auth.uid(), -- This will be replaced with the actual user ID
  (SELECT id FROM companies LIMIT 1), -- Uses the default company
  'admin',
  'Admin',
  'User',
  'admin@navibook.com',
  true;
```

**Better Method**: Create user via Dashboard first:

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. Copy the User ID (UUID)
6. Go to **SQL Editor** and run:

```sql
INSERT INTO users (
  id,
  company_id,
  role,
  first_name,
  last_name,
  email
) VALUES (
  'paste-user-id-here',
  (SELECT id FROM companies LIMIT 1),
  'admin',
  'Your First Name',
  'Your Last Name',
  'your-email@example.com'
);
```

## Step 10: Seed Test Data (Optional)

Create some test boats and pricing:

```sql
-- Insert test boats
INSERT INTO boats (company_id, name, boat_type, capacity, is_active)
SELECT
  (SELECT id FROM companies LIMIT 1),
  boat_name,
  type,
  cap,
  true
FROM (VALUES
  ('Sunset Dreams', 'sailboat'::boat_type, 8),
  ('Ocean Rider', 'motorboat'::boat_type, 10),
  ('Wave Runner 1', 'jetski'::boat_type, 2),
  ('Mediterranean Star', 'sailboat'::boat_type, 12),
  ('Speed King', 'motorboat'::boat_type, 6)
) AS boats(boat_name, type, cap);

-- Insert pricing for each boat
INSERT INTO pricing (boat_id, duration, package_type, price)
SELECT
  b.id,
  d.duration,
  'charter_only'::package_type,
  CASE
    WHEN d.duration = '2h' THEN 150
    WHEN d.duration = '3h' THEN 200
    WHEN d.duration = '4h' THEN 250
    WHEN d.duration = '8h' THEN 450
  END
FROM boats b
CROSS JOIN (VALUES
  ('2h'::duration_type),
  ('3h'::duration_type),
  ('4h'::duration_type),
  ('8h'::duration_type)
) AS d(duration);
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure all migrations ran successfully
- Check SQL Editor for any error messages
- Verify you ran migrations in order (001, 002, 003)

### Error: "permission denied for table"
- RLS policies might not be set up correctly
- Verify `002_rls_policies.sql` ran successfully
- Check that you're logged in as a user in the `users` table

### Can't login
- Make sure you created a user in Authentication AND in the users table
- Verify the user IDs match
- Check that the user's company_id exists in the companies table

### Realtime not working
- Verify Realtime is enabled for the tables
- Check browser console for WebSocket errors
- Ensure your connection is stable

## Next Steps

Once Supabase is set up:

1. ✅ Test the Next.js app startup
2. ✅ Create your first admin user
3. ✅ Seed test data
4. 🚀 Start building the UI!

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

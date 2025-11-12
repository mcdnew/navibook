# Supabase Database Management Guide

## Quick Reference for Database Operations

### Database Connection Details

**Location:** `.env.local`
```
DATABASE_URL=postgresql://postgres.bsrmjbqmlzamluhfmwus:6H4nnbGHHFJbrdQG@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

---

## Running SQL Migrations

### Method 1: Using Node.js Script (PREFERRED)

**Steps:**

1. **Create your SQL migration file** in `supabase/migrations/` directory:
   ```
   supabase/migrations/XXX_descriptive_name.sql
   ```

2. **Create a temporary migration runner** (or use existing `run-migration.js`):
   ```javascript
   #!/usr/bin/env node
   const { readFileSync } = require('fs');
   const { join } = require('path');
   require('dotenv').config({ path: '.env.local' });
   const { Client } = require('pg');

   async function runMigration() {
     const client = new Client({
       connectionString: process.env.DATABASE_URL,
     });

     try {
       await client.connect();
       const migrationSQL = readFileSync(
         join(__dirname, 'your-migration-file.sql'),
         'utf8'
       );
       await client.query(migrationSQL);
       console.log('✅ Migration applied successfully!');
     } catch (error) {
       console.error('❌ Error:', error.message);
       process.exit(1);
     } finally {
       await client.end();
     }
   }

   runMigration();
   ```

3. **Run the migration:**
   ```bash
   node run-migration.js
   ```

**Advantages:**
- ✅ Works without installing PostgreSQL client
- ✅ Uses existing `pg` package from node_modules
- ✅ Simple and fast
- ✅ Can be version controlled

---

### Method 2: Using psql CLI (If PostgreSQL client is installed)

```bash
PGPASSWORD="6H4nnbGHHFJbrdQG" psql \
  "postgresql://postgres.bsrmjbqmlzamluhfmwus:6H4nnbGHHFJbrdQG@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" \
  -f your-migration-file.sql
```

---

### Method 3: Via Supabase Dashboard (Manual)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in sidebar
4. Click "+ New query"
5. Paste SQL and click "Run"

**Use this when:**
- Need to quickly test queries
- Debugging database issues
- One-off data operations

---

## Common Database Operations

### Checking Row Level Security (RLS) Policies

```sql
-- List all policies for a table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'your_table_name';
```

### Creating/Updating RLS Policies

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Create new policy
CREATE POLICY "policy_name"
  ON table_name FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'power_agent')
    )
  );
```

### Checking User Roles

```sql
-- List all available roles in user_role enum
SELECT unnest(enum_range(NULL::user_role)) AS role;

-- Check current user's role
SELECT role FROM users WHERE id = auth.uid();
```

### Adding New Enum Values

```sql
-- Add new role to user_role enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'new_role_name'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'new_role_name';
  END IF;
END $$;
```

---

## Migration Naming Convention

Format: `XXX_descriptive_name.sql`

Examples:
- `001_initial_schema.sql`
- `002_rls_policies.sql`
- `009_fix_blocked_slots_rls.sql`

**Always:**
- Use sequential numbers
- Use descriptive names
- Include comments in the SQL file
- Test migrations on a copy first if modifying data

---

## Troubleshooting Common Issues

### Issue: "new row violates row-level security policy"

**Cause:** User's role doesn't match what RLS policy expects

**Solution:**
1. Check user's actual role in database
2. Check RLS policy conditions
3. Update policy to match actual roles used in app

**Example Fix:**
```sql
-- Check what roles exist in your app
SELECT DISTINCT role FROM users;

-- Update policy to match
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name"
  ON table_name FOR INSERT
  WITH CHECK (
    -- Use the ACTUAL roles from your app
    role IN ('admin', 'manager', 'power_agent')
  );
```

### Issue: "relation does not exist"

**Cause:** Table hasn't been created yet

**Solution:** Run migrations in order (001, 002, 003...)

### Issue: "permission denied for table"

**Cause:** RLS is enabled but no policies exist

**Solution:** Add appropriate RLS policies for SELECT, INSERT, UPDATE, DELETE

---

## Important Notes

1. **Always backup before major migrations:**
   - Use Supabase dashboard to create backup
   - Or export data first

2. **Test in development first:**
   - If possible, test on a dev/staging instance
   - Or test queries with `SELECT` before `INSERT/UPDATE/DELETE`

3. **RLS Policy Patterns:**
   - **Same company check:**
     ```sql
     company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
     ```
   - **Role-based check:**
     ```sql
     role IN ('admin', 'manager', 'power_agent')
     ```
   - **Own records only:**
     ```sql
     user_id = auth.uid()
     ```

4. **Authentication Context:**
   - `auth.uid()` returns the current authenticated user's ID
   - This is available in RLS policies
   - Returns NULL if not authenticated

---

## Useful SQL Queries for Debugging

```sql
-- Check current user
SELECT current_user;

-- Check current database
SELECT current_database();

-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check table structure
\d table_name

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- View all indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public';
```

---

## Emergency Database Access

If you ever need to bypass RLS for debugging:

```sql
-- Disable RLS on a table (DANGEROUS - only for debugging)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable when done
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING:** Never disable RLS in production without understanding the security implications!

---

## Project-Specific Notes

### Current Role Structure

The app uses these roles (from `001_initial_schema.sql`):
- `admin` - Full access
- `office_staff` - Office operations
- `manager` - Management access
- `accountant` - Financial access
- `power_agent` - Advanced agent features
- `regular_agent` - Basic agent features
- `captain` - Boat captain

**Note:** Earlier migrations incorrectly used `company_admin` which doesn't exist in the enum!

### Common Pattern: Admin/Manager Check

Most admin operations should use:
```sql
role IN ('admin', 'manager', 'power_agent')
```

NOT:
```sql
role IN ('company_admin', 'power_agent')  -- ❌ WRONG
```

---

## Quick Commands Cheat Sheet

```bash
# Run migration
node run-migration.js

# Connect to database (if psql installed)
PGPASSWORD="YOUR_PASSWORD" psql "YOUR_CONNECTION_STRING"

# Dump entire database schema
pg_dump -s -h HOST -U USER -d DATABASE > schema.sql

# Execute single SQL command
echo "SELECT version();" | psql "YOUR_CONNECTION_STRING"
```

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Node.js pg Library](https://node-postgres.com/)

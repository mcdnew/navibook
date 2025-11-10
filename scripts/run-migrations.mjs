import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function executeSql(sql) {
  // Extract project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

  // Use Supabase's database API endpoint
  const url = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return { success: true, data: text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', filename);
  const sql = readFileSync(migrationPath, 'utf8');

  // Split SQL into individual statements (simple approach)
  // This is needed because we're executing via REST API
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`   Found ${statements.length} SQL statements`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    if (stmt.replace(/\s/g, '').length <= 1) continue;

    const result = await executeSql(stmt);

    if (!result.success) {
      console.error(`   ❌ Statement ${i + 1} failed:`, result.error);
      console.error(`   Statement: ${stmt.substring(0, 100)}...`);
      return false;
    }
  }

  console.log(`✅ Migration ${filename} completed successfully`);
  return true;
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);

  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_functions.sql'
  ];

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error('\n❌ Migration process stopped due to error');
      console.error('\n💡 Tip: You can run migrations manually in Supabase SQL Editor');
      process.exit(1);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ All migrations completed successfully! 🎉');
  console.log('\n📋 Next steps:');
  console.log('   1. Check Supabase Dashboard → Table Editor');
  console.log('   2. Enable Realtime for bookings table');
  console.log('   3. Create your first admin user\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

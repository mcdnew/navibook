const { Client } = require('pg')
const { readFileSync } = require('fs')
const { join } = require('path')
require('dotenv').config({ path: join(__dirname, '..', '.env.local') })

async function applyMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('✓ Connected to database')

    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '007_customer_portal.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('Applying customer portal migration...')
    await client.query(migrationSQL)
    console.log('✓ Customer portal migration applied successfully!')

    console.log('\nCreated:')
    console.log('  - customer_portal_tokens table')
    console.log('  - customer_change_requests table')
    console.log('  - generate_portal_token() function')
    console.log('  - create_portal_token() function')
    console.log('  - verify_portal_token() function')
    console.log('  - RLS policies for customer portal')

  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigration()

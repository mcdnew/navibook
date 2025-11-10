require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('Reading migration file...')
  const migrationSQL = fs.readFileSync('supabase/migrations/008_blocked_slots.sql', 'utf8')

  console.log('Applying blocked_slots migration...')

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    })

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('Trying alternative method...')
      const { error: pgError } = await supabase.from('blocked_slots').select('id').limit(1)

      if (pgError && pgError.code === '42P01') {
        console.error('Table does not exist. Please run migration manually via Supabase dashboard.')
        console.log('\nSQL to run:')
        console.log(migrationSQL)
        process.exit(1)
      } else if (!pgError) {
        console.log('✓ Table already exists!')
      }
    } else {
      console.log('✓ Migration applied successfully!')
    }
  } catch (err) {
    console.error('Error:', err.message)
    console.log('\nPlease apply this migration manually via Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new')
    process.exit(1)
  }
}

applyMigration()

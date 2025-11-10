const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestBookings() {
  console.log('Creating test bookings...')

  try {
    // Get company, boats, and admin user
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single()

    const { data: boats } = await supabase
      .from('boats')
      .select('id, name')
      .limit(3)

    const { data: admin } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (!company || !boats || boats.length === 0 || !admin) {
      console.error('Missing required data (company, boats, or admin)')
      return
    }

    console.log(`Found company: ${company.id}`)
    console.log(`Found ${boats.length} boats`)
    console.log(`Found admin: ${admin.id}`)

    // Create test bookings with different statuses
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const testBookings = [
      // Pending hold (expires in 15 minutes)
      {
        company_id: company.id,
        boat_id: boats[0].id,
        agent_id: admin.id,
        booking_date: tomorrow.toISOString().split('T')[0],
        start_time: '09:00:00',
        end_time: '13:00:00',
        duration: '4h',
        customer_name: 'John Smith',
        customer_phone: '+30 6912345678',
        customer_email: 'john@example.com',
        passengers: 4,
        package_type: 'charter_drinks',
        total_price: 450.00,
        deposit_amount: 100.00,
        deposit_paid: false,
        status: 'pending_hold',
        hold_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        source: 'direct',
        notes: 'Birthday celebration',
      },
      // Confirmed booking
      {
        company_id: company.id,
        boat_id: boats[1] ? boats[1].id : boats[0].id,
        agent_id: admin.id,
        booking_date: nextWeek.toISOString().split('T')[0],
        start_time: '14:00:00',
        end_time: '18:00:00',
        duration: '4h',
        customer_name: 'Maria Garcia',
        customer_phone: '+30 6923456789',
        customer_email: 'maria@example.com',
        passengers: 6,
        package_type: 'charter_full',
        total_price: 650.00,
        deposit_amount: 200.00,
        deposit_paid: true,
        status: 'confirmed',
        source: 'website',
        notes: 'Sunset cruise requested',
      },
      // Completed booking
      {
        company_id: company.id,
        boat_id: boats[0].id,
        agent_id: admin.id,
        booking_date: yesterday.toISOString().split('T')[0],
        start_time: '10:00:00',
        end_time: '14:00:00',
        duration: '4h',
        customer_name: 'Thomas Anderson',
        customer_phone: '+30 6934567890',
        passengers: 2,
        package_type: 'charter_only',
        total_price: 300.00,
        deposit_amount: 0.00,
        deposit_paid: false,
        status: 'completed',
        completed_at: yesterday.toISOString(),
        source: 'direct',
      },
      // Another confirmed booking for today
      {
        company_id: company.id,
        boat_id: boats[2] ? boats[2].id : boats[0].id,
        agent_id: admin.id,
        booking_date: today.toISOString().split('T')[0],
        start_time: '11:00:00',
        end_time: '13:00:00',
        duration: '2h',
        customer_name: 'Sophie Laurent',
        customer_phone: '+30 6945678901',
        customer_email: 'sophie@example.com',
        passengers: 3,
        package_type: 'charter_drinks',
        total_price: 280.00,
        deposit_amount: 80.00,
        deposit_paid: true,
        status: 'confirmed',
        source: 'hotel',
        notes: 'Vegetarian menu preferred',
      },
    ]

    // Delete existing test bookings to avoid duplicates
    await supabase
      .from('bookings')
      .delete()
      .in('customer_name', testBookings.map(b => b.customer_name))

    console.log('\nCreating bookings...')
    for (const booking of testBookings) {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single()

      if (error) {
        console.error(`Error creating booking for ${booking.customer_name}:`, error.message)
      } else {
        console.log(`✓ Created ${booking.status} booking for ${booking.customer_name} (${booking.booking_date})`)
      }
    }

    console.log('\n✅ Test bookings created successfully!')
    console.log('\nYou can now test:')
    console.log('- Pending hold → Confirm booking')
    console.log('- Confirmed → Cancel or Complete')
    console.log('- List filters and search')
    console.log('- Booking details page')

  } catch (error) {
    console.error('Error:', error)
  }
}

createTestBookings()

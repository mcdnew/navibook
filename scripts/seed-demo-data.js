const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Seed data configuration
const SEED_CONFIG = {
  companyName: 'Sunset Charters Mallorca',
  preservedAdminEmail: 'admin@navibook.com',
  demoPassword: 'Demo2025!',
  dateRange: {
    monthsBack: 5,      // 5 months of history
    monthsForward: 1    // 1 month future reservations
  }
}

// Demo users data
const DEMO_USERS = [
  {
    email: 'maria@sunsetcharters.com',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    role: 'office_staff',
    phone: '+34 971 234 501',
    commission: 0
  },
  {
    email: 'carlos@sunsetcharters.com',
    firstName: 'Carlos',
    lastName: 'Navarro',
    role: 'power_agent',
    phone: '+34 971 234 502',
    commission: 15
  },
  {
    email: 'sofia@sunsetcharters.com',
    firstName: 'Sofia',
    lastName: 'Garcia',
    role: 'regular_agent',
    phone: '+34 971 234 503',
    commission: 10
  },
  {
    email: 'pablo@sunsetcharters.com',
    firstName: 'Pablo',
    lastName: 'Martinez',
    role: 'regular_agent',
    phone: '+34 971 234 504',
    commission: 10
  },
  {
    email: 'elena@sunsetcharters.com',
    firstName: 'Elena',
    lastName: 'Sanchez',
    role: 'regular_agent',
    phone: '+34 971 234 505',
    commission: 8
  },
  {
    email: 'juan@sunsetcharters.com',
    firstName: 'Juan',
    lastName: 'Molina',
    role: 'captain',
    phone: '+34 971 234 506',
    commission: 0,
    hourlyRate: 0
  },
  {
    email: 'marco@sunsetcharters.com',
    firstName: 'Marco',
    lastName: 'Vidal',
    role: 'captain',
    phone: '+34 971 234 507',
    commission: 0,
    hourlyRate: 35
  },
  {
    email: 'luis@sunsetcharters.com',
    firstName: 'Luis',
    lastName: 'Torres',
    role: 'captain',
    phone: '+34 971 234 508',
    commission: 0,
    hourlyRate: 25
  }
]

// Demo boats data
const DEMO_BOATS = [
  {
    name: 'Mediterranean Dream',
    type: 'sailboat',
    capacity: 10,
    license: 'ES-PM-2024-001',
    description: 'Luxury sailing yacht with full amenities, air conditioning, sun deck, and swimming platform.',
    captain: 'juan@sunsetcharters.com', // Pre-assigned
    captainRequired: true
  },
  {
    name: 'Sea Breeze',
    type: 'sailboat',
    capacity: 8,
    license: 'ES-PM-2024-002',
    description: 'Classic sailing experience with comfortable cockpit. Ideal for intimate groups.',
    captain: 'juan@sunsetcharters.com', // Pre-assigned (can also use Luis as backup)
    captainRequired: true
  },
  {
    name: 'Rapid Express',
    type: 'motorboat',
    capacity: 8,
    license: 'ES-PM-2024-003',
    description: 'High-speed touring boat. Perfect for island hopping and water sports.',
    captain: 'marco@sunsetcharters.com', // Pre-assigned (optional)
    captainRequired: false
  },
  {
    name: 'Island Hopper',
    type: 'motorboat',
    capacity: 12,
    license: 'ES-PM-2024-004',
    description: 'Premium motor yacht with sun deck, cabin, bathroom, and kitchenette.',
    captain: 'marco@sunsetcharters.com', // Pre-assigned
    captainRequired: true
  },
  {
    name: 'Splash One',
    type: 'jetski',
    capacity: 2,
    license: 'ES-PM-2024-005',
    description: 'High-performance jetski with electronic stability system.',
    captain: null,
    captainRequired: false
  },
  {
    name: 'Wave Rider',
    type: 'jetski',
    capacity: 2,
    license: 'ES-PM-2024-006',
    description: 'Stable touring jetski, great for beginners and families.',
    captain: null,
    captainRequired: false
  }
]

// Pricing matrix
const PRICING_MATRIX = {
  'Mediterranean Dream': {
    '2h': { charter_only: 250, charter_drinks: 300, charter_food: 325, charter_full: 375 },
    '3h': { charter_only: 350, charter_drinks: 420, charter_food: 455, charter_full: 525 },
    '4h': { charter_only: 450, charter_drinks: 540, charter_food: 585, charter_full: 675 },
    '8h': { charter_only: 800, charter_drinks: 960, charter_food: 1040, charter_full: 1200 }
  },
  'Sea Breeze': {
    '2h': { charter_only: 200, charter_drinks: 240, charter_food: 260, charter_full: 300 },
    '3h': { charter_only: 280, charter_drinks: 336, charter_food: 364, charter_full: 420 },
    '4h': { charter_only: 360, charter_drinks: 432, charter_food: 468, charter_full: 540 },
    '8h': { charter_only: 640, charter_drinks: 768, charter_food: 832, charter_full: 960 }
  },
  'Rapid Express': {
    '2h': { charter_only: 300, charter_drinks: 360, charter_food: 390, charter_full: 450 },
    '3h': { charter_only: 420, charter_drinks: 504, charter_food: 546, charter_full: 630 },
    '4h': { charter_only: 540, charter_drinks: 648, charter_food: 702, charter_full: 810 },
    '8h': { charter_only: 960, charter_drinks: 1152, charter_food: 1248, charter_full: 1440 }
  },
  'Island Hopper': {
    '2h': { charter_only: 400, charter_drinks: 480, charter_food: 520, charter_full: 600 },
    '3h': { charter_only: 560, charter_drinks: 672, charter_food: 728, charter_full: 840 },
    '4h': { charter_only: 720, charter_drinks: 864, charter_food: 936, charter_full: 1080 },
    '8h': { charter_only: 1280, charter_drinks: 1536, charter_food: 1664, charter_full: 1920 }
  },
  'Splash One': {
    '2h': { charter_only: 120, charter_drinks: 144, charter_food: 0, charter_full: 180 },
    '3h': { charter_only: 168, charter_drinks: 202, charter_food: 0, charter_full: 252 },
    '4h': { charter_only: 216, charter_drinks: 259, charter_food: 0, charter_full: 324 },
    '8h': { charter_only: 0, charter_drinks: 0, charter_food: 0, charter_full: 0 }
  },
  'Wave Rider': {
    '2h': { charter_only: 100, charter_drinks: 120, charter_food: 0, charter_full: 150 },
    '3h': { charter_only: 140, charter_drinks: 168, charter_food: 0, charter_full: 210 },
    '4h': { charter_only: 180, charter_drinks: 216, charter_food: 0, charter_full: 270 },
    '8h': { charter_only: 0, charter_drinks: 0, charter_food: 0, charter_full: 0 }
  }
}

// Helper functions
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addHours(timeString, hours) {
  const [h, m] = timeString.split(':').map(Number)
  const newHours = (h + hours) % 24
  return `${String(newHours).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function getDurationHours(duration) {
  return parseInt(duration.replace('h', ''))
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

// Customer name generator
const FIRST_NAMES = ['Michael', 'Emma', 'David', 'Sarah', 'James', 'Lisa', 'Robert', 'Anna', 'John', 'Maria',
                     'Thomas', 'Laura', 'William', 'Sophie', 'Daniel', 'Emily', 'Christopher', 'Julia']
const LAST_NAMES = ['Johnson', 'Schmidt', 'Williams', 'Garcia', 'Brown', 'Martinez', 'Davis', 'Anderson',
                    'Taylor', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall']

function generateCustomerName() {
  return `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`
}

function generatePhone() {
  const prefixes = ['+44 7700', '+34 6', '+49 175', '+1 555']
  const prefix = randomElement(prefixes)
  const number = Math.floor(100000 + Math.random() * 900000)
  return `${prefix} ${number}`
}

console.log('🎯 NaviBook Demo Data Seeder')
console.log('=============================\n')

async function seedDatabase() {
  const seedData = {
    timestamp: new Date().toISOString(),
    config: SEED_CONFIG,
    created: {
      company: null,
      users: [],
      boats: [],
      pricing: [],
      bookings: [],
      payments: [],
      waitlist: [],
      blockedSlots: []
    }
  }

  try {
    // Step 1: Find and preserve admin user
    console.log('1️⃣  Finding preserved admin...')
    const { data: preservedAdmin } = await supabase
      .from('users')
      .select('id, email, company_id')
      .eq('email', SEED_CONFIG.preservedAdminEmail)
      .single()

    if (!preservedAdmin) {
      throw new Error(`❌ Admin user ${SEED_CONFIG.preservedAdminEmail} not found!`)
    }
    console.log(`✅ Found admin: ${preservedAdmin.email}`)

    const preservedCompanyId = preservedAdmin.company_id

    // Step 2: Clear existing data (except preserved admin)
    console.log('\n2️⃣  Clearing existing data...')

    // Delete in correct order due to foreign keys
    await supabase.from('payment_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared payment_transactions')

    await supabase.from('booking_history').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared booking_history')

    await supabase.from('customer_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared customer_notes')

    await supabase.from('waitlist').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared waitlist')

    await supabase.from('blocked_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared blocked_slots')

    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared bookings')

    await supabase.from('pricing').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared pricing')

    await supabase.from('boats').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✓ Cleared boats')

    // Delete users except preserved admin (also deletes from auth.users via CASCADE)
    await supabase.from('users').delete().neq('id', preservedAdmin.id)
    console.log('   ✓ Cleared users (except admin)')

    // Step 3: Update company name
    console.log('\n3️⃣  Updating company...')
    const { data: company } = await supabase
      .from('companies')
      .update({
        name: SEED_CONFIG.companyName,
        address: 'Port de Palma, Muelle de Poniente 5, 07012 Palma de Mallorca, Spain',
        phone: '+34 971 123 456',
        email: 'info@sunsetcharters-mallorca.com',
        tax_id: 'ESB12345678'
      })
      .eq('id', preservedCompanyId)
      .select()
      .single()

    console.log(`✅ Updated company: ${company.name}`)
    seedData.created.company = company

    // Step 4: Create demo users
    console.log('\n4️⃣  Creating demo users...')
    const createdUsers = {}

    for (const userData of DEMO_USERS) {
      try {
        // Try to create auth user, or get existing one
        let authUser = null
        const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: SEED_CONFIG.demoPassword,
          email_confirm: true,
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        })

        if (authError && authError.message.includes('already been registered')) {
          // User exists in auth, get their ID
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
          const existingUser = users?.find(u => u.email === userData.email)
          if (existingUser) {
            authUser = { user: existingUser }
            console.log(`   ℹ️  Using existing auth user: ${userData.email}`)
          } else {
            throw new Error(`Could not find existing user ${userData.email}`)
          }
        } else if (authError) {
          throw authError
        } else {
          authUser = newAuthUser
        }

        // Create user record
        const userRecord = {
          id: authUser.user.id,
          company_id: company.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          phone: userData.phone,
          commission_percentage: userData.commission,
          is_active: true
        }

        // Add hourly_rate for captains
        if (userData.role === 'captain' && userData.hourlyRate !== undefined) {
          userRecord.hourly_rate = userData.hourlyRate
        }

        const { data: user, error: userError } = await supabase
          .from('users')
          .insert(userRecord)
          .select()
          .single()

        if (userError) throw userError

        createdUsers[userData.email] = user
        seedData.created.users.push(user)
        console.log(`   ✓ Created: ${userData.firstName} ${userData.lastName} (${userData.role})`)
      } catch (error) {
        console.error(`   ✗ Failed to create ${userData.email}:`, error.message)
      }
    }

    // Step 5: Create boats with captain assignments
    console.log('\n5️⃣  Creating boats...')
    const createdBoats = {}

    for (const boatData of DEMO_BOATS) {
      const captainId = boatData.captain ? createdUsers[boatData.captain]?.id : null

      const { data: boat, error } = await supabase
        .from('boats')
        .insert({
          company_id: company.id,
          name: boatData.name,
          boat_type: boatData.type,
          capacity: boatData.capacity,
          license_number: boatData.license,
          description: boatData.description,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      createdBoats[boatData.name] = { ...boat, defaultCaptainId: captainId, captainRequired: boatData.captainRequired }
      seedData.created.boats.push(boat)
      console.log(`   ✓ Created: ${boat.name} (${boat.boat_type})${captainId ? ` → Captain assigned` : ''}`)
    }

    // Step 6: Create pricing
    console.log('\n6️⃣  Creating pricing...')
    let pricingCount = 0

    for (const [boatName, prices] of Object.entries(PRICING_MATRIX)) {
      const boat = createdBoats[boatName]
      if (!boat) continue

      for (const [duration, packages] of Object.entries(prices)) {
        for (const [packageType, price] of Object.entries(packages)) {
          if (price === 0) continue // Skip unavailable combinations

          const { data: pricing, error } = await supabase
            .from('pricing')
            .insert({
              boat_id: boat.id,
              duration: duration,
              package_type: packageType,
              price: price
            })
            .select()
            .single()

          if (error) throw error

          seedData.created.pricing.push(pricing)
          pricingCount++
        }
      }
    }
    console.log(`✅ Created ${pricingCount} pricing entries`)

    // Step 7: Create bookings
    console.log('\n7️⃣  Creating bookings...')
    const today = new Date()
    const startDate = addDays(today, -60) // 2 months back
    const endDate = addDays(today, 60) // 2 months forward

    const agents = [
      { user: createdUsers['carlos@sunsetcharters.com'], weight: 30 },
      { user: createdUsers['sofia@sunsetcharters.com'], weight: 25 },
      { user: createdUsers['pablo@sunsetcharters.com'], weight: 22 },
      { user: createdUsers['elena@sunsetcharters.com'], weight: 15 },
      { user: createdUsers['maria@sunsetcharters.com'], weight: 8 }
    ]

    const boats = Object.values(createdBoats)
    const durations = ['2h', '3h', '4h', '8h']
    const durationWeights = [15, 25, 45, 15] // 4h most popular
    const packages = ['charter_only', 'charter_drinks', 'charter_food', 'charter_full']
    const packageWeights = [40, 35, 15, 10]
    const statuses = ['completed', 'confirmed', 'pending_hold', 'cancelled', 'no_show']
    const times = ['10:00', '10:00', '10:00', '14:00', '14:00', '14:00', '18:00', '18:00'] // Peak times have higher weight

    let bookingCount = 0
    const targetBookings = 450 // ~75 bookings per month for 6 months

    // Helper to pick weighted random
    function weightedRandom(items, weights) {
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      let random = Math.random() * totalWeight
      for (let i = 0; i < items.length; i++) {
        random -= weights[i]
        if (random <= 0) return items[i]
      }
      return items[0]
    }

    while (bookingCount < targetBookings) {
      // Random date in range (6 months total: 5 back + 1 forward)
      const dayOffset = Math.floor(Math.random() * 180) - 150 // -150 to +30 days
      const bookingDate = addDays(today, dayOffset)
      const dateStr = formatDate(bookingDate)

      // Select agent, boat, duration, package
      const agent = weightedRandom(agents, agents.map(a => a.weight)).user
      const boat = randomElement(boats)
      const duration = weightedRandom(durations, durationWeights)

      // Skip 8h for jetskis
      if (boat.boat_type === 'jetski' && duration === '8h') continue

      const packageType = weightedRandom(packages, packageWeights)

      // Skip food packages for jetskis
      if (boat.boat_type === 'jetski' && (packageType === 'charter_food')) continue

      const startTime = randomElement(times)
      const endTime = addHours(startTime, getDurationHours(duration))

      // Get price
      const price = PRICING_MATRIX[boat.name]?.[duration]?.[packageType]
      if (!price || price === 0) continue

      // Determine status based on date
      let status
      const isPast = bookingDate < today
      const isToday = formatDate(bookingDate) === formatDate(today)

      if (isPast) {
        // Past bookings: mostly completed, some no-shows, some cancelled
        const rand = Math.random()
        if (rand < 0.85) status = 'completed'
        else if (rand < 0.92) status = 'cancelled'
        else status = 'no_show'
      } else if (isToday) {
        // Today: confirmed or pending
        status = Math.random() < 0.8 ? 'confirmed' : 'pending_hold'
      } else {
        // Future: mostly confirmed, some pending
        status = Math.random() < 0.85 ? 'confirmed' : 'pending_hold'
      }

      // Determine deposit and payment
      let depositAmount = 0
      let depositPaid = false

      if (status === 'confirmed') {
        const rand = Math.random()
        if (rand < 0.15) depositAmount = price // Fully paid
        else if (rand < 0.60) depositAmount = Math.min(200, price * 0.3) // Deposit
        // else 0 (pay on arrival)

        depositPaid = depositAmount > 0
      } else if (status === 'cancelled' && Math.random() < 0.6) {
        depositAmount = Math.min(100, price * 0.2)
        depositPaid = true
      } else if (status === 'no_show' && Math.random() < 0.6) {
        depositAmount = Math.min(100, price * 0.2)
        depositPaid = true
      } else if (status === 'completed') {
        depositPaid = Math.random() < 0.9 // Most completed are paid
      }

      // Assign captain if needed
      let captainId = null
      let captainFee = 0
      if (boat.captainRequired || (boat.defaultCaptainId && Math.random() < 0.7)) {
        captainId = boat.defaultCaptainId

        // Calculate captain fee
        if (captainId) {
          // Find captain's hourly rate
          const captain = Object.values(createdUsers).find(u => u.id === captainId)
          if (captain && captain.hourly_rate !== undefined) {
            const durationHours = getDurationHours(duration)
            captainFee = captain.hourly_rate * durationHours
          }
        }
      }

      // Calculate hold_until for pending holds
      let holdUntil = null
      if (status === 'pending_hold') {
        const minutesRemaining = Math.floor(Math.random() * 15) + 1
        holdUntil = new Date(Date.now() + minutesRemaining * 60 * 1000).toISOString()
      }

      // Create booking
      try {
        const { data: booking, error } = await supabase
          .from('bookings')
          .insert({
            company_id: company.id,
            boat_id: boat.id,
            agent_id: agent.id,
            captain_id: captainId,
            booking_date: dateStr,
            start_time: startTime,
            end_time: endTime,
            duration: duration,
            customer_name: generateCustomerName(),
            customer_email: Math.random() < 0.7 ? `customer${bookingCount}@email.com` : null,
            customer_phone: generatePhone(),
            passengers: Math.floor(Math.random() * Math.min(6, boat.capacity)) + 1,
            package_type: packageType,
            total_price: price,
            captain_fee: captainFee,
            deposit_amount: depositAmount,
            deposit_paid: depositPaid,
            status: status,
            notes: Math.random() < 0.3 ? 'Special occasion' : null,
            hold_until: holdUntil
          })
          .select()
          .single()

        if (error) throw error

        seedData.created.bookings.push(booking)
        bookingCount++

        if (bookingCount % 50 === 0) {
          console.log(`   ... ${bookingCount} bookings created`)
        }
      } catch (error) {
        // Likely a conflict, skip and continue
        continue
      }
    }

    console.log(`✅ Created ${bookingCount} bookings`)

    // Step 8: Create payment transactions
    console.log('\n8️⃣  Creating payment transactions...')
    const paidBookings = seedData.created.bookings.filter(b => b.deposit_paid || b.status === 'completed')
    let paymentCount = 0

    for (const booking of paidBookings) {
      if (booking.deposit_amount > 0) {
        const { data: payment } = await supabase
          .from('payment_transactions')
          .insert({
            company_id: company.id,
            booking_id: booking.id,
            amount: booking.deposit_amount,
            payment_method: randomElement(['card', 'card', 'card', 'cash', 'transfer']),
            payment_type: booking.deposit_amount >= booking.total_price ? 'full_payment' : 'deposit',
            status: 'completed',
            notes: null
          })
          .select()
          .single()

        seedData.created.payments.push(payment)
        paymentCount++
      }

      // Add balance payment for completed bookings
      if (booking.status === 'completed' && booking.deposit_amount < booking.total_price && Math.random() < 0.8) {
        const balance = booking.total_price - booking.deposit_amount
        const { data: payment } = await supabase
          .from('payment_transactions')
          .insert({
            company_id: company.id,
            booking_id: booking.id,
            amount: balance,
            payment_method: randomElement(['card', 'card', 'cash', 'cash']),
            payment_type: 'balance_payment',
            status: 'completed',
            notes: null
          })
          .select()
          .single()

        seedData.created.payments.push(payment)
        paymentCount++
      }
    }

    console.log(`✅ Created ${paymentCount} payment transactions`)

    // Step 9: Create waitlist entries
    console.log('\n9️⃣  Creating waitlist entries...')
    const waitlistStatuses = ['active', 'active', 'active', 'active', 'active', 'active',
                               'contacted', 'contacted', 'contacted', 'converted', 'converted', 'cancelled', 'expired']
    let waitlistCount = 0

    for (let i = 0; i < 20; i++) {
      const dayOffset = Math.floor(Math.random() * 60) - 10 // Mostly future dates
      const preferredDate = addDays(today, dayOffset)
      const dateStr = formatDate(preferredDate)
      const boat = Math.random() < 0.5 ? randomElement(boats).id : null
      const status = randomElement(waitlistStatuses)

      const { data: waitlistEntry } = await supabase
        .from('waitlist')
        .insert({
          company_id: company.id,
          customer_name: generateCustomerName(),
          customer_email: Math.random() < 0.8 ? `waitlist${i}@email.com` : null,
          customer_phone: generatePhone(),
          preferred_date: dateStr,
          boat_id: boat,
          passengers: Math.floor(Math.random() * 6) + 2,
          status: status,
          notes: Math.random() < 0.5 ? 'Flexible on time' : null
        })
        .select()
        .single()

      seedData.created.waitlist.push(waitlistEntry)
      waitlistCount++
    }

    console.log(`✅ Created ${waitlistCount} waitlist entries`)

    // Step 10: Create blocked slots
    console.log('\n🔟  Creating blocked slots...')
    const blockReasons = [
      { reason: 'Maintenance', duration: 'all_day' },
      { reason: 'Weather warning', duration: 'afternoon' },
      { reason: 'Company event', duration: 'morning' },
      { reason: 'Engine repair', duration: 'all_day' }
    ]
    let blockedCount = 0

    for (let i = 0; i < 12; i++) {
      const dayOffset = Math.floor(Math.random() * 90) - 30
      const blockDate = addDays(today, dayOffset)
      const dateStr = formatDate(blockDate)
      const boat = randomElement(boats)
      const block = randomElement(blockReasons)

      let startTime, endTime
      if (block.duration === 'all_day') {
        startTime = '08:00'
        endTime = '20:00'
      } else if (block.duration === 'morning') {
        startTime = '08:00'
        endTime = '14:00'
      } else {
        startTime = '14:00'
        endTime = '20:00'
      }

      const { data: blockedSlot } = await supabase
        .from('blocked_slots')
        .insert({
          company_id: company.id,
          boat_id: boat.id,
          block_date: dateStr,
          start_time: startTime,
          end_time: endTime,
          reason: block.reason,
          notes: null
        })
        .select()
        .single()

      seedData.created.blockedSlots.push(blockedSlot)
      blockedCount++
    }

    console.log(`✅ Created ${blockedCount} blocked slots`)

    // Step 11: Save seed data to JSON
    console.log('\n💾  Saving seed data...')
    const jsonPath = path.join(__dirname, 'seed-data.json')
    fs.writeFileSync(jsonPath, JSON.stringify(seedData, null, 2))
    console.log(`✅ Saved to: ${jsonPath}`)

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!')
    console.log('='.repeat(50))
    console.log(`\n📊 Summary:`)
    console.log(`   Company: ${seedData.created.company.name}`)
    console.log(`   Users: ${seedData.created.users.length}`)
    console.log(`   Boats: ${seedData.created.boats.length}`)
    console.log(`   Pricing entries: ${seedData.created.pricing.length}`)
    console.log(`   Bookings: ${seedData.created.bookings.length}`)
    console.log(`   Payments: ${seedData.created.payments.length}`)
    console.log(`   Waitlist: ${seedData.created.waitlist.length}`)
    console.log(`   Blocked slots: ${seedData.created.blockedSlots.length}`)
    console.log(`\n🔐 Demo Credentials: See DEMO_CREDENTIALS.md`)
    console.log(`📖 Testing Guide: See TESTING_SCENARIOS.md`)
    console.log(`\n✨ Ready for demos and testing!`)

  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the seeder
seedDatabase()

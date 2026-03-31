const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TODAY = new Date()
const DEMO_PASSWORD = 'Demo1234!'
const PRESERVED_ADMIN_EMAIL = 'admin@navibook.com'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function dateStr(daysOffset) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

function addHours(time, hours) {
  const [h, m] = time.split(':').map(Number)
  return `${String((h + hours) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function durationHours(dur) {
  return parseInt(dur.replace('h', ''))
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedRandom(options) {
  const total = Object.values(options).reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (const [key, weight] of Object.entries(options)) {
    rand -= weight
    if (rand <= 0) return key
  }
  return Object.keys(options)[0]
}

// ─────────────────────────────────────────────
// COMPANY CONFIG
// ─────────────────────────────────────────────
const COMPANY = {
  name: 'Happy Sail Estepona',
  address: 'Puerto Deportivo de Estepona, Paseo Marítimo Pedro Manrique, 29680 Estepona, Málaga, Spain',
  phone: '+34 952 800 100',
  email: 'info@happysail.es',
  tax_id: 'ESB29123456',
  latitude: 36.4240,
  longitude: -5.1473,
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
const DEMO_USERS = [
  { email: 'admin@happysail.es', firstName: 'Carlos', lastName: 'Moreno', role: 'admin', phone: '+34 600 100 001', commissionPct: 0, hourlyRate: 0 },
  { email: 'ops@happysail.es', firstName: 'Ana', lastName: 'García', role: 'operations_manager', phone: '+34 600 100 002', commissionPct: 0, hourlyRate: 0 },
  { email: 'accounting@happysail.es', firstName: 'Rosa', lastName: 'Delgado', role: 'accounting_manager', phone: '+34 600 100 003', commissionPct: 0, hourlyRate: 0 },
  { email: 'agent.marco@happysail.es', firstName: 'Marco', lastName: 'Rodríguez', role: 'sales_agent', phone: '+34 600 100 004', commissionPct: 15, hourlyRate: 0 },
  { email: 'agent.laura@happysail.es', firstName: 'Laura', lastName: 'Sánchez', role: 'sales_agent', phone: '+34 600 100 005', commissionPct: 12, hourlyRate: 0 },
  { email: 'agent.pablo@happysail.es', firstName: 'Pablo', lastName: 'Jiménez', role: 'power_agent', phone: '+34 600 100 006', commissionPct: 18, hourlyRate: 0 },
  { email: 'captain.javier@happysail.es', firstName: 'Javier', lastName: 'Ruiz', role: 'captain', phone: '+34 600 100 007', commissionPct: 0, hourlyRate: 0 },
  { email: 'captain.diego@happysail.es', firstName: 'Diego', lastName: 'Santos', role: 'captain', phone: '+34 600 100 008', commissionPct: 0, hourlyRate: 30 },
  { email: 'sailor.miguel@happysail.es', firstName: 'Miguel', lastName: 'Torres', role: 'sailor', phone: '+34 600 100 009', commissionPct: 0, hourlyRate: 18 },
  { email: 'instructor.sofia@happysail.es', firstName: 'Sofía', lastName: 'Navarro', role: 'instructor', phone: '+34 600 100 010', commissionPct: 0, hourlyRate: 22 },
]

// ─────────────────────────────────────────────
// BOATS
// ─────────────────────────────────────────────
const DEMO_BOATS = [
  {
    name: 'El más Inquieto',
    type: 'sailboat',
    capacity: 10,
    license: 'ES-MA-2024-101',
    description: 'Bénéteau Oceanis 411 — Get ready for an exquisite sailing journey in Estepona aboard our spacious and luxurious Bénéteau Oceanis 411 with your own private captain. Experience the magic of Mediterranean sailing with stunning views of Gibraltar and the Moroccan coast.',
    defaultCaptainEmail: 'captain.javier@happysail.es',
    fuelConsumption: 2.5,
    fuelPrice: 1.85,
    model: 'Bénéteau Oceanis 411',
    year: 2018,
    lengthMeters: 12.35,
    homePort: 'Puerto Deportivo de Estepona',
    currentValue: 95000,
    purchaseDate: '2020-03-15',
    insurancePolicyNumber: 'ES-MAR-2024-0011',
    insuranceExpiry: '2025-12-31',
    serialNumber: 'FR-BEN411-2018-0293',
    mmsi: '224112340',
    currentEngineHours: 1247,
    engineHoursAlertThreshold: 1500,
  },
  {
    name: 'Viento Libre',
    type: 'motorboat',
    capacity: 7,
    license: 'ES-MA-2024-102',
    description: 'Quicksilver 755 — Enjoy a luxury private sailing trip aboard the elegant Quicksilver 755, guided by your own private captain and departing from Estepona marina. Perfect for family outings and romantic getaways along the Costa del Sol.',
    defaultCaptainEmail: 'captain.diego@happysail.es',
    fuelConsumption: 38,
    fuelPrice: 1.85,
    model: 'Quicksilver 755 Open',
    year: 2021,
    lengthMeters: 7.55,
    homePort: 'Puerto Deportivo de Estepona',
    currentValue: 42000,
    purchaseDate: '2021-06-20',
    insurancePolicyNumber: 'ES-MAR-2024-0012',
    insuranceExpiry: '2025-12-31',
    serialNumber: 'FR-QS755-2021-1102',
    mmsi: '224112341',
    currentEngineHours: 621,
    engineHoursAlertThreshold: 750,
  },
  {
    name: 'Costa Rápida',
    type: 'motorboat',
    capacity: 6,
    license: 'ES-MA-2024-103',
    description: 'Quicksilver 555 — The Quicksilver 555, with its sleek streamlined design makes for the perfect rental to experience along the Costa del Sol. Ideal for couples and small groups seeking thrilling speed and coastal exploration.',
    defaultCaptainEmail: 'captain.diego@happysail.es',
    fuelConsumption: 25,
    fuelPrice: 1.85,
    model: 'Quicksilver 555 Cruiser',
    year: 2020,
    lengthMeters: 5.55,
    homePort: 'Puerto Deportivo de Estepona',
    currentValue: 28000,
    purchaseDate: '2020-09-10',
    insurancePolicyNumber: 'ES-MAR-2024-0013',
    insuranceExpiry: '2025-12-31',
    serialNumber: 'FR-QS555-2020-0871',
    mmsi: '224112342',
    currentEngineHours: 445,
    engineHoursAlertThreshold: 600,
  },
  {
    name: 'Trueno Azul',
    type: 'jetski',
    capacity: 2,
    license: 'ES-MA-2024-104',
    description: 'Yamaha EX Deluxe — Experience the thrill of jet skiing with the powerful Yamaha EX Deluxe on the sparkling waters of the Costa del Sol. Perfect for adrenaline seekers.',
    defaultCaptainEmail: null,
    fuelConsumption: 17,
    fuelPrice: 1.85,
    model: 'Yamaha EX Deluxe',
    year: 2022,
    lengthMeters: 3.09,
    homePort: 'Puerto Deportivo de Estepona',
    currentValue: 12000,
    purchaseDate: '2022-04-01',
    insurancePolicyNumber: 'ES-MAR-2024-0014',
    insuranceExpiry: '2025-12-31',
    serialNumber: 'US-YAM-EX-2022-3301',
    currentEngineHours: 312,
    engineHoursAlertThreshold: 400,
  },
  {
    name: 'Rayo del Mar',
    type: 'jetski',
    capacity: 2,
    license: 'ES-MA-2024-105',
    description: 'Yamaha EX Deluxe — Ride the waves in style with the Yamaha EX Deluxe jet ski. Unforgettable rides across the sparkling Mediterranean waters.',
    defaultCaptainEmail: null,
    fuelConsumption: 17,
    fuelPrice: 1.85,
    model: 'Yamaha EX Deluxe',
    year: 2022,
    lengthMeters: 3.09,
    homePort: 'Puerto Deportivo de Estepona',
    currentValue: 12000,
    purchaseDate: '2022-04-01',
    insurancePolicyNumber: 'ES-MAR-2024-0015',
    insuranceExpiry: '2025-12-31',
    serialNumber: 'US-YAM-EX-2022-3302',
    currentEngineHours: 289,
    engineHoursAlertThreshold: 400,
  },
  {
    name: 'Ola de Fuego',
    type: 'jetski',
    capacity: 2,
    license: 'ES-MA-2024-106',
    description: 'Yamaha VX — The versatile Yamaha VX jet ski offers an exhilarating and comfortable ride for all skill levels along the beautiful Costa del Sol.',
    defaultCaptainEmail: null,
    fuelConsumption: 19,
    fuelPrice: 1.85,
    model: 'Yamaha VX',
    year: 2023,
    lengthMeters: 3.25,
    homePort: 'Puerto Deportivo de Estepona',
    currentValue: 14500,
    purchaseDate: '2023-03-15',
    insurancePolicyNumber: 'ES-MAR-2024-0016',
    insuranceExpiry: '2025-12-31',
    serialNumber: 'US-YAM-VX-2023-1188',
    currentEngineHours: 198,
    engineHoursAlertThreshold: 350,
  },
  {
    name: 'Espuma Salvaje',
    type: 'jetski',
    capacity: 2,
    license: 'ES-MA-2024-107',
    description: 'Yamaha VX — Take on the Mediterranean waves with the powerful Yamaha VX jet ski. Available for single or paired rental for the ultimate water sports experience.',
    defaultCaptainEmail: null,
    fuelConsumption: 19,
    fuelPrice: 1.85,
    model: 'Yamaha VX',
    year: 2023,
    lengthMeters: 3.25,
    homePort: 'Puerto Deportivo de Estepona',
    currentValue: 14500,
    purchaseDate: '2023-03-15',
    insurancePolicyNumber: 'ES-MAR-2024-0017',
    insuranceExpiry: '2025-12-31',
    serialNumber: 'US-YAM-VX-2023-1189',
    currentEngineHours: 201,
    engineHoursAlertThreshold: 350,
  },
]

// ─────────────────────────────────────────────
// PRICING MATRIX
// ─────────────────────────────────────────────
const PRICING = {
  'El más Inquieto': {
    '3h': { charter_only: 225, charter_drinks: 275, charter_food: 305, charter_full: 355 },
    '4h': { charter_only: 300, charter_drinks: 365, charter_food: 410, charter_full: 475 },
    '8h': { charter_only: 550, charter_drinks: 665, charter_food: 740, charter_full: 855 },
  },
  'Viento Libre': {
    '2h': { charter_only: 120, charter_drinks: 155, charter_food: 175, charter_full: 210 },
    '3h': { charter_only: 170, charter_drinks: 215, charter_food: 245, charter_full: 290 },
    '4h': { charter_only: 220, charter_drinks: 270, charter_food: 310, charter_full: 360 },
    '8h': { charter_only: 400, charter_drinks: 485, charter_food: 555, charter_full: 640 },
  },
  'Costa Rápida': {
    '2h': { charter_only: 99, charter_drinks: 130, charter_food: 150, charter_full: 181 },
    '3h': { charter_only: 140, charter_drinks: 180, charter_food: 205, charter_full: 245 },
    '4h': { charter_only: 180, charter_drinks: 225, charter_food: 255, charter_full: 300 },
    '8h': { charter_only: 330, charter_drinks: 400, charter_food: 455, charter_full: 525 },
  },
  'Trueno Azul': { '2h': { charter_only: 99 }, '3h': { charter_only: 135 } },
  'Rayo del Mar': { '2h': { charter_only: 99 }, '3h': { charter_only: 135 } },
  'Ola de Fuego': { '2h': { charter_only: 109 }, '3h': { charter_only: 149 } },
  'Espuma Salvaje': { '2h': { charter_only: 109 }, '3h': { charter_only: 149 } },
}

// Package costs per person
const PACKAGE_COSTS = {
  drinks_cost_per_person: 22,
  food_cost_per_person: 35,
}

// ─────────────────────────────────────────────
// DEMO DATA GENERATORS
// ─────────────────────────────────────────────
const FIRST_NAMES = [
  'James', 'Sarah', 'Michael', 'Emma', 'David', 'Sophie',
  'John', 'Lisa', 'Robert', 'Anna', 'Christopher', 'Maria',
  'Carlos', 'Juan', 'Pedro', 'María', 'Isabel', 'Francisco',
  'Ahmed', 'Fatima', 'Hassan', 'Amina', 'Yusuf', 'Leila',
  'Jean', 'Pierre', 'Marie', 'André', 'Claude', 'Nicole',
  'Anna', 'Luigi', 'Lucia', 'Giorgio', 'Francesca', 'Marco',
  'Hans', 'Klaus', 'Greta', 'Petra', 'Stefan', 'Angela',
  'Dimitri', 'Natasha', 'Vladimir', 'Olga', 'Sergei', 'Elena',
  'Chen', 'Wei', 'Ming', 'Li', 'Zhang', 'Wang',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Sanchez', 'Perez', 'Torres', 'Ramirez', 'Rivera', 'Jimenez',
  'Rossi', 'Russo', 'Ferrari', 'Bianchi', 'Gallo', 'Rizzo',
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer',
  'Dubois', 'Martin', 'Laurent', 'Simon', 'Michel', 'Garcia',
  'Petrov', 'Sokolov', 'Volkov', 'Orlov', 'Lebedev', 'Smirnov',
  'Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang',
  'Iversen', 'Nielsen', 'Hansen', 'Larsen', 'Anderson', 'Soderberg',
]

const REPEAT_CUSTOMER_NAMES = [
  { firstName: 'Elizabeth', lastName: 'Montgomery', email: 'elizabeth.m@email.com', notes: 'Prefers champagne on board, always books sailboat' },
  { firstName: 'Thomas', lastName: 'Richardson', email: 'thomas.r@email.com', notes: 'Repeat customer — always 8h sailboat charter' },
  { firstName: 'Patricia', lastName: 'Harrison', email: 'patricia.h@email.com', notes: 'Anniversary celebrations — needs deck decoration and rose petals' },
  { firstName: 'Michael', lastName: 'Patterson', email: 'michael.p@email.com', notes: 'Corporate events, prefers motorboat, needs catering' },
  { firstName: 'Jennifer', lastName: 'Kennedy', email: 'jennifer.k@email.com', notes: 'Birthday parties, always books Viento Libre, requests DJ setup' },
  { firstName: 'Robert', lastName: 'Sullivan', email: 'robert.s@email.com', notes: 'Wine enthusiast — provide premium wine selection' },
  { firstName: 'Margaret', lastName: 'Bennett', email: 'margaret.b@email.com', notes: 'Honeymoon bookings, romantic setup, rose petals, champagne' },
  { firstName: 'William', lastName: 'Hughes', email: 'william.h@email.com', notes: 'Group bookings (12-15 people), prefers Costa Rápida for speed' },
  { firstName: 'Katherine', lastName: 'Powell', email: 'katherine.p@email.com', notes: 'Photography sessions on sailboat, early morning departures' },
  { firstName: 'Richard', lastName: 'Davidson', email: 'richard.d@email.com', notes: 'Fishing enthusiast, likes longer routes to deep waters' },
  { firstName: 'Amanda', lastName: 'Kelly', email: 'amanda.k@email.com', notes: 'Family trips, child-friendly, always books Viento Libre' },
  { firstName: 'Joseph', lastName: 'Campbell', email: 'joseph.c@email.com', notes: 'Sunset charters only, very particular about timing' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@email.com', notes: 'Spanish local, group bookings, loves barbecue on boat' },
  { firstName: 'Paul', lastName: 'Morris', email: 'paul.m@email.com', notes: 'Quarterly team building events, 4h motorboat charter' },
  { firstName: 'Susan', lastName: 'Rogers', email: 'susan.r@email.com', notes: 'Sailing lessons preferred, always with instructor Sofia' },
]

// ─────────────────────────────────────────────
// MAIN SCRIPT
// ─────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting seed script...')

  try {
    // Step 1: Find/preserve admin@navibook.com
    console.log('✅ Step 1: Locating preserved admin user...')
    const { data: preservedAdmins, error: preservedError } = await supabase.auth.admin.listUsers()
    if (preservedError) {
      console.error('❌ Step 1: Failed to list auth users', preservedError)
      return
    }
    const preservedAdmin = preservedAdmins?.users?.find(u => u.email === PRESERVED_ADMIN_EMAIL)
    console.log(`   Found preserved admin: ${PRESERVED_ADMIN_EMAIL} (ID: ${preservedAdmin?.id || 'not found'})`)

    // Step 2: Delete old demo auth users (skip PRESERVED_ADMIN_EMAIL)
    console.log('✅ Step 2: Deleting old demo auth users...')
    for (const user of preservedAdmins?.users || []) {
      if (user.email && user.email !== PRESERVED_ADMIN_EMAIL && user.email.includes('@happysail.es')) {
        try {
          await supabase.auth.admin.deleteUser(user.id)
          console.log(`   Deleted auth user: ${user.email}`)
        } catch (e) {
          console.log(`   Skipped auth user: ${user.email}`)
        }
      }
    }

    // Step 3: Clear all data tables (FK-safe order)
    console.log('✅ Step 3: Clearing old demo data...')
    const tablesToClear = [
      'booking_history',
      'booking_sailors',
      'payment_transactions',
      'bookings',
      'waitlist',
      'customer_notes',
      'pricing',
      'boat_fuel_config',
      'company_package_config',
      'boat_activity_log',
      'fleet_expense_approvals',
      'fleet_expenses',
      'maintenance_approvals',
      'maintenance_logs',
      'fuel_logs',
      'safety_equipment',
      'fleet_documents',
      'blocked_slots',
      'boats',
    ]
    for (const table of tablesToClear) {
      try {
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        console.log(`   Cleared table: ${table}`)
      } catch (e) {
        console.log(`   Skipped table: ${table} (may not exist yet)`)
      }
    }

    // Step 4: Update/create company
    console.log('✅ Step 4: Creating/updating company...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', COMPANY.name)
    if (companiesError) {
      console.error('❌ Step 4: Failed to query companies', companiesError)
      return
    }

    let companyId
    if (companies && companies.length > 0) {
      companyId = companies[0].id
      await supabase.from('companies').update({
        address: COMPANY.address,
        phone: COMPANY.phone,
        email: COMPANY.email,
        tax_id: COMPANY.tax_id,
      }).eq('id', companyId)
      console.log(`   Updated company: ${companyId}`)
    } else {
      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert([COMPANY])
        .select()
      if (insertError) {
        console.error('❌ Step 4: Failed to create company', insertError)
        return
      }
      companyId = newCompany[0].id
      console.log(`   Created company: ${companyId}`)
    }

    // Step 5: Create demo auth users + user records
    console.log('✅ Step 5: Creating demo auth users and profiles...')
    const userMap = {}

    // First, create preserved admin profile if needed
    if (preservedAdmin) {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', preservedAdmin.id)
      if (!existingProfile || existingProfile.length === 0) {
        const adminUser = {
          firstName: 'Admin',
          lastName: 'Navibook',
          email: PRESERVED_ADMIN_EMAIL,
          role: 'admin',
        }
        const { data: profile } = await supabase
          .from('users')
          .insert([{
            id: preservedAdmin.id,
            company_id: companyId,
            first_name: adminUser.firstName,
            last_name: adminUser.lastName,
            email: adminUser.email,
            role: adminUser.role,
            phone: '+34 666 000 001',
            commission_percentage: 0,
            hourly_rate: 0,
          }])
          .select()
        if (profile && profile.length > 0) {
          userMap[PRESERVED_ADMIN_EMAIL] = profile[0].id
          console.log(`   Created profile for preserved admin: ${PRESERVED_ADMIN_EMAIL}`)
        }
      } else {
        userMap[PRESERVED_ADMIN_EMAIL] = existingProfile[0].id
        console.log(`   Reused existing profile for: ${PRESERVED_ADMIN_EMAIL}`)
      }
    }

    // Create other demo users
    for (const user of DEMO_USERS) {
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
        })
        if (authError && (authError.code === 'email_exists' || authError.message?.includes('already registered'))) {
          console.log(`   Auth user already exists: ${user.email}`)
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existing = existingUsers?.users?.find(u => u.email === user.email)
          if (existing) {
            const { data: profile } = await supabase
              .from('users')
              .insert([{
                id: existing.id,
                company_id: companyId,
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                commission_percentage: user.commissionPct,
                hourly_rate: user.hourlyRate,
              }])
              .select()
            if (profile && profile.length > 0) {
              userMap[user.email] = profile[0].id
            }
          }
        } else if (authError) {
          console.error(`   Failed to create auth user ${user.email}:`, authError)
          continue
        } else if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .insert([{
              id: authUser.user.id,
              company_id: companyId,
              first_name: user.firstName,
              last_name: user.lastName,
              email: user.email,
              role: user.role,
              phone: user.phone,
              commission_percentage: user.commissionPct,
              hourly_rate: user.hourlyRate,
            }])
            .select()
          if (profileError) {
            console.error(`   Failed to create profile for ${user.email}:`, profileError)
          } else if (profile && profile.length > 0) {
            userMap[user.email] = profile[0].id
            console.log(`   Created auth & profile: ${user.email} (role: ${user.role})`)
          }
        }
      } catch (e) {
        console.error(`   Error creating user ${user.email}:`, e.message)
      }
    }

    // Step 6: Create boats
    console.log('✅ Step 6: Creating boats...')
    const boatMap = {}
    for (const boat of DEMO_BOATS) {
      const { data: newBoat, error: boatError } = await supabase
        .from('boats')
        .insert([{
          company_id: companyId,
          name: boat.name,
          boat_type: boat.type,
          capacity: boat.capacity,
          license_number: boat.license,
          description: boat.description,
          model: boat.model,
          year: boat.year,
          length_meters: boat.lengthMeters,
          home_port: boat.homePort,
          current_value: boat.currentValue,
          purchase_date: boat.purchaseDate,
          insurance_policy_number: boat.insurancePolicyNumber,
          insurance_expiry: boat.insuranceExpiry,
          serial_number: boat.serialNumber,
          mmsi: boat.mmsi,
          current_engine_hours: boat.currentEngineHours,
          engine_hours_alert_threshold: boat.engineHoursAlertThreshold,
        }])
        .select()
      if (boatError) {
        console.error(`   Failed to create boat ${boat.name}:`, boatError)
      } else if (newBoat && newBoat.length > 0) {
        boatMap[boat.name] = newBoat[0].id
        console.log(`   Created boat: ${boat.name} (capacity: ${boat.capacity})`)
      }
    }

    // Step 7: Enable fleet module
    console.log('✅ Step 7: Enabling fleet module...')
    await supabase
      .from('companies')
      .update({ fleet_module_enabled: true })
      .eq('id', companyId)
    console.log('   Fleet module enabled')

    // Step 8: Insert fuel configs
    console.log('✅ Step 8: Inserting fuel configs...')
    for (const boat of DEMO_BOATS) {
      const boatId = boatMap[boat.name]
      if (boatId) {
        await supabase.from('boat_fuel_config').insert([{
          company_id: companyId,
          boat_id: boatId,
          fuel_consumption_per_hour: boat.fuelConsumption,
          fuel_price_per_liter: boat.fuelPrice,
        }])
        console.log(`   Fuel config: ${boat.name} (${boat.fuelConsumption}L/h @ €${boat.fuelPrice})`)
      }
    }

    // Step 9: Insert package config
    console.log('✅ Step 9: Inserting package config...')
    await supabase.from('company_package_config').insert([{
      company_id: companyId,
      drinks_cost_per_person: PACKAGE_COSTS.drinks_cost_per_person,
      food_cost_per_person: PACKAGE_COSTS.food_cost_per_person,
    }])
    console.log('   Package config inserted')

    // Step 10: Insert pricing matrix
    console.log('✅ Step 10: Inserting pricing matrix...')
    for (const [boatName, durations] of Object.entries(PRICING)) {
      const boatId = boatMap[boatName]
      if (boatId) {
        for (const [duration, packages] of Object.entries(durations)) {
          for (const [pkgName, price] of Object.entries(packages)) {
            await supabase.from('pricing').insert([{
              boat_id: boatId,
              duration: duration,
              package_type: pkgName,
              price: price,
            }])
          }
        }
        console.log(`   Pricing for ${boatName}: ${Object.keys(durations).length} duration(s)`)
      }
    }

    // Step 11: Create bookings + payment transactions
    console.log('✅ Step 11: Generating bookings (~140 total)...')
    const salesAgents = ['agent.marco@happysail.es', 'agent.laura@happysail.es', 'agent.pablo@happysail.es']
    const sailboatNames = ['El más Inquieto']
    const motorboatNames = ['Viento Libre', 'Costa Rápida']
    const jetskiNames = ['Trueno Azul', 'Rayo del Mar', 'Ola de Fuego', 'Espuma Salvaje']
    const paymentMethods = ['card', 'bank_transfer', 'cash', 'other']
    const sources = ['direct', 'website', 'airbnb', 'viator', 'tripadvisor']

    const allBookingNames = Object.keys(boatMap)
    let bookingCount = 0
    const bookingIds = []

    // Past bookings (~90): 90% completed, 10% cancelled
    for (let i = 0; i < 90; i++) {
      const daysOffset = randomRange(-180, -1)
      const boatName = randomFromArray(allBookingNames)
      const boat = DEMO_BOATS.find(b => b.name === boatName)
      const boatId = boatMap[boatName]

      let duration = '2h'
      if (sailboatNames.includes(boatName)) {
        duration = randomFromArray(['4h', '8h'])
      } else if (motorboatNames.includes(boatName)) {
        duration = randomFromArray(['2h', '3h', '4h', '8h'])
      } else if (jetskiNames.includes(boatName)) {
        duration = randomFromArray(['2h', '3h'])
      }

      const pkgType = randomFromArray(['charter_only', 'charter_drinks', 'charter_food', 'charter_full'])
      const pricing = PRICING[boatName][duration]
      let charterPrice = pricing[pkgType] || pricing.charter_only

      const passengers = randomRange(1, boat.capacity)
      const durationHrs = durationHours(duration)
      let fuelCost = durationHrs * boat.fuelConsumption * boat.fuelPrice
      if (sailboatNames.includes(boatName)) {
        fuelCost = fuelCost * 0.5
      }

      let packageAddonCost = 0
      if (pkgType.includes('drinks')) {
        packageAddonCost += passengers * PACKAGE_COSTS.drinks_cost_per_person
      }
      if (pkgType.includes('food')) {
        packageAddonCost += passengers * PACKAGE_COSTS.food_cost_per_person
      }

      const totalPrice = charterPrice + Math.round(fuelCost) + packageAddonCost
      const depositAmount = Math.round(totalPrice * 0.3)

      const customerName = randomFromArray([...FIRST_NAMES, ...LAST_NAMES])
      const lastName = randomFromArray(LAST_NAMES)
      const customerPhone = `+34 ${randomRange(600, 699)} ${randomRange(100, 999)} ${randomRange(100, 999)}`

      const agentEmail = randomFromArray(salesAgents)
      const agentId = userMap[agentEmail]

      let captainId = null
      if (boat.defaultCaptainEmail) {
        captainId = userMap[boat.defaultCaptainEmail]
      }

      const agentCommission = Math.min(50, Math.round(totalPrice * (DEMO_USERS.find(u => u.email === agentEmail)?.commissionPct || 0) / 100))

      let captainFee = 0
      if (captainId) {
        if (sailboatNames.includes(boatName)) {
          captainFee = durationHrs === 4 ? 80 : 120
        } else if (motorboatNames.includes(boatName)) {
          captainFee = durationHrs <= 4 ? 60 : 90
        }
      }

      const startTimes = ['09:00', '10:00', '11:00', '14:00', '15:00']
      const startTime = randomFromArray(startTimes)
      const endTime = addHours(startTime, durationHrs)

      const status = Math.random() < 0.9 ? 'completed' : 'cancelled'

      const bookingDate = dateStr(daysOffset)

      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          company_id: companyId,
          boat_id: boatId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration: duration,
          package_type: pkgType,
          customer_name: `${customerName} ${lastName}`,
          customer_phone: customerPhone,
          customer_email: `customer${i}@example.com`,
          passengers: passengers,
          total_price: totalPrice,
          fuel_cost: Math.round(fuelCost),
          package_addon_cost: packageAddonCost,
          deposit_amount: depositAmount,
          deposit_paid: status === 'completed',
          source: weightedRandom({ direct: 40, website: 25, airbnb: 15, viator: 10, tripadvisor: 10 }),
          booking_category: Math.random() < 0.85 ? 'commercial' : (Math.random() < 0.5 ? 'owner_use' : 'maintenance'),
          agent_id: agentId,
          captain_id: captainId,
          agent_commission: agentCommission,
          captain_fee: captainFee,
          status: status,
          notes: `Auto-generated demo booking`,
        }])
        .select()

      if (bookingError) {
        console.error(`   Failed to create booking ${i}:`, bookingError)
      } else if (newBooking && newBooking.length > 0) {
        bookingIds.push(newBooking[0].id)
        bookingCount++

        // Add payment transactions for completed bookings
        if (status === 'completed') {
          const depositMethod = randomFromArray(paymentMethods)
          await supabase.from('payment_transactions').insert([
            {
              company_id: companyId,
              booking_id: newBooking[0].id,
              payment_type: 'deposit',
              amount: depositAmount,
              payment_method: depositMethod,
              payment_date: bookingDate,
            },
            {
              company_id: companyId,
              booking_id: newBooking[0].id,
              payment_type: 'final_payment',
              amount: totalPrice - depositAmount,
              payment_method: randomFromArray(paymentMethods),
              payment_date: bookingDate,
            },
          ])
        }
      }
    }

    // Future bookings (~35): confirmed or pending_hold
    for (let i = 0; i < 35; i++) {
      const daysOffset = randomRange(1, 90)
      const boatName = randomFromArray(allBookingNames)
      const boat = DEMO_BOATS.find(b => b.name === boatName)
      const boatId = boatMap[boatName]

      let duration = '2h'
      if (sailboatNames.includes(boatName)) {
        duration = randomFromArray(['4h', '8h'])
      } else if (motorboatNames.includes(boatName)) {
        duration = randomFromArray(['2h', '3h', '4h', '8h'])
      } else if (jetskiNames.includes(boatName)) {
        duration = randomFromArray(['2h', '3h'])
      }

      const pkgType = randomFromArray(['charter_only', 'charter_drinks', 'charter_food', 'charter_full'])
      const pricing = PRICING[boatName][duration]
      let charterPrice = pricing[pkgType] || pricing.charter_only

      const passengers = randomRange(1, boat.capacity)
      const durationHrs = durationHours(duration)
      let fuelCost = durationHrs * boat.fuelConsumption * boat.fuelPrice
      if (sailboatNames.includes(boatName)) {
        fuelCost = fuelCost * 0.5
      }

      let packageAddonCost = 0
      if (pkgType.includes('drinks')) {
        packageAddonCost += passengers * PACKAGE_COSTS.drinks_cost_per_person
      }
      if (pkgType.includes('food')) {
        packageAddonCost += passengers * PACKAGE_COSTS.food_cost_per_person
      }

      const totalPrice = charterPrice + Math.round(fuelCost) + packageAddonCost
      const depositAmount = Math.round(totalPrice * 0.3)

      const customerName = randomFromArray([...FIRST_NAMES, ...LAST_NAMES])
      const lastName = randomFromArray(LAST_NAMES)
      const customerPhone = `+34 ${randomRange(600, 699)} ${randomRange(100, 999)} ${randomRange(100, 999)}`

      const agentEmail = randomFromArray(salesAgents)
      const agentId = userMap[agentEmail]

      let captainId = null
      if (boat.defaultCaptainEmail) {
        captainId = userMap[boat.defaultCaptainEmail]
      }

      const agentCommission = Math.min(50, Math.round(totalPrice * (DEMO_USERS.find(u => u.email === agentEmail)?.commissionPct || 0) / 100))

      let captainFee = 0
      if (captainId) {
        if (sailboatNames.includes(boatName)) {
          captainFee = durationHrs === 4 ? 80 : 120
        } else if (motorboatNames.includes(boatName)) {
          captainFee = durationHrs <= 4 ? 60 : 90
        }
      }

      const startTimes = ['09:00', '10:00', '11:00', '14:00', '15:00']
      const startTime = randomFromArray(startTimes)
      const endTime = addHours(startTime, durationHrs)

      const status = Math.random() < 0.8 ? 'confirmed' : 'pending_hold'
      const bookingDate = dateStr(daysOffset)

      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          company_id: companyId,
          boat_id: boatId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration: duration,
          package_type: pkgType,
          customer_name: `${customerName} ${lastName}`,
          customer_phone: customerPhone,
          customer_email: `customer${90 + i}@example.com`,
          passengers: passengers,
          total_price: totalPrice,
          fuel_cost: Math.round(fuelCost),
          package_addon_cost: packageAddonCost,
          deposit_amount: depositAmount,
          deposit_paid: status === 'confirmed',
          source: weightedRandom({ direct: 40, website: 25, airbnb: 15, viator: 10, tripadvisor: 10 }),
          booking_category: 'commercial',
          agent_id: agentId,
          captain_id: captainId,
          agent_commission: agentCommission,
          captain_fee: captainFee,
          status: status,
          notes: `Auto-generated demo booking (future)`,
        }])
        .select()

      if (bookingError) {
        console.error(`   Failed to create future booking ${i}:`, bookingError)
      } else if (newBooking && newBooking.length > 0) {
        bookingIds.push(newBooking[0].id)
        bookingCount++

        if (status === 'confirmed') {
          const depositMethod = randomFromArray(paymentMethods)
          await supabase.from('payment_transactions').insert([
            {
              company_id: companyId,
              booking_id: newBooking[0].id,
              payment_type: 'deposit',
              amount: depositAmount,
              payment_method: depositMethod,
              payment_date: bookingDate,
            },
          ])
        }
      }
    }

    // Today/this week bookings (~15)
    for (let i = 0; i < 15; i++) {
      const daysOffset = randomRange(-3, 3)
      const boatName = randomFromArray(allBookingNames)
      const boat = DEMO_BOATS.find(b => b.name === boatName)
      const boatId = boatMap[boatName]

      let duration = '2h'
      if (sailboatNames.includes(boatName)) {
        duration = randomFromArray(['4h', '8h'])
      } else if (motorboatNames.includes(boatName)) {
        duration = randomFromArray(['2h', '3h', '4h', '8h'])
      } else if (jetskiNames.includes(boatName)) {
        duration = randomFromArray(['2h', '3h'])
      }

      const pkgType = randomFromArray(['charter_only', 'charter_drinks', 'charter_food', 'charter_full'])
      const pricing = PRICING[boatName][duration]
      let charterPrice = pricing[pkgType] || pricing.charter_only

      const passengers = randomRange(1, boat.capacity)
      const durationHrs = durationHours(duration)
      let fuelCost = durationHrs * boat.fuelConsumption * boat.fuelPrice
      if (sailboatNames.includes(boatName)) {
        fuelCost = fuelCost * 0.5
      }

      let packageAddonCost = 0
      if (pkgType.includes('drinks')) {
        packageAddonCost += passengers * PACKAGE_COSTS.drinks_cost_per_person
      }
      if (pkgType.includes('food')) {
        packageAddonCost += passengers * PACKAGE_COSTS.food_cost_per_person
      }

      const totalPrice = charterPrice + Math.round(fuelCost) + packageAddonCost
      const depositAmount = Math.round(totalPrice * 0.3)

      const customerName = randomFromArray([...FIRST_NAMES, ...LAST_NAMES])
      const lastName = randomFromArray(LAST_NAMES)
      const customerPhone = `+34 ${randomRange(600, 699)} ${randomRange(100, 999)} ${randomRange(100, 999)}`

      const agentEmail = randomFromArray(salesAgents)
      const agentId = userMap[agentEmail]

      let captainId = null
      if (boat.defaultCaptainEmail) {
        captainId = userMap[boat.defaultCaptainEmail]
      }

      const agentCommission = Math.min(50, Math.round(totalPrice * (DEMO_USERS.find(u => u.email === agentEmail)?.commissionPct || 0) / 100))

      let captainFee = 0
      if (captainId) {
        if (sailboatNames.includes(boatName)) {
          captainFee = durationHrs === 4 ? 80 : 120
        } else if (motorboatNames.includes(boatName)) {
          captainFee = durationHrs <= 4 ? 60 : 90
        }
      }

      const startTimes = ['09:00', '10:00', '11:00', '14:00', '15:00']
      const startTime = randomFromArray(startTimes)
      const endTime = addHours(startTime, durationHrs)

      const status = daysOffset <= 0 ? (Math.random() < 0.7 ? 'completed' : 'confirmed') : 'confirmed'
      const bookingDate = dateStr(daysOffset)

      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          company_id: companyId,
          boat_id: boatId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration: duration,
          package_type: pkgType,
          customer_name: `${customerName} ${lastName}`,
          customer_phone: customerPhone,
          customer_email: `customer${125 + i}@example.com`,
          passengers: passengers,
          total_price: totalPrice,
          fuel_cost: Math.round(fuelCost),
          package_addon_cost: packageAddonCost,
          deposit_amount: depositAmount,
          deposit_paid: true,
          source: weightedRandom({ direct: 40, website: 25, airbnb: 15, viator: 10, tripadvisor: 10 }),
          booking_category: 'commercial',
          agent_id: agentId,
          captain_id: captainId,
          agent_commission: agentCommission,
          captain_fee: captainFee,
          status: status,
          notes: `Auto-generated demo booking (this week)`,
        }])
        .select()

      if (bookingError) {
        console.error(`   Failed to create this-week booking ${i}:`, bookingError)
      } else if (newBooking && newBooking.length > 0) {
        bookingIds.push(newBooking[0].id)
        bookingCount++

        if (status === 'completed') {
          const depositMethod = randomFromArray(paymentMethods)
          await supabase.from('payment_transactions').insert([
            {
              company_id: companyId,
              booking_id: newBooking[0].id,
              payment_type: 'deposit',
              amount: depositAmount,
              payment_method: depositMethod,
              payment_date: bookingDate,
            },
            {
              company_id: companyId,
              booking_id: newBooking[0].id,
              payment_type: 'final_payment',
              amount: totalPrice - depositAmount,
              payment_method: randomFromArray(paymentMethods),
              payment_date: bookingDate,
            },
          ])
        } else if (status === 'confirmed') {
          await supabase.from('payment_transactions').insert([
            {
              company_id: companyId,
              booking_id: newBooking[0].id,
              payment_type: 'deposit',
              amount: depositAmount,
              payment_method: randomFromArray(paymentMethods),
              payment_date: bookingDate,
            },
          ])
        }
      }
    }

    console.log(`   Created ${bookingCount} bookings total`)

    // Step 12: Create customer notes
    console.log('✅ Step 12: Creating customer notes (repeat customers)...')
    for (const customer of REPEAT_CUSTOMER_NAMES) {
      const { data: note, error: noteError } = await supabase.from('customer_notes').insert([{
        company_id: companyId,
        customer_email: customer.email,
        notes: `${customer.firstName} ${customer.lastName} — ${customer.notes}`,
      }]).select()

      if (noteError) {
        console.error(`   Failed to create customer note: ${customer.email}`)
      } else {
        console.log(`   Customer note: ${customer.firstName} ${customer.lastName}`)
      }
    }

    // Step 13: Create waitlist entries
    console.log('✅ Step 13: Creating waitlist entries...')
    for (let i = 0; i < 5; i++) {
      const daysOffset = randomRange(5, 45)
      const boatName = randomFromArray(allBookingNames)
      const boatId = boatMap[boatName]
      const duration = randomFromArray(['2h', '3h', '4h', '8h'])

      const customerName = randomFromArray([...FIRST_NAMES, ...LAST_NAMES])
      const lastName = randomFromArray(LAST_NAMES)
      const customerPhone = `+34 ${randomRange(600, 699)} ${randomRange(100, 999)} ${randomRange(100, 999)}`

      const waitlistDate = dateStr(daysOffset)

      await supabase.from('waitlist').insert([{
        company_id: companyId,
        boat_id: boatId,
        requested_date: waitlistDate,
        duration: duration,
        customer_name: `${customerName} ${lastName}`,
        customer_phone: customerPhone,
        customer_email: `waitlist${i}@example.com`,
        notes: `Waitlist entry - prefers ${boatName}`,
        status: 'pending',
      }])
      console.log(`   Waitlist: ${customerName} ${lastName} for ${boatName}`)
    }

    // Step 14: Create blocked slots (maintenance windows)
    console.log('✅ Step 14: Creating blocked slots (maintenance)...')

    // Past blocked slots
    const pastBlockedBoats = [
      { boatName: 'El más Inquieto', daysOffset: -45, duration: 3 },
      { boatName: 'Viento Libre', daysOffset: -30, duration: 2 },
      { boatName: 'Trueno Azul', daysOffset: -15, duration: 4 },
    ]

    for (const blocked of pastBlockedBoats) {
      const boatId = boatMap[blocked.boatName]
      const startDate = dateStr(blocked.daysOffset)
      const endDate = dateStr(blocked.daysOffset + blocked.duration)

      await supabase.from('blocked_slots').insert([{
        company_id: companyId,
        boat_id: boatId,
        start_date: startDate,
        end_date: endDate,
        reason: `Past maintenance: ${blocked.boatName}`,
        blocked_type: 'maintenance',
      }])
      console.log(`   Past blocked slot: ${blocked.boatName} (${startDate} to ${endDate})`)
    }

    // Future blocked slots
    const futureBlockedBoats = [
      { boatName: 'El más Inquieto', daysOffset: 28, duration: 5 },
      { boatName: 'Costa Rápida', daysOffset: 35, duration: 3 },
    ]

    for (const blocked of futureBlockedBoats) {
      const boatId = boatMap[blocked.boatName]
      const startDate = dateStr(blocked.daysOffset)
      const endDate = dateStr(blocked.daysOffset + blocked.duration)

      await supabase.from('blocked_slots').insert([{
        company_id: companyId,
        boat_id: boatId,
        start_date: startDate,
        end_date: endDate,
        reason: `Scheduled maintenance: ${blocked.boatName}`,
        blocked_type: 'maintenance',
      }])
      console.log(`   Future blocked slot: ${blocked.boatName} (${startDate} to ${endDate})`)
    }

    // Step 15: Insert fleet module data
    console.log('✅ Step 15: Populating fleet module data...')

    // 15a: Fuel logs (8-12 per boat)
    console.log('   Creating fuel logs...')
    for (const boat of DEMO_BOATS) {
      const boatId = boatMap[boat.name]
      const numLogs = randomRange(8, 12)
      let currentEngineHours = boat.currentEngineHours - (numLogs * 50)

      for (let i = 0; i < numLogs; i++) {
        const logDate = dateStr(randomRange(-180, -1))
        let fillSize
        if (boat.type === 'sailboat') {
          fillSize = randomRange(30, 60)
        } else if (boat.type === 'motorboat') {
          fillSize = randomRange(80, 200)
        } else {
          fillSize = randomRange(25, 40)
        }
        currentEngineHours += randomRange(30, 70)

        await supabase.from('fuel_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          log_date: logDate,
          fill_size_liters: fillSize,
          engine_hours_at_entry: currentEngineHours,
          cost: Math.round(fillSize * boat.fuelPrice),
          notes: 'Routine refuel',
        }])
      }
      console.log(`   Fuel logs for ${boat.name}: ${numLogs} entries`)
    }

    // 15b: Maintenance logs (2-3 past + 1-2 future per boat)
    console.log('   Creating maintenance logs...')
    const maintenanceVendors = ['Náutica Costa del Sol', 'MarineService Estepona', 'Taller Naval Málaga']

    for (const boat of DEMO_BOATS) {
      const boatId = boatMap[boat.name]

      if (boat.type === 'sailboat') {
        // Annual rig inspection (past)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(-120),
          description: 'Annual rig inspection',
          maintenance_type: 'preventive',
          status: 'completed',
          actual_cost: 450,
          parts_cost: 150,
          labor_cost: 300,
          vendor: randomFromArray(maintenanceVendors),
        }])
        // Engine service (past)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(-60),
          description: 'Engine service',
          maintenance_type: 'preventive',
          status: 'completed',
          actual_cost: 650,
          parts_cost: 350,
          labor_cost: 300,
          vendor: randomFromArray(maintenanceVendors),
        }])
        // Anti-fouling paint (upcoming)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(20),
          description: 'Anti-fouling paint',
          maintenance_type: 'preventive',
          status: 'scheduled',
          vendor: randomFromArray(maintenanceVendors),
        }])
      } else if (boat.type === 'motorboat') {
        // Engine service (past)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(-90),
          description: 'Engine service',
          maintenance_type: 'preventive',
          status: 'completed',
          actual_cost: 520,
          parts_cost: 280,
          labor_cost: 240,
          vendor: randomFromArray(maintenanceVendors),
        }])
        // Hull cleaning (past)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(-45),
          description: 'Hull cleaning',
          maintenance_type: 'routine',
          status: 'completed',
          actual_cost: 280,
          parts_cost: 0,
          labor_cost: 280,
          vendor: randomFromArray(maintenanceVendors),
        }])
        // Annual inspection (upcoming)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(25),
          description: 'Annual inspection',
          maintenance_type: 'preventive',
          status: 'scheduled',
          vendor: randomFromArray(maintenanceVendors),
        }])
      } else {
        // Jetski
        // Season service (past)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(-75),
          description: 'Season service',
          maintenance_type: 'preventive',
          status: 'completed',
          actual_cost: 320,
          parts_cost: 160,
          labor_cost: 160,
          vendor: randomFromArray(maintenanceVendors),
        }])
        // Hull inspection (upcoming)
        await supabase.from('maintenance_logs').insert([{
          company_id: companyId,
          boat_id: boatId,
          maintenance_date: dateStr(45),
          description: 'Hull inspection',
          maintenance_type: 'preventive',
          status: 'scheduled',
          vendor: randomFromArray(maintenanceVendors),
        }])
      }
      console.log(`   Maintenance logs for ${boat.name}: created`)
    }

    // 15c: Fleet expenses (4-6 per boat)
    console.log('   Creating fleet expenses...')
    for (const boat of DEMO_BOATS) {
      const boatId = boatMap[boat.name]

      // Annual insurance (split quarterly)
      const annualInsurance = boat.currentValue * 0.06
      const quarterlyInsurance = Math.round(annualInsurance / 4)
      for (let q = 0; q < 4; q++) {
        await supabase.from('fleet_expenses').insert([{
          company_id: companyId,
          boat_id: boatId,
          expense_date: dateStr(randomRange(-180, -1)),
          category: 'insurance',
          description: `Insurance premium - Q${q + 1}`,
          amount: quarterlyInsurance,
          vendor: 'Seguros Marinos Estepona',
        }])
      }

      // Monthly mooring fee
      for (let m = 0; m < 6; m++) {
        await supabase.from('fleet_expenses').insert([{
          company_id: companyId,
          boat_id: boatId,
          expense_date: dateStr(randomRange(-180, -1)),
          category: 'mooring',
          description: 'Monthly mooring fee',
          amount: randomRange(350, 500),
          vendor: 'Puerto Deportivo de Estepona',
        }])
      }

      // Equipment & supplies
      for (let i = 0; i < 2; i++) {
        await supabase.from('fleet_expenses').insert([{
          company_id: companyId,
          boat_id: boatId,
          expense_date: dateStr(randomRange(-180, -1)),
          category: randomFromArray(['equipment', 'supplies']),
          description: randomFromArray(['Rope & rigging', 'Fenders & bumpers', 'Cleaning supplies', 'Safety gear', 'Engine filters']),
          amount: randomRange(80, 250),
          vendor: randomFromArray(['Náutica Costa del Sol', 'MarineService Estepona', 'Local supplier']),
        }])
      }
      console.log(`   Expenses for ${boat.name}: created`)
    }

    // 15d: Safety equipment (4-6 per boat)
    console.log('   Creating safety equipment...')
    for (const boat of DEMO_BOATS) {
      const boatId = boatMap[boat.name]

      // Life jackets
      await supabase.from('safety_equipment').insert([{
        company_id: companyId,
        boat_id: boatId,
        equipment_type: 'life_jacket',
        quantity: boat.capacity,
        last_inspected: dateStr(-30),
        expiry_date: dateStr(180),
        status: 'serviceable',
        notes: `${boat.capacity} adult life jackets`,
      }])

      // Fire extinguisher(s)
      await supabase.from('safety_equipment').insert([{
        company_id: companyId,
        boat_id: boatId,
        equipment_type: 'fire_extinguisher',
        quantity: boat.type === 'sailboat' ? 2 : 1,
        last_inspected: dateStr(-45),
        expiry_date: dateStr(365),
        status: 'serviceable',
        notes: 'CO2 fire extinguishers, certified',
      }])

      // Flares
      if (boat.type !== 'jetski') {
        await supabase.from('safety_equipment').insert([{
          company_id: companyId,
          boat_id: boatId,
          equipment_type: 'flares',
          quantity: randomRange(3, 4),
          last_inspected: dateStr(-60),
          expiry_date: dateStr(randomRange(100, 200)),
          status: 'serviceable',
          notes: 'Parachute flares and handheld flares',
        }])

        // EPIRB
        await supabase.from('safety_equipment').insert([{
          company_id: companyId,
          boat_id: boatId,
          equipment_type: 'epirb',
          quantity: 1,
          last_inspected: dateStr(-90),
          expiry_date: dateStr(730),
          status: 'serviceable',
          notes: 'Emergency Position Indicating Radio Beacon',
        }])
      }

      // Medical kit
      await supabase.from('safety_equipment').insert([{
        company_id: companyId,
        boat_id: boatId,
        equipment_type: 'medical_kit',
        quantity: 1,
        last_inspected: dateStr(-20),
        expiry_date: dateStr(365),
        status: 'serviceable',
        notes: 'First aid kit with marine-specific supplies',
      }])

      // Harness (sailboat only)
      if (boat.type === 'sailboat') {
        await supabase.from('safety_equipment').insert([{
          company_id: companyId,
          boat_id: boatId,
          equipment_type: 'harness',
          quantity: 4,
          last_inspected: dateStr(-15),
          expiry_date: dateStr(1095),
          status: 'serviceable',
          notes: 'Safety harnesses for deck work',
        }])
      }
      console.log(`   Safety equipment for ${boat.name}: created`)
    }

    // 15e: Fleet documents (3-4 per boat)
    console.log('   Creating fleet documents...')
    for (const boat of DEMO_BOATS) {
      const boatId = boatMap[boat.name]

      // Registration certificate
      await supabase.from('fleet_documents').insert([{
        company_id: companyId,
        boat_id: boatId,
        document_type: 'registration',
        document_name: `${boat.name} - Registration Certificate`,
        document_url: `https://storage.happysail.es/docs/${boat.name.replace(/\s+/g, '_')}/registration.pdf`,
        upload_date: dateStr(-365),
        expiry_date: dateStr(1095),
      }])

      // Insurance certificate
      await supabase.from('fleet_documents').insert([{
        company_id: companyId,
        boat_id: boatId,
        document_type: 'insurance',
        document_name: `${boat.name} - Insurance Certificate 2025`,
        document_url: `https://storage.happysail.es/docs/${boat.name.replace(/\s+/g, '_')}/insurance.pdf`,
        upload_date: dateStr(-30),
        expiry_date: '2025-12-31',
      }])

      // Safety certificate
      await supabase.from('fleet_documents').insert([{
        company_id: companyId,
        boat_id: boatId,
        document_type: 'safety_certificate',
        document_name: `${boat.name} - Safety Certificate`,
        document_url: `https://storage.happysail.es/docs/${boat.name.replace(/\s+/g, '_')}/safety.pdf`,
        upload_date: dateStr(-90),
        expiry_date: dateStr(730),
      }])

      // Survey report (sailboat only)
      if (boat.type === 'sailboat') {
        await supabase.from('fleet_documents').insert([{
          company_id: companyId,
          boat_id: boatId,
          document_type: 'survey',
          document_name: `${boat.name} - Survey Report 2024`,
          document_url: `https://storage.happysail.es/docs/${boat.name.replace(/\s+/g, '_')}/survey.pdf`,
          upload_date: dateStr(-180),
          expiry_date: dateStr(730),
        }])
      }
      console.log(`   Documents for ${boat.name}: created`)
    }

    // Step 16: Update boats with fleet fields
    console.log('✅ Step 16: Finalizing boat records...')
    for (const boat of DEMO_BOATS) {
      const boatId = boatMap[boat.name]
      await supabase
        .from('boats')
        .update({
          model: boat.model,
          year: boat.year,
          length_meters: boat.lengthMeters,
          home_port: boat.homePort,
          current_value: boat.currentValue,
          purchase_date: boat.purchaseDate,
          insurance_policy_number: boat.insurancePolicyNumber,
          insurance_expiry: boat.insuranceExpiry,
          serial_number: boat.serialNumber,
          mmsi: boat.mmsi,
          current_engine_hours: boat.currentEngineHours,
          engine_hours_alert_threshold: boat.engineHoursAlertThreshold,
        })
        .eq('id', boatId)
      console.log(`   Updated fleet fields for: ${boat.name}`)
    }

    console.log('✅ Seed completed successfully!')
    console.log(`Summary:`)
    console.log(`  - Company: ${COMPANY.name}`)
    console.log(`  - Boats: ${DEMO_BOATS.length}`)
    console.log(`  - Users: ${Object.keys(userMap).length}`)
    console.log(`  - Bookings: ~${bookingCount}`)
    console.log(`  - Payment transactions: ~${Math.round(bookingCount * 0.6)}`)
    console.log(`  - Fuel logs: ~${DEMO_BOATS.length * 10}`)
    console.log(`  - Maintenance logs: ~${DEMO_BOATS.length * 2.5}`)
    console.log(`  - Fleet expenses: ~${DEMO_BOATS.length * 12}`)
    console.log(`  - Safety equipment items: ~${DEMO_BOATS.length * 5}`)
    console.log(`  - Fleet documents: ~${DEMO_BOATS.length * 3.5}`)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

main().catch(console.error)

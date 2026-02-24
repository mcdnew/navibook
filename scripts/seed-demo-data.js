const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Fixed reference date for reproducible demo data
const TODAY = new Date('2026-02-24')
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

// ─────────────────────────────────────────────
// COMPANY CONFIG
// ─────────────────────────────────────────────
const COMPANY = {
  name: 'Happy Sail Estepona',
  address: 'Puerto Deportivo de Estepona, Paseo Marítimo Pedro Manrique, 29680 Estepona, Málaga, Spain',
  phone: '+34 952 800 100',
  email: 'info@happysail.es',
  tax_id: 'ESB29123456',
  // Used for weather widget
  latitude: 36.4240,
  longitude: -5.1473,
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
const DEMO_USERS = [
  {
    email: 'admin@happysail.es',
    firstName: 'Carlos',
    lastName: 'Moreno',
    role: 'admin',
    phone: '+34 600 100 001',
    commissionPct: 0,
    hourlyRate: 0,
  },
  {
    email: 'ops@happysail.es',
    firstName: 'Ana',
    lastName: 'García',
    role: 'operations_manager',
    phone: '+34 600 100 002',
    commissionPct: 0,
    hourlyRate: 0,
  },
  {
    email: 'agent.marco@happysail.es',
    firstName: 'Marco',
    lastName: 'Rodríguez',
    role: 'sales_agent',
    phone: '+34 600 100 003',
    commissionPct: 15,
    hourlyRate: 0,
  },
  {
    email: 'agent.laura@happysail.es',
    firstName: 'Laura',
    lastName: 'Sánchez',
    role: 'sales_agent',
    phone: '+34 600 100 004',
    commissionPct: 12,
    hourlyRate: 0,
  },
  {
    email: 'captain.javier@happysail.es',
    firstName: 'Javier',
    lastName: 'Ruiz',
    role: 'captain',
    phone: '+34 600 100 005',
    commissionPct: 0,
    // Per-day arrangement: fee is fixed €120/booking regardless of duration
    // hourly_rate=0 indicates flat/day rate; captain_fee set manually per booking
    hourlyRate: 0,
  },
  {
    email: 'captain.diego@happysail.es',
    firstName: 'Diego',
    lastName: 'Santos',
    role: 'captain',
    phone: '+34 600 100 006',
    commissionPct: 0,
    hourlyRate: 25, // €25/hour
  },
  {
    email: 'sailor.miguel@happysail.es',
    firstName: 'Miguel',
    lastName: 'Torres',
    role: 'sailor',
    phone: '+34 600 100 007',
    commissionPct: 0,
    hourlyRate: 15, // €15/hour
  },
]

// ─────────────────────────────────────────────
// BOATS
// ─────────────────────────────────────────────
const DEMO_BOATS = [
  {
    name: 'Rayo del Sol',
    type: 'motorboat', // RIB
    capacity: 6,
    license: 'ES-MA-2024-101',
    description: 'Powerful RIB speedboat perfect for coastal exploration and water sports. Thrilling rides along the Costa del Sol with stunning views of Gibraltar and Morocco.',
    defaultCaptainEmail: null, // Optional captain
    fuelConsumption: 45,  // L/h
    fuelPrice: 1.80,       // €/L
  },
  {
    name: 'Brisa del Sur',
    type: 'sailboat',
    capacity: 8,
    license: 'ES-MA-2024-102',
    description: 'Elegant sailing yacht ideal for relaxed day trips along the Costa del Sol. Experience the magic of sailing with Mediterranean breezes and stunning mountain backdrops.',
    defaultCaptainEmail: 'captain.javier@happysail.es',
    fuelConsumption: 4,   // L/h (engine assist)
    fuelPrice: 1.80,
  },
  {
    name: 'Bahía de Oro',
    type: 'motorboat', // Motor Yacht
    capacity: 10,
    license: 'ES-MA-2024-103',
    description: 'Luxury motor yacht with spacious sun deck, cabin, full bathroom, and professional galley. Perfect for corporate events, celebrations, and VIP experiences on the Costa del Sol.',
    defaultCaptainEmail: 'captain.diego@happysail.es',
    fuelConsumption: 55,  // L/h
    fuelPrice: 1.80,
  },
]

// ─────────────────────────────────────────────
// PRICING MATRIX (per boat × duration × package)
// ─────────────────────────────────────────────
const PRICING = {
  'Rayo del Sol': {
    '2h': { charter_only: 220, charter_drinks: 260, charter_food: 285, charter_full: 325 },
    '3h': { charter_only: 300, charter_drinks: 355, charter_food: 390, charter_full: 445 },
    '4h': { charter_only: 380, charter_drinks: 450, charter_food: 495, charter_full: 565 },
    '8h': { charter_only: 680, charter_drinks: 805, charter_food: 885, charter_full: 1010 },
  },
  'Brisa del Sur': {
    '2h': { charter_only: 190, charter_drinks: 225, charter_food: 250, charter_full: 285 },
    '3h': { charter_only: 260, charter_drinks: 308, charter_food: 342, charter_full: 390 },
    '4h': { charter_only: 330, charter_drinks: 391, charter_food: 434, charter_full: 495 },
    '8h': { charter_only: 590, charter_drinks: 699, charter_food: 777, charter_full: 887 },
  },
  'Bahía de Oro': {
    '2h': { charter_only: 320, charter_drinks: 380, charter_food: 420, charter_full: 480 },
    '3h': { charter_only: 440, charter_drinks: 522, charter_food: 578, charter_full: 660 },
    '4h': { charter_only: 560, charter_drinks: 664, charter_food: 736, charter_full: 840 },
    '8h': { charter_only: 1000, charter_drinks: 1186, charter_food: 1314, charter_full: 1500 },
  },
}

// ─────────────────────────────────────────────
// BOOKINGS (55 total, hardcoded for demo consistency)
// daysOffset: negative = past, positive = future
// captain: 'javier' | 'diego' | null
// sailors: ['miguel'] or []
// ─────────────────────────────────────────────
const BOOKINGS = [
  // ── NOVEMBER 2025 ──────────────────────────────────────────────────────────
  {
    daysOffset: -91, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001 001',
    pax: 8, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
    notes: 'VIP client - champagne on arrival requested',
  },
  {
    daysOffset: -89, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001 002',
    pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00',
    status: 'completed', deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -87, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001 003',
    pax: 10, package: 'charter_full', dur: '8h', time: '09:00',
    status: 'completed', deposit: 400, depositPaid: true,
    notes: 'Anniversary celebration - group of 10',
  },
  {
    daysOffset: -85, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001 004',
    pax: 6, package: 'charter_only', dur: '4h', time: '10:00',
    status: 'completed', deposit: 100, depositPaid: true,
  },
  // ── DECEMBER 2025 ─────────────────────────────────────────────────────────
  {
    daysOffset: -81, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+44 7700 001005',
    pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00',
    status: 'completed', deposit: 80, depositPaid: true,
  },
  {
    daysOffset: -79, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: 'François Dubois', email: 'f.dubois@orange.fr', phone: '+33 6 10 01 06',
    pax: 8, package: 'charter_food', dur: '4h', time: '10:00',
    status: 'completed', deposit: 200, depositPaid: true,
    notes: 'Corporate team event',
  },
  {
    daysOffset: -77, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001 001',
    pax: 8, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
    notes: 'VIP repeat - prefers afternoon snorkeling spot',
  },
  {
    daysOffset: -75, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es',
    captain: null, sailors: [],
    customer: "Michael O'Brien", email: 'mobrien@gmail.com', phone: '+353 87 001008',
    pax: 5, package: 'charter_drinks', dur: '3h', time: '14:00',
    status: 'cancelled',
    cancellationReason: 'Customer requested cancellation due to severe weather forecast (Levante wind warning)',
    deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -73, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009',
    pax: 6, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 200, depositPaid: true,
  },
  {
    daysOffset: -71, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Carlos González', email: 'carlos.gonzalez@hotmail.es', phone: '+34 610 001010',
    pax: 4, package: 'charter_only', dur: '3h', time: '10:00',
    status: 'completed', deposit: 80, depositPaid: true,
  },
  {
    daysOffset: -70, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Alexandra Romano', email: 'a.romano@gmail.com', phone: '+39 340 001011',
    pax: 5, package: 'charter_drinks', dur: '4h', time: '14:00',
    status: 'cancelled',
    cancellationReason: null,
    deposit: 0, depositPaid: false,
  },
  {
    daysOffset: -66, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012',
    pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00',
    status: 'completed', deposit: 120, depositPaid: true,
  },
  {
    daysOffset: -63, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013',
    pax: 10, package: 'charter_full', dur: '8h', time: '09:00',
    status: 'completed', deposit: 500, depositPaid: true,
    notes: 'Christmas corporate party - 10 pax',
  },
  {
    daysOffset: -60, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014',
    pax: 6, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
    notes: 'Christmas holiday trip',
  },
  {
    daysOffset: -57, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Natasha Ivanova', email: 'n.ivanova@mail.ru', phone: '+7 912 001015',
    pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00',
    status: 'no_show',
    deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -55, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Stefan Braun', email: 'stefan.braun@gmail.de', phone: '+49 160 001016',
    pax: 6, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'cancelled',
    cancellationReason: 'Client illness - requested postponement (not rebooked)',
    deposit: 150, depositPaid: true,
  },
  // ── JANUARY 2026 ──────────────────────────────────────────────────────────
  {
    daysOffset: -50, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Liam Thompson', email: 'l.thompson@gmail.com', phone: '+44 7800 001017',
    pax: 8, package: 'charter_food', dur: '4h', time: '10:00',
    status: 'completed', deposit: 200, depositPaid: true,
  },
  {
    daysOffset: -47, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003',
    pax: 8, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
    notes: 'Second visit - brought his wife Giulia',
  },
  {
    daysOffset: -45, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001 001',
    pax: 6, package: 'charter_full', dur: '8h', time: '09:00',
    status: 'completed', deposit: 400, depositPaid: true,
    notes: 'VIP full-day - birthday celebration with friends',
  },
  {
    daysOffset: -41, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es',
    captain: null, sailors: [],
    customer: 'Amelia Foster', email: 'amelia.foster@gmail.com', phone: '+44 7900 001019',
    pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00',
    status: 'completed', deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -38, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Roberto Fernandez', email: 'r.fernandez@gmail.com', phone: '+34 611 001020',
    pax: 6, package: 'charter_only', dur: '4h', time: '10:00',
    status: 'completed', deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -36, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Alice Dupont', email: 'alice.dupont@gmail.fr', phone: '+33 6 20 01 21',
    pax: 4, package: 'charter_only', dur: '3h', time: '10:00',
    status: 'cancelled',
    cancellationReason: 'No response to confirmation - booking auto-cancelled',
    deposit: 0, depositPaid: false,
  },
  {
    daysOffset: -34, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: [],
    customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022',
    pax: 6, package: 'charter_food', dur: '4h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
  },
  {
    daysOffset: -31, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Ingrid Norland', email: 'ingrid.norland@gmail.no', phone: '+47 91 001023',
    pax: 8, package: 'charter_drinks', dur: '4h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
  },
  {
    daysOffset: -27, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Chen Wei', email: 'chen.wei@gmail.com', phone: '+86 138 001024',
    pax: 4, package: 'charter_only', dur: '3h', time: '10:00',
    status: 'completed', deposit: 80, depositPaid: true,
  },
  // ── FEBRUARY 2026 (past) ───────────────────────────────────────────────────
  {
    daysOffset: -22, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014',
    pax: 6, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 200, depositPaid: true,
    notes: 'Second visit - upgraded from sailboat',
  },
  {
    daysOffset: -19, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Maria Kowalski', email: 'm.kowalski@onet.pl', phone: '+48 501 001026',
    pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00',
    status: 'completed', deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -17, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002',
    pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00',
    status: 'completed', deposit: 120, depositPaid: true,
    notes: 'Repeat customer - third visit overall',
  },
  {
    daysOffset: -15, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004',
    pax: 5, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
    notes: 'Stag party - 5 guys',
  },
  {
    daysOffset: -12, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013',
    pax: 8, package: 'charter_food', dur: '4h', time: '10:00',
    status: 'completed', deposit: 200, depositPaid: true,
  },
  {
    daysOffset: -10, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001 001',
    pax: 8, package: 'charter_full', dur: '8h', time: '09:00',
    status: 'completed', deposit: 400, depositPaid: true,
    notes: "Valentine's Day special - VIP upgrade with extra champagne and roses",
  },
  {
    daysOffset: -7, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003',
    pax: 8, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'completed', deposit: 250, depositPaid: true,
    notes: 'Third visit with Giulia - anniversary trip',
  },
  {
    daysOffset: -4, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+44 7700 001005',
    pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00',
    status: 'no_show',
    deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -3, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Roberto Fernandez', email: 'r.fernandez@gmail.com', phone: '+34 611 001020',
    pax: 6, package: 'charter_only', dur: '4h', time: '10:00',
    status: 'completed', deposit: 100, depositPaid: true,
  },
  {
    daysOffset: -2, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012',
    pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00',
    status: 'completed', deposit: 80, depositPaid: true,
  },
  {
    daysOffset: -1, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Liam Thompson', email: 'l.thompson@gmail.com', phone: '+44 7800 001017',
    pax: 6, package: 'charter_food', dur: '3h', time: '10:00',
    status: 'completed', deposit: 150, depositPaid: true,
  },
  // ── FUTURE: FEB 25 – MAR 17 2026 ──────────────────────────────────────────
  {
    daysOffset: 1, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Chen Wei', email: 'chen.wei@gmail.com', phone: '+86 138 001024',
    pax: 6, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 150, depositPaid: true,
  },
  {
    daysOffset: 2, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'François Dubois', email: 'f.dubois@orange.fr', phone: '+33 6 10 01 06',
    pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00',
    status: 'confirmed', deposit: 100, depositPaid: true,
  },
  {
    daysOffset: 3, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Amelia Foster', email: 'amelia.foster@gmail.com', phone: '+44 7900 001019',
    pax: 8, package: 'charter_food', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 200, depositPaid: true,
  },
  {
    daysOffset: 5, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: ['miguel'],
    customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022',
    pax: 8, package: 'charter_full', dur: '8h', time: '09:00',
    status: 'confirmed', deposit: 400, depositPaid: true,
    notes: 'Full-day sailing adventure - group of 8',
  },
  {
    daysOffset: 6, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Maria Kowalski', email: 'm.kowalski@onet.pl', phone: '+48 501 001026',
    pax: 3, package: 'charter_only', dur: '2h', time: '14:00',
    status: 'confirmed', deposit: 0, depositPaid: false,
  },
  {
    daysOffset: 8, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Ingrid Norland', email: 'ingrid.norland@gmail.no', phone: '+47 91 001023',
    pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 150, depositPaid: false,
  },
  {
    daysOffset: 9, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Alexandra Romano', email: 'a.romano@gmail.com', phone: '+39 340 001011',
    pax: 6, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 150, depositPaid: true,
  },
  {
    daysOffset: 10, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es',
    captain: null, sailors: [],
    customer: 'Beatriz Herrera', email: 'b.herrera@gmail.com', phone: '+34 612 001044',
    pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00',
    status: 'confirmed', deposit: 0, depositPaid: false,
  },
  {
    daysOffset: 11, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009',
    pax: 8, package: 'charter_food', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 200, depositPaid: true,
  },
  {
    daysOffset: 12, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Carlos González', email: 'carlos.gonzalez@hotmail.es', phone: '+34 610 001010',
    pax: 6, package: 'charter_only', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 100, depositPaid: false,
  },
  {
    daysOffset: 13, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Daniel Price', email: 'daniel.price@gmail.com', phone: '+44 7711 001046',
    pax: 5, package: 'charter_drinks', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 120, depositPaid: true,
  },
  {
    daysOffset: 14, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: "Michael O'Brien", email: 'mobrien@gmail.com', phone: '+353 87 001008',
    pax: 10, package: 'charter_full', dur: '8h', time: '09:00',
    status: 'confirmed', deposit: 500, depositPaid: true,
    notes: 'Corporate team building day - 10 pax',
  },
  {
    daysOffset: 15, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Tom & Rachel Williams', email: 'williams.tom@gmail.com', phone: '+44 7800 001048',
    pax: 4, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 150, depositPaid: true,
    notes: 'Honeymoon trip',
  },
  {
    daysOffset: 16, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es',
    captain: null, sailors: [],
    customer: 'Natasha Ivanova', email: 'n.ivanova@mail.ru', phone: '+7 912 001015',
    pax: 3, package: 'charter_drinks', dur: '3h', time: '14:00',
    status: 'confirmed', deposit: 100, depositPaid: true,
  },
  {
    daysOffset: 17, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es',
    captain: 'diego', sailors: [],
    customer: 'Stefan Braun', email: 'stefan.braun@gmail.de', phone: '+49 160 001016',
    pax: 6, package: 'charter_food', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 0, depositPaid: false,
    notes: 'Rescheduled from December - client returning',
  },
  {
    daysOffset: 18, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002',
    pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 120, depositPaid: true,
  },
  {
    daysOffset: 19, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es',
    captain: null, sailors: [],
    customer: 'Alice Dupont', email: 'alice.dupont@gmail.fr', phone: '+33 6 20 01 21',
    pax: 3, package: 'charter_only', dur: '2h', time: '14:00',
    status: 'pending_hold', deposit: 0, depositPaid: false,
    notes: 'Hold expires if deposit not received in 15 min',
  },
  {
    daysOffset: 20, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es',
    captain: 'diego', sailors: ['miguel'],
    customer: 'Omar Hassan', email: 'omar.hassan@gmail.com', phone: '+971 50 001054',
    pax: 8, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 250, depositPaid: true,
  },
  {
    daysOffset: 21, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es',
    captain: 'javier', sailors: [],
    customer: 'Emma Barnes', email: 'emma.barnes@gmail.com', phone: '+44 7833 001055',
    pax: 6, package: 'charter_full', dur: '4h', time: '10:00',
    status: 'confirmed', deposit: 150, depositPaid: true,
  },
]

// ─────────────────────────────────────────────
// MAIN SEEDER
// ─────────────────────────────────────────────
async function seedDatabase() {
  console.log('🎯 NaviBook Demo Data Seeder — Happy Sail Estepona')
  console.log('===================================================\n')

  try {
    // Step 1: Find preserved admin
    console.log('1️⃣  Finding preserved admin...')
    const { data: preservedAdmin } = await supabase
      .from('users')
      .select('id, email, company_id')
      .eq('email', PRESERVED_ADMIN_EMAIL)
      .single()

    if (!preservedAdmin) {
      throw new Error(`Admin user ${PRESERVED_ADMIN_EMAIL} not found!`)
    }
    console.log(`   ✓ Preserved admin: ${preservedAdmin.email}`)
    const companyId = preservedAdmin.company_id

    // Step 2: List all non-preserved auth users to delete
    console.log('\n2️⃣  Deleting old demo auth users...')
    const { data: { users: allAuthUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const toDelete = allAuthUsers.filter(u => u.email !== PRESERVED_ADMIN_EMAIL)
    for (const u of toDelete) {
      await supabase.auth.admin.deleteUser(u.id)
    }
    console.log(`   ✓ Deleted ${toDelete.length} old auth users`)

    // Step 3: Clear all data tables using TRUNCATE via psql (avoids trigger conflicts on bookings)
    console.log('\n3️⃣  Clearing data tables...')
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) throw new Error('DATABASE_URL not set in .env.local')

    const sqlClear = [
      "SET session_replication_role = 'replica';",
      'TRUNCATE TABLE captain_fees, booking_sailors, payment_transactions,',
      '  booking_history, customer_change_requests, customer_notes,',
      '  waitlist, blocked_slots, bookings,',
      '  boat_fuel_config, pricing, boats,',
      '  company_package_config CASCADE;',
    ].join('\n')

    try {
      execSync(`psql "${dbUrl}"`, { input: sqlClear, stdio: ['pipe', 'pipe', 'pipe'] })
      console.log('   ✓ All tables cleared')
    } catch (e) {
      throw new Error(`psql cleanup failed: ${e.stderr?.toString() || e.message}`)
    }

    // Delete non-admin users via JS client
    await supabase.from('users').delete().neq('id', preservedAdmin.id)
    console.log('   ✓ Cleared users (except admin)')

    // Step 4: Update company
    console.log('\n4️⃣  Updating company...')
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .update({
        name: COMPANY.name,
        address: COMPANY.address,
        phone: COMPANY.phone,
        email: COMPANY.email,
        tax_id: COMPANY.tax_id,
      })
      .eq('id', companyId)
      .select()
      .single()

    if (companyError) throw companyError
    console.log(`   ✓ Company updated: ${company.name}`)

    // Step 5: Create demo auth users + user records
    console.log('\n5️⃣  Creating demo users...')
    const users = {}

    for (const u of DEMO_USERS) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { first_name: u.firstName, last_name: u.lastName },
      })
      if (authError) throw new Error(`Auth create failed for ${u.email}: ${authError.message}`)

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          company_id: companyId,
          email: u.email,
          first_name: u.firstName,
          last_name: u.lastName,
          role: u.role,
          phone: u.phone,
          commission_percentage: u.commissionPct,
          hourly_rate: u.hourlyRate,
          is_active: true,
        })
        .select()
        .single()

      if (userError) throw new Error(`User record failed for ${u.email}: ${userError.message}`)

      users[u.email] = userRecord
      console.log(`   ✓ ${u.firstName} ${u.lastName} (${u.role})`)
    }

    // Step 6: Create boats
    console.log('\n6️⃣  Creating boats...')
    const boats = {}

    for (const b of DEMO_BOATS) {
      const defaultCaptainId = b.defaultCaptainEmail ? users[b.defaultCaptainEmail]?.id : null

      const { data: boat, error: boatError } = await supabase
        .from('boats')
        .insert({
          company_id: companyId,
          name: b.name,
          boat_type: b.type,
          capacity: b.capacity,
          license_number: b.license,
          description: b.description,
          default_captain_id: defaultCaptainId,
          is_active: true,
        })
        .select()
        .single()

      if (boatError) throw new Error(`Boat create failed for ${b.name}: ${boatError.message}`)
      boats[b.name] = boat
      console.log(`   ✓ ${b.name} (${b.type}, ${b.capacity} pax)`)
    }

    // Step 7: Create fuel config
    console.log('\n7️⃣  Creating fuel configs...')
    for (const b of DEMO_BOATS) {
      const { error } = await supabase
        .from('boat_fuel_config')
        .insert({
          boat_id: boats[b.name].id,
          fuel_consumption_rate: b.fuelConsumption,
          fuel_price_per_liter: b.fuelPrice,
          notes: `${b.name}: ${b.fuelConsumption}L/h at €${b.fuelPrice}/L`,
        })
      if (error) throw new Error(`Fuel config failed for ${b.name}: ${error.message}`)
      console.log(`   ✓ ${b.name}: ${b.fuelConsumption}L/h × €${b.fuelPrice}/L`)
    }

    // Step 8: Company package config
    console.log('\n8️⃣  Creating package config...')
    const { error: pkgError } = await supabase
      .from('company_package_config')
      .insert({
        company_id: companyId,
        drinks_cost_per_person: 12.00,  // Soft drinks, water, beer, sangria
        food_cost_per_person: 22.00,    // Tapas, bocadillos, catering platters
      })
    if (pkgError) throw new Error(`Package config failed: ${pkgError.message}`)
    console.log('   ✓ Drinks: €12/person, Food/Catering: €22/person')

    // Step 9: Create pricing
    console.log('\n9️⃣  Creating pricing matrix...')
    let pricingCount = 0
    for (const [boatName, durations] of Object.entries(PRICING)) {
      for (const [duration, packages] of Object.entries(durations)) {
        for (const [pkgType, price] of Object.entries(packages)) {
          const { error } = await supabase
            .from('pricing')
            .insert({
              boat_id: boats[boatName].id,
              duration,
              package_type: pkgType,
              price,
            })
          if (error) throw new Error(`Pricing failed ${boatName}/${duration}/${pkgType}: ${error.message}`)
          pricingCount++
        }
      }
    }
    console.log(`   ✓ ${pricingCount} pricing entries created`)

    // Step 10: Create bookings
    console.log('\n🔟  Creating bookings...')
    const createdBookings = []
    const javier = users['captain.javier@happysail.es']
    const diego = users['captain.diego@happysail.es']
    const miguel = users['sailor.miguel@happysail.es']

    for (const bk of BOOKINGS) {
      const boat = boats[bk.boat]
      const agent = users[bk.agent]
      const captain = bk.captain === 'javier' ? javier : bk.captain === 'diego' ? diego : null
      const hours = durationHours(bk.dur)

      // Captain fee calculation
      let captainFee = 0
      if (captain) {
        if (captain.id === javier.id) {
          captainFee = 120 // Flat per-booking day rate
        } else if (captain.id === diego.id) {
          captainFee = diego.hourly_rate * hours // €25 × hours
        }
      }

      // Sailor fee (sum if multiple sailors)
      const sailorFee = bk.sailors.includes('miguel') ? (miguel.hourly_rate * hours) : 0

      // Fuel cost
      const boatConfig = DEMO_BOATS.find(b => b.name === bk.boat)
      const fuelCost = boatConfig ? boatConfig.fuelConsumption * boatConfig.fuelPrice * hours : 0

      // Package addon cost (drinks/food cost for charter operator)
      let packageAddonCost = 0
      if (bk.package === 'charter_drinks') packageAddonCost = 12 * bk.pax
      else if (bk.package === 'charter_food') packageAddonCost = 22 * bk.pax
      else if (bk.package === 'charter_full') packageAddonCost = (12 + 22) * bk.pax

      const price = PRICING[bk.boat][bk.dur][bk.package]
      const startTime = bk.time
      const endTime = addHours(startTime, hours)
      const bookingDate = dateStr(bk.daysOffset)

      // Hold until for pending bookings
      const holdUntil = bk.status === 'pending_hold'
        ? new Date(Date.now() + 12 * 60 * 1000).toISOString()  // 12 min from now
        : null

      const completedAt = bk.status === 'completed' ? new Date(TODAY.getTime() + (bk.daysOffset + 1) * 86400000).toISOString() : null
      const cancelledAt = bk.status === 'cancelled' ? new Date(TODAY.getTime() + (bk.daysOffset - 2) * 86400000).toISOString() : null

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          company_id: companyId,
          boat_id: boat.id,
          agent_id: agent.id,
          captain_id: captain?.id || null,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration: bk.dur,
          customer_name: bk.customer,
          customer_email: bk.email,
          customer_phone: bk.phone,
          passengers: bk.pax,
          package_type: bk.package,
          total_price: price,
          deposit_amount: bk.deposit || 0,
          deposit_paid: bk.depositPaid || false,
          captain_fee: captainFee,
          sailor_fee: sailorFee,
          fuel_cost: Math.round(fuelCost * 100) / 100,
          package_addon_cost: packageAddonCost,
          status: bk.status,
          notes: bk.notes || null,
          cancellation_reason: bk.cancellationReason || null,
          hold_until: holdUntil,
          completed_at: completedAt,
          cancelled_at: cancelledAt,
          source: 'direct',
          booking_category: 'commercial',
        })
        .select()
        .single()

      if (bookingError) {
        console.warn(`   ⚠️  Booking failed ${bk.customer} (${bookingDate}): ${bookingError.message}`)
        continue
      }

      createdBookings.push({ ...booking, _bk: bk })
      process.stdout.write('.')
    }
    console.log(`\n   ✓ ${createdBookings.length} bookings created`)

    // Step 11: Create booking_sailors
    console.log('\n1️⃣1️⃣  Creating sailor assignments...')
    let sailorAssignments = 0
    for (const booking of createdBookings) {
      if (booking._bk.sailors.includes('miguel')) {
        const hours = durationHours(booking._bk.dur)
        const fee = miguel.hourly_rate * hours
        const { error } = await supabase
          .from('booking_sailors')
          .insert({
            booking_id: booking.id,
            sailor_id: miguel.id,
            hourly_rate: miguel.hourly_rate,
            fee,
          })
        if (error) console.warn(`   ⚠️  Sailor assignment failed: ${error.message}`)
        else sailorAssignments++
      }
    }
    console.log(`   ✓ ${sailorAssignments} sailor assignments created`)

    // Step 12: Create payment_transactions for paid bookings
    console.log('\n1️⃣2️⃣  Creating payment transactions...')
    const paymentMethods = ['card', 'card', 'card', 'cash', 'bank_transfer']
    let paymentCount = 0

    for (const booking of createdBookings) {
      const bk = booking._bk
      if (!bk.depositPaid && booking.status !== 'completed') continue

      // Deposit payment
      if (bk.deposit > 0 && bk.depositPaid) {
        const method = paymentMethods[Math.floor(Math.abs(bk.daysOffset) % paymentMethods.length)]
        const { error } = await supabase
          .from('payment_transactions')
          .insert({
            company_id: companyId,
            booking_id: booking.id,
            amount: bk.deposit,
            payment_type: bk.deposit >= booking.total_price ? 'full_payment' : 'deposit',
            payment_method: method,
            payment_date: dateStr(bk.daysOffset - 2),
            notes: 'Deposit received',
          })
        if (!error) paymentCount++
      }

      // Balance payment for completed bookings
      if (booking.status === 'completed' && bk.deposit < booking.total_price) {
        const balance = booking.total_price - bk.deposit
        const method = paymentMethods[Math.floor((Math.abs(bk.daysOffset) + 2) % paymentMethods.length)]
        const { error } = await supabase
          .from('payment_transactions')
          .insert({
            company_id: companyId,
            booking_id: booking.id,
            amount: balance,
            payment_type: 'final_payment',
            payment_method: method,
            payment_date: dateStr(bk.daysOffset),
            notes: 'Balance paid on day',
          })
        if (!error) paymentCount++
      }
    }
    console.log(`   ✓ ${paymentCount} payment transactions created`)

    // Step 13: Create customer notes for VIP/repeat customers
    console.log('\n1️⃣3️⃣  Creating customer notes...')
    const customerNotes = [
      {
        email: 'elena.vasquez@gmail.com',
        notes: 'VIP client — 4 bookings, always requests champagne on arrival. Very loyal, brings referrals. Prefers Brisa del Sur (sailboat). Excellent tipper.',
        preferences: 'Champagne welcome, afternoon snorkeling, Brisa del Sur preferred. Celebrates birthdays and Valentine\'s Day on the water.',
      },
      {
        email: 'marco.bianchi@gmail.com',
        notes: 'Repeat client from Milan — 3 bookings with wife Giulia. Always books Bahía de Oro for comfort. Books in advance.',
        preferences: 'Motor yacht preferred, full catering package, group of 8-10. Anniversaries and special occasions.',
      },
      {
        email: 'james.mitchell@outlook.com',
        notes: 'Repeat client from London — 2 bookings. First visit sailboat, second motor yacht. Easy-going customer.',
        preferences: 'Flexible on boat type, prefers full package. Holiday visitor (Christmas and Feb).',
      },
      {
        email: 'sophie.andersen@gmail.com',
        notes: 'Repeat client from Denmark — 3 bookings. Always books Brisa del Sur, enjoys sailing.',
        preferences: 'Sailing only, drinks package, afternoon trips preferred.',
      },
    ]

    for (const note of customerNotes) {
      const { error } = await supabase
        .from('customer_notes')
        .insert({
          company_id: companyId,
          customer_email: note.email,
          notes: note.notes,
          preferences: note.preferences,
        })
      if (error) console.warn(`   ⚠️  Notes failed for ${note.email}: ${error.message}`)
      else console.log(`   ✓ Notes: ${note.email}`)
    }

    // Step 14: Create waitlist entries
    console.log('\n1️⃣4️⃣  Creating waitlist entries...')
    const waitlistEntries = [
      {
        customer_name: 'Oliver Schmidt',
        customer_email: 'o.schmidt@gmail.de',
        customer_phone: '+49 162 001056',
        preferred_date: dateStr(25),
        boat_id: boats['Bahía de Oro'].id,
        passengers: 10,
        status: 'active',
        notes: 'Looking for full-day charter on Bahía de Oro for corporate event. Very interested, waiting for availability.',
      },
      {
        customer_name: 'Camille Moreau',
        customer_email: 'c.moreau@gmail.fr',
        customer_phone: '+33 6 30 01 57',
        preferred_date: dateStr(12),
        boat_id: boats['Brisa del Sur'].id,
        passengers: 6,
        status: 'contacted',
        notes: 'Interested in 4h sailing trip for a bachelorette party. Contacted via WhatsApp — awaiting response.',
      },
    ]

    for (const wl of waitlistEntries) {
      const { error } = await supabase
        .from('waitlist')
        .insert({ company_id: companyId, ...wl })
      if (error) console.warn(`   ⚠️  Waitlist failed: ${error.message}`)
      else console.log(`   ✓ Waitlist: ${wl.customer_name}`)
    }

    // Step 15: Create blocked slot (Rayo del Sol maintenance)
    console.log('\n1️⃣5️⃣  Creating blocked slot...')
    const maintenanceDate = dateStr(23) // ~3 weeks out
    const { error: blockError } = await supabase
      .from('blocked_slots')
      .insert({
        company_id: companyId,
        boat_id: boats['Rayo del Sol'].id,
        blocked_date: maintenanceDate,
        start_date: maintenanceDate,
        end_date: maintenanceDate,
        start_time: '08:00',
        end_time: '20:00',
        reason: 'Annual engine service + hull inspection. Rayo del Sol unavailable all day. Booked with Estepona Marina workshop.',
        block_type: 'maintenance',
      })
    if (blockError) console.warn(`   ⚠️  Blocked slot failed: ${blockError.message}`)
    else console.log(`   ✓ Blocked slot: Rayo del Sol maintenance on ${maintenanceDate}`)

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(55))
    console.log('✅  DATABASE SEEDED SUCCESSFULLY!')
    console.log('='.repeat(55))
    console.log('\n📊 Summary:')
    console.log(`   Company:      ${COMPANY.name}`)
    console.log(`   Users:        ${DEMO_USERS.length} demo + 1 preserved admin`)
    console.log(`   Boats:        ${DEMO_BOATS.length} (RIB, Sailboat, Motor Yacht)`)
    console.log(`   Pricing:      ${pricingCount} entries (3 boats × 4 durations × 4 packages)`)
    console.log(`   Bookings:     ${createdBookings.length}`)
    console.log(`   Payments:     ${paymentCount} transactions`)
    console.log(`   Waitlist:     2 entries`)
    console.log(`   Blocked:      1 slot (Rayo del Sol maintenance)`)
    console.log('\n🔐 Demo Credentials (password: Demo1234!):')
    console.log('   admin@navibook.com         (super admin - preserved)')
    for (const u of DEMO_USERS) {
      console.log(`   ${u.email.padEnd(36)} (${u.role})`)
    }
    console.log('\n💰 Cost Analysis Per Charter:')
    console.log('   Captain Javier (Brisa del Sur): €120 flat/booking (day rate)')
    console.log('   Captain Diego  (Bahía de Oro):  €25/h × duration')
    console.log('   Sailor Miguel:                   €15/h × duration')
    console.log('   Fuel Rayo del Sol (RIB):         45L/h × €1.80 = €81/h')
    console.log('   Fuel Brisa del Sur (Sail):        4L/h × €1.80 = €7.20/h')
    console.log('   Fuel Bahía de Oro (Motor):       55L/h × €1.80 = €99/h')
    console.log('   Drinks package:                  €12/person')
    console.log('   Food/Catering package:           €22/person')
    console.log('\n✨ Ready for demos and testing!')

  } catch (err) {
    console.error('\n❌ Error seeding database:', err.message)
    console.error(err)
    process.exit(1)
  }
}

seedDatabase()

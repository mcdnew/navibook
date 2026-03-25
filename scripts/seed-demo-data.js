const { createClient } = require('@supabase/supabase-js')
const { execSync } = require('child_process')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Dynamic reference date — always looks current
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
  { email: 'agent.marco@happysail.es', firstName: 'Marco', lastName: 'Rodríguez', role: 'sales_agent', phone: '+34 600 100 003', commissionPct: 15, hourlyRate: 0 },
  { email: 'agent.laura@happysail.es', firstName: 'Laura', lastName: 'Sánchez', role: 'sales_agent', phone: '+34 600 100 004', commissionPct: 12, hourlyRate: 0 },
  { email: 'captain.javier@happysail.es', firstName: 'Javier', lastName: 'Ruiz', role: 'captain', phone: '+34 600 100 005', commissionPct: 0, hourlyRate: 0 },
  { email: 'captain.diego@happysail.es', firstName: 'Diego', lastName: 'Santos', role: 'captain', phone: '+34 600 100 006', commissionPct: 0, hourlyRate: 25 },
  { email: 'sailor.miguel@happysail.es', firstName: 'Miguel', lastName: 'Torres', role: 'sailor', phone: '+34 600 100 007', commissionPct: 0, hourlyRate: 15 },
]

// ─────────────────────────────────────────────
// BOATS
// ─────────────────────────────────────────────
const DEMO_BOATS = [
  {
    name: 'Rayo del Sol',
    type: 'motorboat',
    capacity: 6,
    license: 'ES-MA-2024-101',
    description: 'Powerful RIB speedboat perfect for coastal exploration and water sports. Thrilling rides along the Costa del Sol with stunning views of Gibraltar and Morocco.',
    defaultCaptainEmail: null,
    fuelConsumption: 45,
    fuelPrice: 1.80,
  },
  {
    name: 'Brisa del Sur',
    type: 'sailboat',
    capacity: 8,
    license: 'ES-MA-2024-102',
    description: 'Elegant sailing yacht ideal for relaxed day trips along the Costa del Sol. Experience the magic of sailing with Mediterranean breezes and stunning mountain backdrops.',
    defaultCaptainEmail: 'captain.javier@happysail.es',
    fuelConsumption: 4,
    fuelPrice: 1.80,
  },
  {
    name: 'Bahía de Oro',
    type: 'motorboat',
    capacity: 10,
    license: 'ES-MA-2024-103',
    description: 'Luxury motor yacht with spacious sun deck, cabin, full bathroom, and professional galley. Perfect for corporate events, celebrations, and VIP experiences on the Costa del Sol.',
    defaultCaptainEmail: 'captain.diego@happysail.es',
    fuelConsumption: 55,
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
// BOOKINGS (~121 total, dynamic dates from today)
// daysOffset: negative = past, positive = future
// captain: 'javier' | 'diego' | null
// sailors: ['miguel'] or []
// ─────────────────────────────────────────────
const BOOKINGS = [
  // ── DECEMBER 2025 (~days -91 to -76) ──────────────────────────────────────
  { daysOffset: -91, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'completed', deposit: 500, depositPaid: true, notes: 'Christmas corporate party — 10 pax, full catering + drinks' },
  { daysOffset: -90, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Christmas gift trip — VIP champagne welcome' },
  { daysOffset: -89, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -88, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 8, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true },
  { daysOffset: -87, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true },
  { daysOffset: -86, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+44 7700 001005', pax: 3, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -85, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'completed', deposit: 500, depositPaid: true, notes: "New Year's Eve corporate celebration — milestone event" },
  { daysOffset: -84, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Marco & Giulia — family trip post-holidays' },
  { daysOffset: -83, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012', pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -82, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Liam Thompson', email: 'l.thompson@gmail.com', phone: '+44 7800 001017', pax: 6, package: 'charter_food', dur: '3h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true },
  { daysOffset: -81, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Carlos González', email: 'carlos.gonzalez@hotmail.es', phone: '+34 610 001010', pax: 4, package: 'charter_only', dur: '4h', time: '10:00', status: 'cancelled', cancellationReason: 'Levante wind warning — 35 knot forecast, safety concern', deposit: 100, depositPaid: true },
  { daysOffset: -80, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Maria Kowalski', email: 'm.kowalski@onet.pl', phone: '+48 501 001026', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'completed', deposit: 80, depositPaid: true },
  { daysOffset: -79, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Omar Hassan', email: 'omar.hassan@gmail.com', phone: '+971 50 001054', pax: 8, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true },
  { daysOffset: -78, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Valentina Cruz', email: 'v.cruz@gmail.com', phone: '+34 611 002001', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true, notes: 'First booking — came via Instagram referral' },
  { daysOffset: -77, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022', pax: 5, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true },
  { daysOffset: -76, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'François Dubois', email: 'f.dubois@orange.fr', phone: '+33 6 10 01 06', pax: 6, package: 'charter_food', dur: '3h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true },

  // ── JANUARY 2026 (~days -70 to -53) ───────────────────────────────────────
  { daysOffset: -70, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true, notes: 'Second visit — switched to sailing this time' },
  { daysOffset: -69, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Beatriz Herrera', email: 'b.herrera@gmail.com', phone: '+34 612 001044', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -68, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'VIP — third visit, upgraded to motor yacht' },
  { daysOffset: -67, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true },
  { daysOffset: -65, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Alexander Petrov', email: 'a.petrov@mail.ru', phone: '+7 916 002002', pax: 4, package: 'charter_only', dur: '4h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true, notes: 'First booking — business traveller from Moscow' },
  { daysOffset: -64, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Marco & Giulia — second visit, anniversary celebration' },
  { daysOffset: -63, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true },
  { daysOffset: -62, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Natasha Ivanova', email: 'n.ivanova@mail.ru', phone: '+7 912 001015', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'no_show', deposit: 100, depositPaid: true },
  { daysOffset: -60, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true },
  { daysOffset: -58, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Roberto Fernandez', email: 'r.fernandez@gmail.com', phone: '+34 611 001020', pax: 4, package: 'charter_only', dur: '4h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -57, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Chen Wei', email: 'chen.wei@gmail.com', phone: '+86 138 001024', pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -56, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'cancelled', cancellationReason: 'Client illness — postponed to March', deposit: 150, depositPaid: true },
  { daysOffset: -55, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'VIP — fourth visit, brought two colleagues' },
  { daysOffset: -54, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'completed', deposit: 80, depositPaid: true },
  { daysOffset: -53, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Alexander Petrov', email: 'a.petrov@mail.ru', phone: '+7 916 002002', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true, notes: 'Second visit — upgraded to motor yacht' },

  // ── FEBRUARY 2026 (~days -52 to -26) ──────────────────────────────────────
  { daysOffset: -51, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Liam Thompson', email: 'l.thompson@gmail.com', phone: '+44 7800 001017', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true },
  { daysOffset: -50, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Carlos González', email: 'carlos.gonzalez@hotmail.es', phone: '+34 610 001010', pax: 4, package: 'charter_only', dur: '4h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -49, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 8, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Q1 team outing — 8 colleagues from Munich office' },
  { daysOffset: -47, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'François Dubois', email: 'f.dubois@orange.fr', phone: '+33 6 10 01 06', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true },
  { daysOffset: -46, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Valentina Cruz', email: 'v.cruz@gmail.com', phone: '+34 611 002001', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'completed', deposit: 100, depositPaid: true, notes: 'Second visit — brought her sister this time' },
  { daysOffset: -44, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true, notes: 'Third visit — spring trip with family' },
  { daysOffset: -43, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true, notes: 'Third visit — anniversary gift from husband' },
  { daysOffset: -42, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 5, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -40, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Sarah Williams', email: 's.williams@gmail.com', phone: '+44 7700 002003', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'completed', deposit: 500, depositPaid: true, notes: 'Corporate team day — London fintech company. Sarah organised. Excellent feedback.' },
  { daysOffset: -39, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 8, package: 'charter_full', dur: '8h', time: '09:00', status: 'completed', deposit: 400, depositPaid: true, notes: "Valentine's Day special — VIP full day, roses + champagne, sunset cruise" },
  { daysOffset: -38, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Maria Kowalski', email: 'm.kowalski@onet.pl', phone: '+48 501 001026', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'completed', deposit: 80, depositPaid: true },
  { daysOffset: -37, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 250, depositPaid: true, notes: "Marco & Giulia's third visit — Valentine's week" },
  { daysOffset: -35, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Alexander Petrov', email: 'a.petrov@mail.ru', phone: '+7 916 002002', pax: 4, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'cancelled', cancellationReason: 'Business emergency — flight cancelled, unable to make it', deposit: 0, depositPaid: false },
  { daysOffset: -34, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Amelia Foster', email: 'amelia.foster@gmail.com', phone: '+44 7900 001019', pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -33, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true, notes: 'Rescheduled from January (illness) — delighted with the trip' },
  { daysOffset: -31, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true },
  { daysOffset: -30, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Beatriz Herrera', email: 'b.herrera@gmail.com', phone: '+34 612 001044', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'no_show', deposit: 80, depositPaid: true },
  { daysOffset: -29, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 8, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Pre-spring strategy retreat — 8 pax' },
  { daysOffset: -27, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Roberto Fernandez', email: 'r.fernandez@gmail.com', phone: '+34 611 001020', pax: 6, package: 'charter_only', dur: '4h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -26, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Valentina Cruz', email: 'v.cruz@gmail.com', phone: '+34 611 002001', pax: 5, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true, notes: 'Third visit — now a local regular' },

  // ── MARCH 2026 PAST (~days -25 to -1) ─────────────────────────────────────
  { daysOffset: -24, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'VIP — fifth visit, brings different friends each time' },
  { daysOffset: -23, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true, notes: 'Fourth visit — spring holiday, upgraded to full package' },
  { daysOffset: -22, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Alice Dupont', email: 'alice.dupont@gmail.fr', phone: '+33 6 20 01 21', pax: 3, package: 'charter_only', dur: '3h', time: '14:00', status: 'completed', deposit: 80, depositPaid: true },
  { daysOffset: -21, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Sarah Williams', email: 's.williams@gmail.com', phone: '+44 7700 002003', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'completed', deposit: 500, depositPaid: true, notes: 'Second corporate booking — brought different team from Q1' },
  { daysOffset: -20, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: "Marco & Giulia's fourth visit — spring tradition" },
  { daysOffset: -19, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 5, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true, notes: 'Third visit — spring break with kids' },
  { daysOffset: -18, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true, notes: 'Fourth visit — promoted to motor yacht after trying RIB' },
  { daysOffset: -17, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012', pax: 4, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true },
  { daysOffset: -16, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Daniel Price', email: 'daniel.price@gmail.com', phone: '+44 7711 001046', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -15, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Third visit — spring business trip' },
  { daysOffset: -14, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Liam Thompson', email: 'l.thompson@gmail.com', phone: '+44 7800 001017', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'completed', deposit: 120, depositPaid: true },
  { daysOffset: -13, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Valentina Cruz', email: 'v.cruz@gmail.com', phone: '+34 611 002001', pax: 5, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true, notes: 'Third visit in 3 months — becoming a local regular' },
  { daysOffset: -12, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Fourth visit — brought new team members' },
  { daysOffset: -11, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 200, depositPaid: true, notes: 'Corporate outing — 8 pax from Dublin tech firm' },
  { daysOffset: -10, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+44 7700 001005', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'completed', deposit: 80, depositPaid: true },
  { daysOffset: -9, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 8, package: 'charter_full', dur: '8h', time: '09:00', status: 'completed', deposit: 500, depositPaid: true, notes: 'VIP 6th visit — birthday full-day celebration, special decoration requested' },
  { daysOffset: -8, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'François Dubois', email: 'f.dubois@orange.fr', phone: '+33 6 10 01 06', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true, notes: 'Third visit — brought colleagues from Paris' },
  { daysOffset: -7, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Carlos González', email: 'carlos.gonzalez@hotmail.es', phone: '+34 610 001010', pax: 4, package: 'charter_only', dur: '3h', time: '10:00', status: 'completed', deposit: 80, depositPaid: true },
  { daysOffset: -5, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 150, depositPaid: true, notes: 'Fifth visit — decided to try motor yacht' },
  { daysOffset: -4, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Roberto Fernandez', email: 'r.fernandez@gmail.com', phone: '+34 611 001020', pax: 6, package: 'charter_only', dur: '4h', time: '10:00', status: 'completed', deposit: 100, depositPaid: true },
  { daysOffset: -3, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'completed', deposit: 80, depositPaid: true },
  { daysOffset: -2, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'completed', deposit: 250, depositPaid: true, notes: "Marco & Giulia's fifth visit — spring treat" },
  { daysOffset: -1, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 4, package: 'charter_only', dur: '4h', time: '10:00', status: 'no_show', deposit: 100, depositPaid: true, notes: 'No contact — deposit forfeited' },

  // ── UPCOMING: THIS WEEK (days +1 to +7) ───────────────────────────────────
  { daysOffset: 1, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'confirmed', deposit: 100, depositPaid: true },
  { daysOffset: 2, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true, notes: 'VIP — 7th booking, post-birthday celebration with friends' },
  { daysOffset: 3, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 8, package: 'charter_food', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true },
  { daysOffset: 4, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Alice Dupont', email: 'alice.dupont@gmail.fr', phone: '+33 6 20 01 21', pax: 3, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'confirmed', deposit: 100, depositPaid: false },
  { daysOffset: 5, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: ['miguel'], customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022', pax: 8, package: 'charter_full', dur: '8h', time: '09:00', status: 'confirmed', deposit: 400, depositPaid: true, notes: 'Full-day corporate — 8 pax, Dublin company annual retreat' },
  { daysOffset: 6, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: true },
  { daysOffset: 6, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Beatriz Herrera', email: 'b.herrera@gmail.com', phone: '+34 612 001044', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'confirmed', deposit: 80, depositPaid: false },
  { daysOffset: 7, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true, notes: "Marco & Giulia's sixth visit — spring trip" },
  { daysOffset: 7, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Maria Kowalski', email: 'm.kowalski@onet.pl', phone: '+48 501 001026', pax: 3, package: 'charter_only', dur: '2h', time: '14:00', status: 'pending_hold', deposit: 0, depositPaid: false, notes: 'Hold placed — awaiting deposit confirmation' },

  // ── UPCOMING: WEEKS 2–4 (days +8 to +28) ──────────────────────────────────
  { daysOffset: 8, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Liam Thompson', email: 'l.thompson@gmail.com', phone: '+44 7800 001017', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: true },
  { daysOffset: 9, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Carlos González', email: 'carlos.gonzalez@hotmail.es', phone: '+34 610 001010', pax: 4, package: 'charter_only', dur: '4h', time: '10:00', status: 'confirmed', deposit: 100, depositPaid: false },
  { daysOffset: 10, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 4, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'confirmed', deposit: 120, depositPaid: true, notes: 'Fourth visit — Easter break with kids' },
  { daysOffset: 11, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Sarah Williams', email: 's.williams@gmail.com', phone: '+44 7700 002003', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'confirmed', deposit: 500, depositPaid: true, notes: 'Third corporate booking — new team, 10 pax. Sarah is now a key account.' },
  { daysOffset: 12, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'François Dubois', email: 'f.dubois@orange.fr', phone: '+33 6 10 01 06', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'confirmed', deposit: 120, depositPaid: true },
  { daysOffset: 13, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Valentina Cruz', email: 'v.cruz@gmail.com', phone: '+34 611 002001', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'confirmed', deposit: 100, depositPaid: true },
  { daysOffset: 14, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true, notes: 'VIP — 8th booking, bringing a corporate client to impress' },
  { daysOffset: 15, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 4, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'confirmed', deposit: 100, depositPaid: true, notes: 'Rescheduled after yesterday\'s no-show — very apologetic' },
  { daysOffset: 16, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012', pax: 3, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'confirmed', deposit: 100, depositPaid: true },
  { daysOffset: 17, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 8, package: 'charter_food', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true },
  { daysOffset: 18, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: true, notes: 'Marco solo — business trip' },
  { daysOffset: 19, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Priya Patel', email: 'priya.patel@gmail.com', phone: '+44 7700 001005', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'confirmed', deposit: 100, depositPaid: false },
  { daysOffset: 21, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: ['miguel'], customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'confirmed', deposit: 500, depositPaid: true, notes: 'Large group corporate Easter event — 10 pax' },
  { daysOffset: 22, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: true, notes: 'Fourth visit — spring trip' },
  { daysOffset: 23, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Alexander Petrov', email: 'a.petrov@mail.ru', phone: '+7 916 002002', pax: 4, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'confirmed', deposit: 120, depositPaid: true, notes: 'Third visit — rescheduled from February' },
  { daysOffset: 25, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: true },
  { daysOffset: 27, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'confirmed', deposit: 120, depositPaid: true },
  { daysOffset: 28, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Beatriz Herrera', email: 'b.herrera@gmail.com', phone: '+34 612 001044', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'pending_hold', deposit: 0, depositPaid: false },

  // ── APRIL – MAY 2026 (days +29 to +68) ────────────────────────────────────
  { daysOffset: 30, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true, notes: 'VIP — 9th booking confirmed' },
  { daysOffset: 32, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 8, package: 'charter_food', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true },
  { daysOffset: 34, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Valentina Cruz', email: 'v.cruz@gmail.com', phone: '+34 611 002001', pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'confirmed', deposit: 100, depositPaid: false },
  { daysOffset: 35, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Sarah Williams', email: 's.williams@gmail.com', phone: '+44 7700 002003', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'confirmed', deposit: 500, depositPaid: true, notes: 'Fourth corporate booking — April team building. Sarah is a key account.' },
  { daysOffset: 38, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 200, depositPaid: true },
  { daysOffset: 40, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Carlos González', email: 'carlos.gonzalez@hotmail.es', phone: '+34 610 001010', pax: 4, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'confirmed', deposit: 100, depositPaid: false },
  { daysOffset: 42, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: true },
  { daysOffset: 45, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: ['miguel'], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 8, package: 'charter_full', dur: '8h', time: '09:00', status: 'confirmed', deposit: 500, depositPaid: true, notes: 'VIP 10th booking — full-day Brisa del Sur, spring celebration' },
  { daysOffset: 47, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 4, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'pending_hold', deposit: 0, depositPaid: false },
  { daysOffset: 50, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'François Dubois', email: 'f.dubois@orange.fr', phone: '+33 6 10 01 06', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: false },
  { daysOffset: 52, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'confirmed', deposit: 120, depositPaid: true },
  { daysOffset: 55, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Yuki Yamamoto', email: 'yuki.y@gmail.com', phone: '+81 90 001009', pax: 4, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'confirmed', deposit: 120, depositPaid: false },
  { daysOffset: 58, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Sarah Williams', email: 's.williams@gmail.com', phone: '+44 7700 002003', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'confirmed', deposit: 500, depositPaid: true, notes: 'May Day corporate — fifth event with Sarah' },
  { daysOffset: 62, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: "Patrick O'Sullivan", email: 'p.osullivan@gmail.com', phone: '+353 85 001022', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'confirmed', deposit: 150, depositPaid: false },
  { daysOffset: 65, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Isabella Rossi', email: 'i.rossi@gmail.com', phone: '+39 328 001012', pax: 3, package: 'charter_drinks', dur: '2h', time: '14:00', status: 'pending_hold', deposit: 0, depositPaid: false },

  // ── JUNE 2026 (days +69 to +87) ───────────────────────────────────────────
  { daysOffset: 69, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Marco Bianchi', email: 'marco.bianchi@gmail.com', phone: '+39 333 001003', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'pending_hold', deposit: 0, depositPaid: false, notes: "Pre-summer trip — Giulia's birthday" },
  { daysOffset: 71, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'Elena Vásquez', email: 'elena.vasquez@gmail.com', phone: '+34 620 001001', pax: 8, package: 'charter_full', dur: '4h', time: '10:00', status: 'pending_hold', deposit: 200, depositPaid: false, notes: 'VIP 11th booking — early summer reservation' },
  { daysOffset: 73, boat: 'Rayo del Sol', agent: 'agent.marco@happysail.es', captain: null, sailors: [], customer: 'Thomas Mueller', email: 't.mueller@web.de', phone: '+49 175 001013', pax: 6, package: 'charter_drinks', dur: '3h', time: '14:00', status: 'pending_hold', deposit: 0, depositPaid: false },
  { daysOffset: 75, boat: 'Bahía de Oro', agent: 'agent.laura@happysail.es', captain: 'diego', sailors: ['miguel'], customer: 'Sarah Williams', email: 's.williams@gmail.com', phone: '+44 7700 002003', pax: 10, package: 'charter_full', dur: '8h', time: '09:00', status: 'pending_hold', deposit: 500, depositPaid: false, notes: 'Summer corporate kickoff — sixth event with Sarah' },
  { daysOffset: 78, boat: 'Brisa del Sur', agent: 'agent.marco@happysail.es', captain: 'javier', sailors: [], customer: 'Sophie Andersen', email: 'sophie.andersen@gmail.com', phone: '+45 20 001002', pax: 6, package: 'charter_full', dur: '4h', time: '10:00', status: 'pending_hold', deposit: 0, depositPaid: false },
  { daysOffset: 80, boat: 'Rayo del Sol', agent: 'agent.laura@happysail.es', captain: null, sailors: [], customer: 'Valentina Cruz', email: 'v.cruz@gmail.com', phone: '+34 611 002001', pax: 5, package: 'charter_drinks', dur: '3h', time: '10:00', status: 'pending_hold', deposit: 0, depositPaid: false },
  { daysOffset: 83, boat: 'Bahía de Oro', agent: 'agent.marco@happysail.es', captain: 'diego', sailors: [], customer: 'Henrik Larsen', email: 'h.larsen@yahoo.dk', phone: '+45 61 001004', pax: 6, package: 'charter_food', dur: '4h', time: '10:00', status: 'pending_hold', deposit: 0, depositPaid: false },
  { daysOffset: 87, boat: 'Brisa del Sur', agent: 'agent.laura@happysail.es', captain: 'javier', sailors: [], customer: 'James Mitchell', email: 'james.mitchell@outlook.com', phone: '+44 7911 001014', pax: 6, package: 'charter_drinks', dur: '4h', time: '10:00', status: 'pending_hold', deposit: 0, depositPaid: false },
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

    // Step 2: Delete all non-preserved auth users
    console.log('\n2️⃣  Deleting old demo auth users...')
    const { data: { users: allAuthUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const toDelete = allAuthUsers.filter(u => u.email !== PRESERVED_ADMIN_EMAIL)
    for (const u of toDelete) {
      await supabase.auth.admin.deleteUser(u.id)
    }
    console.log(`   ✓ Deleted ${toDelete.length} old auth users`)
    if (toDelete.length > 0) {
      await new Promise(r => setTimeout(r, 3000)) // wait for auth deletions to propagate
    }

    // Step 3: Clear all data tables
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

    // Step 5: Create demo users
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

    // Step 7: Fuel config
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

    // Step 8: Package config
    console.log('\n8️⃣  Creating package config...')
    const { error: pkgError } = await supabase
      .from('company_package_config')
      .insert({
        company_id: companyId,
        drinks_cost_per_person: 12.00,
        food_cost_per_person: 22.00,
      })
    if (pkgError) throw new Error(`Package config failed: ${pkgError.message}`)
    console.log('   ✓ Drinks: €12/person, Food/Catering: €22/person')

    // Step 9: Pricing matrix
    console.log('\n9️⃣  Creating pricing matrix...')
    let pricingCount = 0
    for (const [boatName, durations] of Object.entries(PRICING)) {
      for (const [duration, packages] of Object.entries(durations)) {
        for (const [pkgType, price] of Object.entries(packages)) {
          const { error } = await supabase
            .from('pricing')
            .insert({ boat_id: boats[boatName].id, duration, package_type: pkgType, price })
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

      let captainFee = 0
      if (captain) {
        captainFee = captain.id === javier.id ? 120 : diego.hourly_rate * hours
      }

      const sailorFee = bk.sailors.includes('miguel') ? (miguel.hourly_rate * hours) : 0
      const boatConfig = DEMO_BOATS.find(b => b.name === bk.boat)
      const fuelCost = boatConfig ? boatConfig.fuelConsumption * boatConfig.fuelPrice * hours : 0

      let packageAddonCost = 0
      if (bk.package === 'charter_drinks') packageAddonCost = 12 * bk.pax
      else if (bk.package === 'charter_food') packageAddonCost = 22 * bk.pax
      else if (bk.package === 'charter_full') packageAddonCost = (12 + 22) * bk.pax

      const price = PRICING[bk.boat][bk.dur][bk.package]
      const startTime = bk.time
      const endTime = addHours(startTime, hours)
      const bookingDate = dateStr(bk.daysOffset)

      const holdUntil = bk.status === 'pending_hold'
        ? new Date(Date.now() + 12 * 60 * 1000).toISOString()
        : null

      const completedAt = bk.status === 'completed'
        ? new Date(TODAY.getTime() + (bk.daysOffset + 1) * 86400000).toISOString()
        : null
      const cancelledAt = bk.status === 'cancelled'
        ? new Date(TODAY.getTime() + (bk.daysOffset - 2) * 86400000).toISOString()
        : null

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

    // Step 11: Sailor assignments
    console.log('\n1️⃣1️⃣  Creating sailor assignments...')
    let sailorAssignments = 0
    for (const booking of createdBookings) {
      if (booking._bk.sailors.includes('miguel')) {
        const hours = durationHours(booking._bk.dur)
        const fee = miguel.hourly_rate * hours
        const { error } = await supabase
          .from('booking_sailors')
          .insert({ booking_id: booking.id, sailor_id: miguel.id, hourly_rate: miguel.hourly_rate, fee })
        if (!error) sailorAssignments++
      }
    }
    console.log(`   ✓ ${sailorAssignments} sailor assignments created`)

    // Step 12: Payment transactions
    console.log('\n1️⃣2️⃣  Creating payment transactions...')
    const paymentMethods = ['card', 'card', 'card', 'cash', 'bank_transfer']
    let paymentCount = 0

    for (const booking of createdBookings) {
      const bk = booking._bk
      if (!bk.depositPaid && booking.status !== 'completed') continue

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

    // Step 13: Customer notes (VIP / repeat customers)
    console.log('\n1️⃣3️⃣  Creating customer notes...')
    const customerNotes = [
      {
        email: 'elena.vasquez@gmail.com',
        notes: 'VIP client — 11 bookings over 6 months, highest lifetime value. Always requests champagne on arrival. Brings referrals. Has booked every boat type. Birthday in March.',
        preferences: 'Champagne welcome, rose petals for special occasions. Brisa del Sur preferred for relaxed trips, Bahía de Oro for bigger groups. Full package always. Excellent tipper.',
      },
      {
        email: 'marco.bianchi@gmail.com',
        notes: 'Loyal Italian client from Milan — 7 bookings with wife Giulia. Always Bahía de Oro for comfort. Books 4-6 weeks in advance. Very generous with tips and reviews.',
        preferences: 'Motor yacht preferred (Bahía de Oro), full catering package. Groups of 6-10. Anniversaries and special occasions. Giulia is vegetarian — note for catering.',
      },
      {
        email: 'sophie.andersen@gmail.com',
        notes: 'Danish repeat client — 6 bookings, originally sailing-only but now also books motor yacht. Visits twice per year (winter + spring). Left glowing TripAdvisor review.',
        preferences: 'Prefers Brisa del Sur but open to Bahía de Oro. Drinks package. Afternoon departures preferred. Annual anniversary trip.',
      },
      {
        email: 's.williams@gmail.com',
        notes: 'Key corporate account — organises group charters for London fintech company 4-5x per year. Each event 10 pax. Full-day Bahía de Oro with Miguel. Always pays by bank transfer. Invoicing required.',
        preferences: 'Bahía de Oro full day only. Full catering. Always 10 pax. Corporate invoice required. Needs dietary options list in advance. Allergic to shellfish.',
      },
      {
        email: 't.mueller@web.de',
        notes: 'German corporate client — books for Munich office team outings 4x per year. Uses Bahía de Oro. Very organised, confirms 4 weeks in advance. Always pays by card.',
        preferences: 'Bahía de Oro, charter_food minimum. Groups of 6-10. Requests German-speaking guide if possible. Punctual — always arrives 15 min early.',
      },
      {
        email: 'h.larsen@yahoo.dk',
        notes: 'Danish repeat — 5 bookings. Started with RIB, moved to Bahía de Oro. Occasional no-show (weather anxiety). Always reschedules. Easy to work with once confirmed.',
        preferences: 'Flexible on boat type. Drinks package. Call to confirm 24h before — reduces no-show risk. Prefers morning departures.',
      },
      {
        email: 'james.mitchell@outlook.com',
        notes: 'British repeat client — 4 bookings, visits seasonally (Christmas and spring). Progressive upgrader: started with sailboat, now always motor yacht. Family with 2 young children.',
        preferences: 'Bahía de Oro or Brisa del Sur. Full package. Morning departure. Children aged 6 & 8 — life jackets needed. Does not drink alcohol, prefer non-alcoholic options.',
      },
      {
        email: 'p.osullivan@gmail.com',
        notes: "Irish client — 4 bookings, mix of corporate (Dublin tech firm) and personal. Organises group events well. Rescheduled once due to illness — very understanding about T&Cs.",
        preferences: 'Brisa del Sur or Bahía de Oro. Full package for groups. Full-day preferred for corporate. WhatsApp preferred for communication.',
      },
      {
        email: 'v.cruz@gmail.com',
        notes: 'Local Spanish regular — 5 bookings in 5 months. Discovered us via Instagram. Books short trips (2-3h) frequently. Brings different friends each time. Great for word-of-mouth.',
        preferences: 'Rayo del Sol preferred (quick, fun). Drinks package. Afternoon slots. Short notice bookings OK (24-48h). Spanish-speaking captain preferred.',
      },
    ]

    for (const note of customerNotes) {
      const { error } = await supabase
        .from('customer_notes')
        .insert({ company_id: companyId, customer_email: note.email, notes: note.notes, preferences: note.preferences })
      if (error) console.warn(`   ⚠️  Notes failed for ${note.email}: ${error.message}`)
      else console.log(`   ✓ Notes: ${note.email}`)
    }

    // Step 14: Waitlist entries
    console.log('\n1️⃣4️⃣  Creating waitlist entries...')
    const waitlistEntries = [
      {
        customer_name: 'Oliver Schmidt',
        customer_email: 'o.schmidt@gmail.de',
        customer_phone: '+49 162 001056',
        preferred_date: dateStr(18),
        boat_id: boats['Bahía de Oro'].id,
        passengers: 10,
        status: 'active',
        notes: 'Looking for full-day charter for corporate event. Very interested, waiting for availability on Bahía de Oro.',
      },
      {
        customer_name: 'Camille Moreau',
        customer_email: 'c.moreau@gmail.fr',
        customer_phone: '+33 6 30 01 57',
        preferred_date: dateStr(11),
        boat_id: boats['Brisa del Sur'].id,
        passengers: 8,
        status: 'contacted',
        notes: 'Bachelorette party — 8 pax, wants 4h sailing trip. Contacted via WhatsApp — awaiting deposit.',
      },
      {
        customer_name: 'Ravi Sharma',
        customer_email: 'ravi.sharma@outlook.com',
        customer_phone: '+44 7823 001099',
        preferred_date: dateStr(35),
        boat_id: boats['Bahía de Oro'].id,
        passengers: 6,
        status: 'active',
        notes: 'Honeymoon couple + friends, interested in April luxury charter. Budget flexible. Referred by Elena Vásquez.',
      },
    ]

    for (const wl of waitlistEntries) {
      const { error } = await supabase
        .from('waitlist')
        .insert({ company_id: companyId, ...wl })
      if (error) console.warn(`   ⚠️  Waitlist failed: ${error.message}`)
      else console.log(`   ✓ Waitlist: ${wl.customer_name}`)
    }

    // Step 15: Blocked slots
    console.log('\n1️⃣5️⃣  Creating blocked slots...')
    const blockedSlots = [
      {
        boat_id: boats['Rayo del Sol'].id,
        blocked_date: dateStr(20),
        start_date: dateStr(20),
        end_date: dateStr(20),
        start_time: '08:00',
        end_time: '20:00',
        reason: 'Annual engine service + hull inspection. Rayo del Sol unavailable all day. Booked with Estepona Marina workshop.',
        block_type: 'maintenance',
      },
      {
        boat_id: boats['Brisa del Sur'].id,
        blocked_date: dateStr(44),
        start_date: dateStr(44),
        end_date: dateStr(46),
        start_time: '08:00',
        end_time: '20:00',
        reason: 'Sail inspection and rigging service — 3-day yard visit. Brisa del Sur back in service day +47.',
        block_type: 'maintenance',
      },
    ]

    for (const slot of blockedSlots) {
      const { error } = await supabase
        .from('blocked_slots')
        .insert({ company_id: companyId, ...slot })
      if (error) console.warn(`   ⚠️  Blocked slot failed: ${error.message}`)
      else console.log(`   ✓ Blocked: ${slot.reason.split('—')[0].trim()} (day ${slot.blocked_date})`)
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const totalRevenue = createdBookings
      .filter(b => ['completed', 'confirmed'].includes(b.status))
      .reduce((sum, b) => sum + (b.total_price || 0), 0)

    console.log('\n' + '='.repeat(55))
    console.log('✅  DATABASE SEEDED SUCCESSFULLY!')
    console.log('='.repeat(55))
    console.log('\n📊 Summary:')
    console.log(`   Company:      ${COMPANY.name}`)
    console.log(`   Users:        ${DEMO_USERS.length} demo + 1 preserved admin`)
    console.log(`   Boats:        ${DEMO_BOATS.length} (RIB, Sailboat, Motor Yacht)`)
    console.log(`   Pricing:      ${pricingCount} entries (3 boats × 4 durations × 4 packages)`)
    console.log(`   Bookings:     ${createdBookings.length} (${BOOKINGS.length} attempted)`)
    console.log(`   Payments:     ${paymentCount} transactions`)
    console.log(`   Revenue est:  €${totalRevenue.toLocaleString('en-EU')} (completed + confirmed)`)
    console.log(`   Waitlist:     ${waitlistEntries.length} entries`)
    console.log(`   Blocked:      ${blockedSlots.length} maintenance slots`)
    console.log('\n🔐 Demo Credentials (password: Demo1234!):')
    console.log('   admin@navibook.com              (super admin - preserved)')
    for (const u of DEMO_USERS) {
      console.log(`   ${u.email.padEnd(40)} (${u.role})`)
    }
    console.log('\n💰 Cost Analysis Per Charter:')
    console.log('   Captain Javier (Brisa del Sur): €120 flat/booking')
    console.log('   Captain Diego  (Bahía de Oro):  €25/h × duration')
    console.log('   Sailor Miguel:                   €15/h × duration')
    console.log('   Fuel Rayo del Sol (RIB):         45L/h × €1.80 = €81/h')
    console.log('   Fuel Brisa del Sur (Sail):        4L/h × €1.80 = €7.20/h')
    console.log('   Fuel Bahía de Oro (Motor):       55L/h × €1.80 = €99/h')
    console.log('   Drinks package:                  €12/person')
    console.log('   Food/Catering package:           €22/person')
    console.log('\n✨ Ready for demos and pitching!')
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seedDatabase()

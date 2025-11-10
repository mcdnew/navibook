#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('\n👤 Creating admin user...\n');

  const email = 'admin@navibook.com';
  const password = 'Admin123!'; // Change this after first login!

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('ℹ️  Admin user already exists in auth');
      // Get existing user
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return existingUser.id;
      }
    } else {
      throw authError;
    }
  }

  const userId = authData.user.id;
  console.log(`✅ Auth user created: ${email}`);

  // Get company ID
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
    .single();

  if (!companies) {
    throw new Error('No company found - run migrations first');
  }

  // Create user record in users table
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      company_id: companies.id,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      email: email,
      is_active: true
    });

  if (userError) {
    if (userError.message.includes('duplicate key')) {
      console.log('ℹ️  User record already exists');
    } else {
      throw userError;
    }
  } else {
    console.log('✅ Admin user record created');
  }

  console.log('\n📧 Login credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('   ⚠️  Change password after first login!\n');

  return userId;
}

async function seedBoatsAndPricing() {
  console.log('🚤 Creating test boats...\n');

  // Get company ID
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
    .single();

  const boats = [
    { name: 'Sunset Dreams', type: 'sailboat', capacity: 8, description: 'Beautiful sailboat perfect for sunset cruises' },
    { name: 'Ocean Rider', type: 'motorboat', capacity: 10, description: 'Fast and comfortable motorboat' },
    { name: 'Wave Runner 1', type: 'jetski', capacity: 2, description: 'Thrilling jet-ski adventure' },
    { name: 'Wave Runner 2', type: 'jetski', capacity: 2, description: 'Thrilling jet-ski adventure' },
    { name: 'Mediterranean Star', type: 'sailboat', capacity: 12, description: 'Luxury sailing experience' },
    { name: 'Speed King', type: 'motorboat', capacity: 6, description: 'Compact and speedy' }
  ];

  const createdBoats = [];

  for (const boat of boats) {
    const { data, error } = await supabase
      .from('boats')
      .insert({
        company_id: companies.id,
        name: boat.name,
        boat_type: boat.type,
        capacity: boat.capacity,
        description: boat.description,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.log(`⚠️  ${boat.name} may already exist`);
    } else {
      createdBoats.push(data);
      console.log(`✅ Created: ${boat.name} (${boat.type}, ${boat.capacity} pax)`);
    }
  }

  console.log('\n💰 Creating pricing...\n');

  // Get all boats (including any existing ones)
  const { data: allBoats } = await supabase
    .from('boats')
    .select('id, name, boat_type');

  const durations = [
    { duration: '2h', sailboat: 150, motorboat: 180, jetski: 80 },
    { duration: '3h', sailboat: 200, motorboat: 250, jetski: 110 },
    { duration: '4h', sailboat: 250, motorboat: 320, jetski: 140 },
    { duration: '8h', sailboat: 450, motorboat: 580, jetski: 240 }
  ];

  let pricingCount = 0;

  for (const boat of allBoats) {
    for (const dur of durations) {
      const price = dur[boat.boat_type];

      const { error } = await supabase
        .from('pricing')
        .insert({
          boat_id: boat.id,
          duration: dur.duration,
          package_type: 'charter_only',
          price: price
        });

      if (!error) {
        pricingCount++;
      }
    }
  }

  console.log(`✅ Created ${pricingCount} pricing entries\n`);
}

async function main() {
  console.log('🌱 Seeding database with initial data...');

  try {
    await createAdminUser();
    await seedBoatsAndPricing();

    console.log('✅ Database seeding complete! 🎉\n');
    console.log('📋 Summary:');
    console.log('   - Admin user created');
    console.log('   - 6 test boats added');
    console.log('   - Pricing configured for all boats\n');
    console.log('🚀 Next: Start the app with: pnpm run dev');
    console.log('   Then login at: http://localhost:3000/login\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

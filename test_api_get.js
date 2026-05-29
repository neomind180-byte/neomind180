const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const { getDailyChatTime } = require('./lib/db/reflections');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testFullGet() {
  const email = 'emmelinevz18@gmail.com';
  console.log(`🧪 Testing full GET api/reflection simulation for ${email}...`);

  try {
    // 1. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`);
    }

    console.log(`- Profile Tier: ${profile.subscription_tier}`);

    // 2. Fetch daily chat time using actual function
    console.log('- Running getDailyChatTime...');
    const dailyChatTime = await getDailyChatTime(profile.id);
    console.log(`- Daily Chat Time: ${dailyChatTime}m`);

    console.log('✅ Simulation completed successfully without errors!');
  } catch (err) {
    console.error('❌ SIMULATION CRASHED:', err);
  }
}

testFullGet();

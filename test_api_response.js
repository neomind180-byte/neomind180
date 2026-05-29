const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);
const supabaseClient = createClient(supabaseUrl, anonKey);

function getTierLimit(tier) {
  if (tier === 'free') {
    return 30;
  }
  return 60;
}

async function testApiResponse() {
  const email = 'justloveyorkies@gmail.com';
  const password = '@3iPskWF7qCp4SAM#';
  
  console.log(`🔌 1. Upgrading ${email} to starter tier...`);
  await supabaseAdmin
    .from('profiles')
    .update({ subscription_tier: 'starter', trial_expires_at: new Date(Date.now() + 365*24*60*60*1000).toISOString() })
    .eq('email', email);

  try {
    console.log(`🔑 2. Logging in ${email}...`);
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError || !authData.session) {
      throw new Error(`Login failed: ${authError?.message}`);
    }
    
    const token = authData.session.access_token;
    console.log('✅ Logged in successfully. Token acquired.');

    // 3. Mimic /api/reflection GET logic with client-scoped client
    console.log('📡 3. Querying profile using client-scoped supabase client...');
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      throw new Error(`Invalid token user: ${userError?.message}`);
    }

    const { data: profileData, error: profileQueryError } = await userSupabase
      .from('profiles')
      .select('subscription_tier, trial_expires_at')
      .eq('id', user.id)
      .single();

    if (profileQueryError) {
      console.log('❌ PROFILE QUERY FAILED:', profileQueryError);
    } else {
      console.log('👤 profileData returned from client-scoped query:', profileData);
      const tier = profileData.subscription_tier || 'free';
      const limit = getTierLimit(tier);
      console.log(`⚙️ Computed Tier: "${tier}", Limit: ${limit}m`);
    }

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
  } finally {
    console.log(`🔄 4. Restoring ${email} back to free tier...`);
    await supabaseAdmin
      .from('profiles')
      .update({ subscription_tier: 'free', trial_expires_at: null })
      .eq('email', email);
  }
}

testApiResponse();

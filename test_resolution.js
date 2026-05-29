const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

function getTierLimit(tier) {
  if (tier === 'free') {
    return 30;
  }
  return 60;
}

async function testResolution() {
  const emails = ['emmelinevz18@gmail.com', 'mumolu@gmail.com', 'coach@neomind180.com'];
  
  for (const email of emails) {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier, trial_expires_at')
      .eq('email', email)
      .maybeSingle();
      
    if (profile) {
      const tier = profile.subscription_tier || 'free';
      const limit = getTierLimit(tier);
      console.log(`🔍 [${email}] tier resolved to: "${tier}", limit resolved to: ${limit}m`);
    } else {
      console.log(`❌ Profile not found for ${email}`);
    }
  }
}

testResolution();

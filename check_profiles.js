const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function checkProfiles() {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*');
      
  if (error) {
    console.error(`❌ Error fetching profiles:`, error);
  } else if (profiles) {
    console.log(`Total profiles found: ${profiles.length}`);
    profiles.forEach(profile => {
      console.log(`👤 Profile: ${profile.email} (${profile.id}):`, {
        full_name: profile.full_name,
        subscription_tier: profile.subscription_tier,
        trial_expires_at: profile.trial_expires_at
      });
    });
  } else {
    console.log(`❓ No profiles found`);
  }
}

checkProfiles();

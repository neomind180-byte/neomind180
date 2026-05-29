const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function upsertCoach() {
  const coachId = 'c396bab6-6457-40c7-96ec-5e68ddcea463';
  const email = 'coach@neomind180.com';
  
  console.log(`👤 Upserting profile for coach: ${email} (${coachId})`);
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: coachId,
      email: email,
      full_name: 'Coach Emmeline',
      subscription_tier: 'catalyst', // Highest tier
      preferred_coach_mode: 'Gentle Observer'
    })
    .select();
    
  if (error) {
    console.error('❌ Error upserting coach profile:', error);
  } else {
    console.log('✅ SUCCESS! Coach profile successfully provisioned:', data);
  }
}

upsertCoach();

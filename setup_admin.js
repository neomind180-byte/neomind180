const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Read credentials from env — never hardcode secrets in source files!
const email = process.env.ADMIN_SETUP_EMAIL;
const password = process.env.ADMIN_SETUP_PASSWORD;

if (!email || !password) {
  console.error('ERROR: ADMIN_SETUP_EMAIL and ADMIN_SETUP_PASSWORD must be set in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function setupAdmin() {

  // 1. Create or get user in Auth
  console.log(`Setting up admin user: ${email}`);
  let userId;
  
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error fetching users:', listError);
    return;
  }

  const existingUser = existingUsers.users.find(u => u.email === email);

  if (existingUser) {
    console.log('User already exists in Auth. Updating password...');
    const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      existingUser.id,
      { password: password, email_confirm: true }
    );
    if (updateError) {
      console.error('Error updating password:', updateError);
    }
    userId = existingUser.id;
  } else {
    console.log('Creating new Auth user...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });
    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    userId = newUser.user.id;
  }

  // 2. Upsert profile directly specifying the highest tier
  console.log(`Setting profile tier 'catalyst' for ${userId}...`);
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'NeoMind Coach',
      subscription_tier: 'catalyst', // Highest tier
      preferred_coach_mode: 'Gentle Observer'
    });

  if (profileError) {
    console.error('Error updating profile:', profileError);
  } else {
    console.log('SUCCESS! Admin user fully provisioned.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

setupAdmin();

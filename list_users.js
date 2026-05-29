const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function findUsers() {
  const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  
  console.log(`Total users in Auth: ${usersData.users.length}`);
  usersData.users.forEach(u => {
    console.log(`- User: ${u.email} | ID: ${u.id} | Metadata:`, u.user_metadata);
  });
}

findUsers();

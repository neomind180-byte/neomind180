const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(1);

  fs.writeFileSync('schema.json', JSON.stringify(Object.keys(data[0] || {}), null, 2), 'utf8');
}

check();

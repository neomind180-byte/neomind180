import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * This cron job runs daily to keep the Supabase database alive.
 * Supabase pauses projects after 1 week of inactivity (no API requests).
 */
export async function GET(req: Request) {
  // Secure the cron endpoint with a secret token (set in Vercel environment variables)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Perform a simple query to keep the database alive
    const { error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Database query successful, connection kept alive.',
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Cron keep-alive error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyCoachOfCancellation, sendDowngradeConfirmationToUser, notifyCoachOfUserDowngrade } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const publicSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error: authError } = await publicSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planName } = await req.json();

    // 1. Mark subscription as cancelled in Supabase profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ subscription_tier: 'free', trial_expires_at: null })
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to downgrade user in DB:', profileError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // 2. Notify Coach/Admin to manually cancel in PayFast dashboard
    const userName = user.user_metadata?.full_name || user.email || 'Unknown User';
    await notifyCoachOfCancellation(user.email!, userName, planName || 'Unknown Plan');
    await notifyCoachOfUserDowngrade(user.email!, userName, planName || 'Unknown Plan', 'User requested via settings');

    // 3. Send confirmation to user
    await sendDowngradeConfirmationToUser(user.email!, userName);

    // Return success
    return NextResponse.json({ success: true, message: 'Downgraded successfully. Cancellation email dispatched to admin.' });
  } catch (err: any) {
    console.error('Cancellation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

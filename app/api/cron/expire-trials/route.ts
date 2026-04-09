import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  sendTrialExpiryWarning, 
  sendTrialExpiredNotification,
  notifyCoachOfUserDowngrade
} from '@/lib/email';
import { PRICING_PLANS } from '@/lib/pricing-config';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Secure the cron endpoint with a secret token
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results = { warned: 0, expired: 0, errors: [] as string[] };

  try {
    // Fetch all profiles that have an active trial (trial_expires_at set, not on free tier)
    const { data: trialProfiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, subscription_tier, trial_expires_at')
      .not('trial_expires_at', 'is', null)
      .neq('subscription_tier', 'free');

    if (error) throw error;

    for (const profile of trialProfiles ?? []) {
      const expiresAt = new Date(profile.trial_expires_at);
      const msLeft = expiresAt.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      const userName = profile.full_name || profile.email || 'User';
      const plan = PRICING_PLANS.find(p => p.id === profile.subscription_tier);
      const planName = plan?.title || profile.subscription_tier;
      const expiresAtStr = expiresAt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

      // ── EXPIRED: Downgrade ────────────────────────────────────────────────
      if (daysLeft <= 0) {
        const { error: downgradeError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_tier: 'free',
            trial_expires_at: null 
          })
          .eq('id', profile.id);

        if (downgradeError) {
          results.errors.push(`Failed to downgrade ${profile.email}: ${downgradeError.message}`);
        } else {
          results.expired++;
          await sendTrialExpiredNotification(profile.email, userName, planName);
          await notifyCoachOfUserDowngrade(profile.email, userName, planName, 'Trial expired (30 days)');
        }

      // ── WARNING: 7 days or 1 day left ────────────────────────────────────
      } else if (daysLeft === 7 || daysLeft === 1) {
        await sendTrialExpiryWarning(profile.email, userName, planName, daysLeft, expiresAtStr);
        results.warned++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: trialProfiles?.length ?? 0,
      ...results 
    });

  } catch (err: any) {
    console.error('Cron expire-trials error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

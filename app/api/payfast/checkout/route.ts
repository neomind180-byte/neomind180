import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePayFastSignature, getPayFastConfig, PayFastData } from '@/lib/payfast';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { sendUpgradeConfirmationToUser, notifyCoachOfUserUpgrade } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const publicSupabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authError } = await publicSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { planId, billingPeriod, currency = 'ZAR', voucherCode } = await req.json();

    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Determine amount based on currency and plan
    let rawAmount = plan.price[currency as 'ZAR' | 'USD'].amount;
    if (planId === 'starter' && billingPeriod === 'YEAR') {
      rawAmount = currency === 'ZAR' ? '2500.00' : '150.00';
    }
    let customStr4 = ''; // For voucher ID

    if (voucherCode) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: voucher, error: vError } = await supabaseAdmin
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.trim())
        .eq('tier', planId)
        .single();
 
      if (!vError && voucher) {
        // --- VOUCHER PATH: Bypass PayFast entirely ---
        // R0.00 PayFast transactions cause ITN failures and card rejection issues.
        // Since the voucher is already validated, we upgrade the user directly.

        // A. Prevent double-redemption by the same user account
        const { data: userRedemption } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('m_payment_id', `voucher_${voucher.id}`)
          .eq('status', 'COMPLETE')
          .limit(1)
          .maybeSingle();

        if (userRedemption) {
          return NextResponse.json({ error: 'You have already redeemed this promo code' }, { status: 400 });
        }

        // B. Enforce the maximum uses quota limit
        const { count: redemptionCount } = await supabaseAdmin
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('m_payment_id', `voucher_${voucher.id}`)
          .eq('status', 'COMPLETE');

        const maxUses = voucher.max_uses ?? 1;
        const currentUses = redemptionCount ?? 0;

        if (voucher.is_redeemed || currentUses >= maxUses) {
          return NextResponse.json({ error: 'This promo code has reached its maximum usage limit' }, { status: 400 });
        }

        // 1. Mark voucher as redeemed globally if this final redemption exhausts the quota
        const isNowExhausted = (currentUses + 1) >= maxUses;
        await supabaseAdmin
          .from('vouchers')
          .update({
            is_redeemed: isNowExhausted,
            redeemed_by: user.id,
            redeemed_at: new Date().toISOString()
          })
          .eq('id', voucher.id);

        // 2. Upgrade user profile + set dynamic trial expiry (1 year if code contains 'YEAR' or '365', otherwise 30 days)
        const trialExpiresAt = new Date();
        const isYearVoucher = voucher.code.toUpperCase().includes('YEAR') || voucher.code.toUpperCase().includes('365');
        const durationDays = isYearVoucher ? 365 : 30;
        trialExpiresAt.setDate(trialExpiresAt.getDate() + durationDays);

        await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_tier: planId,
            trial_expires_at: trialExpiresAt.toISOString()
          })
          .eq('id', user.id);

        // 3. Log a subscription record for audit trail
        await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: user.id,
            m_payment_id: `voucher_${voucher.id}`,
            plan_id: planId,
            plan_name: plan.title, // Human readable name
            billing_period: billingPeriod,
            amount: 0,
            currency: currency,
            status: 'COMPLETE'
          });

        // 4. Send thank-you email and notify coach of trial start
        const userName = user.user_metadata?.full_name || user.email || 'User';
        await sendUpgradeConfirmationToUser(user.email!, userName, plan.title, plan.tagline);
        await notifyCoachOfUserUpgrade(user.email!, userName, `${plan.title} (Trial - 30 days)`);

        // 5. Return redirect (no PayFast needed)
        return NextResponse.json({ redirect: '/dashboard?payment=success' });

      } else {
        console.error('[Checkout] Voucher lookup failed:', vError?.message, '| Code:', voucherCode, '| Plan:', planId);
        return NextResponse.json({ error: 'Invalid or incorrect voucher for this plan', detail: vError?.message }, { status: 400 });
      }
    }

    const amount = currency === 'ZAR' ? parseFloat(rawAmount).toFixed(2) : rawAmount;

    // PayFast only processes South African Rand (ZAR).
    // If currency is USD, we must charge the configured ZAR equivalent amount to avoid charging R15 instead of R250.
    let payfastAmount = amount;
    if (currency === 'USD') {
      if (planId === 'starter') {
        payfastAmount = billingPeriod === 'YEAR' ? '2500.00' : '250.00';
      }
    }

    // Allow 0.00 only if a voucher was applied
    if (parseFloat(amount) === 0 && !customStr4) {
      return NextResponse.json({ error: 'Cannot checkout a free plan' }, { status: 400 });
    }

    // Use built-in crypto.randomUUID()
    const mPaymentId = `sub_${crypto.randomUUID().split('-')[0]}_${Date.now()}`;

    // 1. Create a pending subscription
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: user.id,
        m_payment_id: mPaymentId,
        plan_id: planId,
        plan_name: plan.title, // Human readable name
        billing_period: billingPeriod,
        amount: parseFloat(amount),
        currency: currency,
        status: 'PENDING'
      });

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to create subscription record' }, { status: 500 });
    }

    // 2. Prepare PayFast Data
    const config = getPayFastConfig();
    
    // Fallbacks for missing user data to prevent crashes
    const userEmail = user.email || user.user_metadata?.email || '';
    const fullName = user.user_metadata?.full_name || '';
    const nameParts = fullName.trim().split(/\s+/);
    
    const userFirstName = user.user_metadata?.first_name || nameParts[0] || 'User';
    const userLastName = user.user_metadata?.last_name || nameParts.slice(1).join(' ') || '';

    if (!userEmail) {
      console.error('[Checkout] User is missing email address:', user.id);
      return NextResponse.json({ error: 'Email address is required for checkout' }, { status: 400 });
    }

    console.log(`[PayFast Checkout] Preparing payment for ${userEmail} (${planId})`);
    
    // Dynamically detect the protocol and host
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const appUrl = `${protocol}://${host}`;

    const pfData: PayFastData = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/pricing?payment=cancelled`,
      notify_url: `${appUrl}/api/payfast/itn`,
      name_first: userFirstName,
      name_last: userLastName,
      email_address: userEmail,
      m_payment_id: mPaymentId,
      amount: payfastAmount,
      item_name: `NeoMind180 ${plan.title}`,
      custom_str1: user.id,
      custom_str2: planId,
      custom_str3: billingPeriod,
      ...(customStr4 ? { custom_str4: customStr4 } : {}),
    };

    console.log('[PayFast] Fields being sent:', JSON.stringify({
      merchant_id: config.merchantId,
      amount: payfastAmount,
      item_name: `NeoMind180 ${plan.title}`,
      email_address: userEmail,
      m_payment_id: mPaymentId,
      isSandbox: config.isSandbox,
      baseUrl: config.baseUrl,
      passphraseSet: !!config.passphrase,
    }));

    try {
      const signature = generatePayFastSignature(pfData, config.passphrase);
      pfData.signature = signature;
    } catch (sigErr: any) {
      console.error('[Checkout] Signature generation failed:', sigErr);
      return NextResponse.json({ error: 'Payment signature error' }, { status: 500 });
    }

    return NextResponse.json({ 
      url: config.baseUrl,
      pfData 
    });
  } catch (err: any) {
    console.error('[Checkout] CRITICAL ERROR:', err.message, err.stack);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}

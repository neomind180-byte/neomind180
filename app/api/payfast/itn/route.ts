import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validatePayFastSignature, getPayFastConfig } from '@/lib/payfast';
import { notifyCoachOfUpgradeCancellation } from '@/lib/email';

// Use service role for database changes in ITN
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const parsedParams = new URLSearchParams(rawBody);
    
    const params: Record<string, string> = {};
    parsedParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('Incoming ITN from PayFast:', params);

    const config = getPayFastConfig();
    const validateUrl = config.isSandbox 
      ? 'https://sandbox.payfast.co.za/eng/query/validate' 
      : 'https://www.payfast.co.za/eng/query/validate';

    // 1. Validate ITN with PayFast Directly (Far more reliable than JS hashing)
    const validateRes = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: rawBody
    });

    const validateResult = await validateRes.text();

    if (validateResult !== 'VALID') {
      console.error('Invalid PayFast ITN validation payload. PayFast returned:', validateResult);
      await supabaseAdmin.from('itn_logs').insert({
        payload: params,
        error_message: `PayFast Validation Failed: ${validateResult}`,
        status_code: 400
      });
      return new Response('Invalid Signature', { status: 400 });
    }
    // For this implementation, we rely on the MD5 hash and Passphrase security.

    const mPaymentId = params.m_payment_id;
    const pfPaymentId = params.pf_payment_id;
    const paymentStatus = params.payment_status;
    const userId = params.custom_str1;
    const planId = params.custom_str2;
    const token = params.token;
    const voucherId = params.custom_str4; // Check for voucher

    // 3. Update Subscriptions table
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        pf_payment_id: pfPaymentId,
        status: paymentStatus,
        token: token,
      })
      .eq('m_payment_id', mPaymentId);

    if (subError) {
      console.error('Error updating subscription:', subError);
      return new Response('Database Error', { status: 500 });
    }

    // 4. If payment completed, upgrade user profile & handle voucher
    if (paymentStatus === 'COMPLETE') {
      
      // Step A: Detect Upgrade before changing
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier, full_name, email')
        .eq('id', userId)
        .single();
        
      const oldTier = currentProfile?.subscription_tier;
      const userEmail = currentProfile?.email || params.email_address;
      const userName = currentProfile?.full_name || params.name_first || 'User';

      if (oldTier && oldTier !== 'free' && oldTier !== planId) {
        // Plan switched/upgraded! Alert coach to cancel old one.
        console.log(`Detected switch from ${oldTier} to ${planId} for ${userName}`);
        await notifyCoachOfUpgradeCancellation(userEmail, userName, oldTier, planId);
      }

      // Step B: Upgrade profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: planId,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        return new Response('Database Error', { status: 500 });
      }

      // Step C: Mark voucher as redeemed if used
      if (voucherId) {
        const { error: voucherError } = await supabaseAdmin
          .from('vouchers')
          .update({
            is_redeemed: true,
            redeemed_by: userId,
            redeemed_at: new Date().toISOString()
          })
          .eq('id', voucherId);

        if (voucherError) {
          console.error('Error marking voucher as redeemed:', voucherError);
        } else {
          console.log(`Voucher ${voucherId} marked as redeemed for user ${userId}`);
        }
      }
      
      console.log(`User ${userId} upgraded to ${planId}`);
    }

    await supabaseAdmin.from('itn_logs').insert({
      payload: params,
      error_message: 'Success',
      status_code: 200
    });

    return new Response('ITN Processed', { status: 200 });
  } catch (err: any) {
    console.error('ITN handling error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

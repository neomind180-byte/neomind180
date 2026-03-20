import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validatePayFastSignature, getPayFastConfig } from '@/lib/payfast';

// Use service role for database changes in ITN
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const params: Record<string, string> = {};
    data.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('Incoming ITN from PayFast:', params);

    const config = getPayFastConfig();

    // 1. Validate Signature
    const isValid = validatePayFastSignature(params, config.passphrase);
    if (!isValid) {
      console.error('Invalid PayFast signature for ITN:', params.signature);
      return new Response('Invalid Signature', { status: 400 });
    }

    // 2. Validate with PayFast server (Optional but recommended to prevent spoofing)
    // For this implementation, we rely on the MD5 hash and Passphrase security.

    const mPaymentId = params.m_payment_id;
    const pfPaymentId = params.pf_payment_id;
    const paymentStatus = params.payment_status;
    const userId = params.custom_str1;
    const planId = params.custom_str2;
    const token = params.token;

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

    // 4. If payment completed, upgrade user profile
    if (paymentStatus === 'COMPLETE') {
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
      
      console.log(`User ${userId} upgraded to ${planId}`);
    }

    return new Response('ITN Processed', { status: 200 });
  } catch (err: any) {
    console.error('ITN handling error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

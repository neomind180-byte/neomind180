import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePayFastSignature, getPayFastConfig, PayFastData } from '@/lib/payfast';
import { PRICING_PLANS } from '@/lib/pricing-config';

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

    const { planId, billingPeriod, currency = 'ZAR' } = await req.json();

    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Determine amount based on currency and plan
    const amount = plan.price[currency as 'ZAR' | 'USD'].amount;
    
    if (amount === '0') {
      return NextResponse.json({ error: 'Cannot checkout a free plan' }, { status: 400 });
    }

    // Use built-in crypto.randomUUID()
    const mPaymentId = `sub_${crypto.randomUUID().split('-')[0]}_${Date.now()}`;

    // 1. Create a pending subscription in Supabase
    // Use service role for database changes in checkout if needed, or stick to authenticated?
    // Actually, for creating a record, the user's RLS should allow insert.
    // However, to be safe for ITN correlation, we'll use a service client.
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const pfData: PayFastData = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/pricing?payment=cancelled`,
      notify_url: `${appUrl}/api/payfast/itn`,
      name_first: user.user_metadata?.full_name?.split(' ')[0] || '',
      name_last: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      email_address: user.email!,
      m_payment_id: mPaymentId,
      amount: amount,
      item_name: `NeoMind180: ${plan.title}`,
      custom_str1: user.id,
      custom_str2: planId,
      custom_str3: billingPeriod,
    };

    const signature = generatePayFastSignature(pfData, config.passphrase);
    pfData.signature = signature;

    return NextResponse.json({ 
      url: config.baseUrl,
      pfData 
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

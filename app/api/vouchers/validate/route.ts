import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', code.trim())
      .single();

    if (error || !voucher) {
      return NextResponse.json({ error: 'Invalid voucher code' }, { status: 404 });
    }

    if (voucher.is_redeemed) {
      return NextResponse.json({ error: 'Voucher has already been redeemed' }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true,
      tier: voucher.tier,
      message: `Voucher for ${voucher.tier.toUpperCase()} plan accepted!\n\nPlease click the corresponding plan button below to proceed to checkout.`
    });

  } catch (err: any) {
    console.error('Voucher validation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

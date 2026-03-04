import { NextResponse } from 'next/server';
import { addToSystemeIO } from '@/lib/systemeio';

/**
 * Webhook endpoint for Supabase to trigger Systeme.io integration.
 * This should be called when a user confirms their email.
 */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('x-webhook-secret');
        const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

        // 1. Secure the webhook
        if (webhookSecret && authHeader !== webhookSecret) {
            console.error('❌ Unauthorized webhook access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        console.log('📬 Webhook Body:', JSON.stringify(payload, null, 2));

        // Payload structure for Supabase Webhooks (UPDATE on auth.users)
        // We are looking for: email_confirmed_at changing from null to a timestamp
        const { record, old_record } = payload;

        if (!record || !record.email) {
            return NextResponse.json({ error: 'Invalid payload: missing record or email' }, { status: 400 });
        }

        // 2. Logic: Only proceed if email was JUST confirmed
        const wasConfirmed = old_record && old_record.email_confirmed_at !== null;
        const isNowConfirmed = record.email_confirmed_at !== null;

        if (isNowConfirmed && !wasConfirmed) {
            const fullName = record.raw_user_meta_data?.full_name || '';
            const tier = record.raw_user_meta_data?.subscription_tier || 'free';

            console.log(`📩 Processing confirmed email for: ${record.email}`);

            const result = await addToSystemeIO(
                record.email,
                fullName,
                [tier, 'neomind180-signup']
            );

            if (result.success) {
                return NextResponse.json({ success: true, message: 'User added to Systeme.io' });
            } else {
                return NextResponse.json({ error: 'Failed to add to Systeme.io', details: result.error }, { status: 502 });
            }
        }

        return NextResponse.json({ success: true, message: 'No action needed (not a confirmation event)' });
    } catch (error: any) {
        console.error("❌ Error in Systeme.io Webhook:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

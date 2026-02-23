import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('x-webhook-secret');
        const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

        // Secure the webhook
        if (webhookSecret && authHeader !== webhookSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const record = payload.record || payload;

        // Ensure we have an email. Profiles table should have user's email or link to it
        const email = record.email || record.user_email;

        if (!email) {
            return NextResponse.json({ error: 'No email found in record' }, { status: 400 });
        }

        const result = await sendWelcomeEmail(email);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            throw result.error;
        }
    } catch (error: any) {
        console.error("❌ Error in send-welcome Webhook:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

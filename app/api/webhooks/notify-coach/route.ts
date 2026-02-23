import { NextResponse } from 'next/server';
import { notifyCoachOfMessage } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('x-webhook-secret');
        const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

        // Secure the webhook with a shared secret
        if (webhookSecret && authHeader !== webhookSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();

        // Supabase webhooks send the record in payload.record
        const record = payload.record || payload;

        if (!record || !record.subject || !record.message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await notifyCoachOfMessage(record);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            throw result.error;
        }
    } catch (error: any) {
        console.error("❌ Error in notify-coach Webhook:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

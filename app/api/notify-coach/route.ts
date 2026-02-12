import { NextResponse } from 'next/server';
import { notifyCoachOfMessage } from '@/lib/email';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        // 1. Verify session to ensure only logged in users can trigger this
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const record = await req.json();

        if (!record || !record.subject || !record.message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Add system info/metadata if needed
        const emailData = {
            ...record,
            user_email: user.email,
        };

        // 3. Send the email via the server-side utility
        const result = await notifyCoachOfMessage(emailData);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            throw result.error;
        }
    } catch (error: any) {
        console.error("❌ Error in notify-coach API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

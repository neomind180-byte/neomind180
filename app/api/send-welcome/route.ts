import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        const result = await sendWelcomeEmail(email);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            throw result.error;
        }
    } catch (error: any) {
        console.error("❌ Error in send-welcome API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

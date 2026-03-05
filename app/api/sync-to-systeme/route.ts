import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('x-webhook-secret');
        const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

        if (webhookSecret && authHeader !== webhookSecret) {
            console.error('❌ Unauthorized sync attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email, name, userTier } = await request.json();

        const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY;

        if (!SYSTEME_API_KEY) {
            console.error('❌ Missing SYSTEME_API_KEY in environment variables');
            return NextResponse.json({ error: 'Systeme configuration missing' }, { status: 500 });
        }

        // Systeme.io API call (Tags-based)
        const response = await fetch('https://api.systeme.io/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SYSTEME_API_KEY,
            },
            body: JSON.stringify({
                email: email,
                firstName: name || email.split('@')[0],
                tags: ['NeoMind180_FreeUser'], // This is the key part - tags array
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Systeme.io API error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to add to Systeme.io', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Successfully added to Systeme.io:', data);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error syncing to Systeme.io:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

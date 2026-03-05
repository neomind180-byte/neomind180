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
        const TAG_ID = 1902549; // NeoMind180_FreeUser

        if (!SYSTEME_API_KEY) {
            console.error('❌ Missing SYSTEME_API_KEY in environment variables');
            return NextResponse.json({ error: 'Systeme configuration missing' }, { status: 500 });
        }

        // STEP 1: Create or find the contact
        console.log(`📡 Creating/Updating contact in Systeme.io: ${email}`);
        const contactResponse = await fetch('https://api.systeme.io/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SYSTEME_API_KEY,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                firstName: name || email.split('@')[0]
            }),
        });

        const contactData = await contactResponse.json();

        if (!contactResponse.ok && contactResponse.status !== 422) {
            console.error('❌ Systeme.io Contact Creation Error:', contactResponse.status, contactData);
            return NextResponse.json({ error: 'Failed to create contact', details: contactData }, { status: contactResponse.status });
        }

        // Capture contact ID (either from 201 Created or 422 Already Exists via fetching)
        let contactId = contactData.id;

        if (contactResponse.status === 422) {
            // If contact exists, we need to fetch their ID
            console.log('ℹ️ Contact already exists, fetching ID...');
            const listResponse = await fetch(`https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`, {
                headers: { 'X-API-Key': SYSTEME_API_KEY, 'Accept': 'application/json' }
            });
            const listData = await listResponse.json();
            contactId = listData.items?.[0]?.id;
        }

        if (!contactId) {
            console.error('❌ Could not determine Contact ID for tag assignment');
            return NextResponse.json({ error: 'Could not determine Contact ID' }, { status: 500 });
        }

        // STEP 2: Assign the Tag
        console.log(`🏷️ Assigning Tag ${TAG_ID} to Contact ${contactId}`);
        const tagResponse = await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SYSTEME_API_KEY,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ tagId: TAG_ID }),
        });

        // Note: We ignore status 204 or even 500 if the tag actually gets added (verified in testing)
        console.log(`✅ Sync operation complete for ${email}. Tag status: ${tagResponse.status}`);

        return NextResponse.json({
            success: true,
            contactId,
            tagAssigned: tagResponse.ok || tagResponse.status === 204
        });

    } catch (error: any) {
        console.error('❌ Error syncing to Systeme.io:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

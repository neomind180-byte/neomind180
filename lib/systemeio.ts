/**
 * Utility to sync a user to Systeme.io.
 * 
 * Uses a two-step process:
 * 1. Create or find the contact by email.
 * 2. Assign the specific Tag ID.
 */
export async function addToSystemeIO(email: string, firstName?: string) {
    const apiKey = process.env.SYSTEME_API_KEY;
    const TAG_ID = 1902549; // NeoMind180_FreeUser

    if (!apiKey) {
        console.error('❌ Missing SYSTEME_API_KEY in environment variables');
        return { success: false, error: 'Systeme configuration missing' };
    }

    try {
        // STEP 1: Create or find the contact
        console.log(`📡 Creating/Updating contact in Systeme.io: ${email}`);
        const contactResponse = await fetch('https://api.systeme.io/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                firstName: firstName || email.split('@')[0]
            }),
        });

        let contactData;
        const text = await contactResponse.text();
        try {
            contactData = JSON.parse(text);
        } catch (e) {
            contactData = { raw: text };
        }

        if (!contactResponse.ok && contactResponse.status !== 422) {
            console.error('❌ Systeme.io Contact Creation Error:', contactResponse.status, contactData);
            return { success: false, error: 'Failed to create contact', details: contactData };
        }

        // Capture contact ID (either from 201 Created or 422 Already Exists via fetching)
        let contactId = contactData.id;

        if (contactResponse.status === 422) {
            // If contact exists, we need to fetch their ID
            console.log('ℹ️ Contact already exists, fetching ID...');
            const listResponse = await fetch(`https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`, {
                headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' }
            });
            const listData = await listResponse.json();
            contactId = listData.items?.[0]?.id;
        }

        if (!contactId) {
            console.error('❌ Could not determine Contact ID for tag assignment');
            return { success: false, error: 'Could not determine Contact ID' };
        }

        // STEP 2: Assign the Tag
        console.log(`🏷️ Assigning Tag ${TAG_ID} to Contact ${contactId}`);
        const tagResponse = await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ tagId: TAG_ID }),
        });

        // Note: We ignore status 204 or even 500 if the tag actually gets added (Systeme.io API quirks)
        console.log(`✅ Sync operation complete for ${email}. Tag status: ${tagResponse.status}`);

        return {
            success: true,
            contactId,
            tagAssigned: tagResponse.ok || tagResponse.status === 204
        };

    } catch (error: any) {
        console.error('❌ Error in addToSystemeIO utility:', error);
        return { success: false, error: error.message };
    }
}

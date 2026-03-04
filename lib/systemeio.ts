/**
 * Utility to add a user to a Systeme.io contact list.
 * 
 * Required Environment Variables:
 * - SYSTEME_API_KEY: Your Systeme.io API key.
 * - SYSTEME_LIST_ID: The ID of the contact list to add users to.
 */

export async function addToSystemeIO(email: string, firstName: string, tags: string[] = ['free-user', 'neomind180-signup']) {
    const apiKey = process.env.SYSTEME_API_KEY;
    const listId = process.env.SYSTEME_LIST_ID;

    if (!apiKey || !listId) {
        console.error('❌ Missing Systeme.io configuration (SYSTEME_API_KEY or SYSTEME_LIST_ID)');
        return { success: false, error: 'Missing configuration' };
    }

    try {
        const response = await fetch('https://systeme.io/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                email: email,
                fields: [
                    { name: 'first_name', value: firstName }
                ],
                tags: tags,
            }),
        });

        const text = await response.text();
        console.log(`📡 Systeme.io Raw Response (${response.status}):`, text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { raw: text };
        }

        if (!response.ok) {
            console.error('❌ Systeme.io API error details:', {
                status: response.status,
                data: data,
                email: email
            });
            return { success: false, error: data };
        }

        console.log('✅ User added to Systeme.io:', email);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error calling Systeme.io API:', error);
        return { success: false, error };
    }
}

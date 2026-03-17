import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { addToSystemeIO } from '@/lib/systemeio';

export async function POST(request: Request) {
    try {
        const { email, password, fullName, phone, tier } = await request.json();

        if (!email || !password || !fullName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Initialize Supabase Admin/Client
        // We use the same env vars as the client for now, but on the server
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`👤 Processing registration for: ${email}`);

        // 2. Sign up the user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${new URL(request.url).origin}/login`,
                data: {
                    full_name: fullName,
                    phone: phone || '',
                    subscription_tier: tier || 'free',
                },
            },
        });

        if (authError) {
            console.error('❌ Supabase Auth Error:', authError.message);
            return NextResponse.json({ error: authError.message }, { status: authError.status || 500 });
        }

        // 2b. Manually ensure profile is updated (fallback in case trigger is slow or limited)
        if (authData.user) {
            await supabase.from('profiles').upsert({
                id: authData.user.id,
                full_name: fullName,
                phone: phone || '',
                subscription_tier: tier || 'free'
            });
        }

        // 3. Immediately Sync to Systeme.io (Don't wait for confirmation)
        // This ensures they hit the CRM even if they don't confirm immediately
        console.log(`📡 Syncing to Systeme.io: ${email}`);
        const systemeResult = await addToSystemeIO(email, fullName);

        if (!systemeResult.success) {
            // We don't fail the whole registration if CRM sync fails, but we log it
            console.warn('⚠️ Systeme.io sync failed during registration:', systemeResult.error);
        }

        return NextResponse.json({
            success: true,
            user: authData.user,
            systemeSync: systemeResult.success
        });

    } catch (error: any) {
        console.error('❌ Registration Route Exception:', error);
        return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
    }
}

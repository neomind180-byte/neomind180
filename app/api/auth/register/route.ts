import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { addToSystemeIO } from '@/lib/systemeio';

export async function POST(request: Request) {
    try {
        const { email, password, fullName, phone, tier, wantsOnboarding } = await request.json();

        if (!email || !password || !fullName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        console.log(`👤 Processing registration for: ${email}`);

        // Check trial lock if signing up for free tier
        const isFreeTrial = (tier || 'free') === 'free';
        const trialLockCode = `trial-used:${email.toLowerCase().trim()}`;
        if (isFreeTrial) {
            const { data: existingLock } = await supabaseAdmin
                .from('vouchers')
                .select('id')
                .eq('code', trialLockCode)
                .maybeSingle();

            if (existingLock) {
                return NextResponse.json(
                    { error: 'This email is not eligible for another free trial. Please register for a paid plan.' },
                    { status: 400 }
                );
            }
        }

        // 1. Initialize Supabase Admin/Client
        // We use the same env vars as the client for now, but on the server
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

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
            const trialExpiresAt = isFreeTrial
                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                : null;

            await supabaseAdmin.from('profiles').upsert({
                id: authData.user.id,
                email: email.toLowerCase().trim(),
                full_name: fullName,
                phone: phone || '',
                subscription_tier: tier || 'free',
                trial_expires_at: trialExpiresAt
            });

            // Lock the trial code if free trial
            if (isFreeTrial) {
                const { error: lockError } = await supabaseAdmin
                    .from('vouchers')
                    .insert({
                        code: trialLockCode,
                        tier: 'starter',
                        is_redeemed: true,
                        voucher_type: 'trial'
                    });
                if (lockError) {
                    console.error('⚠️ Failed to insert trial lock voucher:', lockError.message);
                }
            }
        }

        // 3. Conditionally Sync to Systeme.io based on user opt-in
        let systemeSyncSuccess = false;
        if (wantsOnboarding !== false) {
            console.log(`📡 Syncing to Systeme.io: ${email}`);
            const systemeResult = await addToSystemeIO(email, fullName);
            systemeSyncSuccess = systemeResult.success;

            if (!systemeResult.success) {
                // We don't fail the whole registration if CRM sync fails, but we log it
                console.warn('⚠️ Systeme.io sync failed during registration:', systemeResult.error);
            }
        } else {
            console.log(`📡 User opted out of Systeme.io onboarding: ${email}`);
        }

        return NextResponse.json({
            success: true,
            user: authData.user,
            systemeSync: systemeSyncSuccess
        });

    } catch (error: any) {
        console.error('❌ Registration Route Exception:', error);
        return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
    }
}

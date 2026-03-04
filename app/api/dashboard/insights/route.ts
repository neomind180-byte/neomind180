import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
    try {
        // 1. Authenticate user
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token || token === 'undefined') {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        // Create a dedicated supabase client for this request using the user's token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        // Verify the user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[Insights API] Auth error:', authError);
            return NextResponse.json({
                error: 'Unauthorized: Invalid token',
                details: authError?.message || 'Verification failed'
            }, { status: 401 });
        }

        // 2. Fetch User Profile
        // Since we're using the user's token, RLS will apply automatically
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        const subscriptionTier = profile?.subscription_tier || 'free';

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateString = thirtyDaysAgo.toISOString();

        // 3. Fetch Check-ins
        const { data: checkIns, error: checkInError } = await supabase
            .from('check_ins')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', dateString)
            .order('created_at', { ascending: true });

        if (checkInError) {
            console.error('Supabase query error (check_ins):', checkInError);
            return NextResponse.json({ error: 'Failed to fetch check-ins', details: checkInError }, { status: 500 });
        }

        // 4. Fetch Sessions (Completed ones)
        const { count: sessionCount, error: sessionError } = await supabase
            .from('neo_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('created_at', dateString);

        if (sessionError) {
            console.error('Supabase query error (neo_sessions):', sessionError);
        }

        // 5. Process Aggregations
        const totalCheckIns = checkIns?.length || 0;
        const alignedSteps = checkIns?.filter(c => c.aligned_step_taken).length || 0;
        const totalCompassion = checkIns?.reduce((acc, c) => acc + (c.self_compassion_rating || 0), 0) || 0;
        const avgCompassionValue = totalCheckIns > 0 ? (totalCompassion / totalCheckIns).toFixed(1) : '0';

        const stuckIndexHistory = (checkIns || []).map(c => ({
            date: new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value: c.stuck_in_head_index ?? 0
        }));

        const distributions = {
            mind: { noisy: 0, balanced: 0, clear: 0 },
            body: { tense: 0, neutral: 0, calm: 0 },
            energy: { low: 0, medium: 0, steady: 0 }
        };

        checkIns?.forEach(c => {
            if (c.mind_state) {
                const state = c.mind_state.toLowerCase();
                if (state in distributions.mind) distributions.mind[state as keyof typeof distributions.mind]++;
            }
            if (c.body_state) {
                const state = c.body_state.toLowerCase();
                if (state in distributions.body) distributions.body[state as keyof typeof distributions.body]++;
            }
            if (c.energy_level) {
                const state = c.energy_level.toLowerCase();
                if (state in distributions.energy) distributions.energy[state as keyof typeof distributions.energy]++;
            }
        });

        const formatDist = (obj: Record<string, number>) =>
            Object.entries(obj).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }));

        return NextResponse.json({
            subscriptionTier,
            metrics: {
                sessions: sessionCount || 0,
                checkIns: totalCheckIns,
                alignedSteps,
                avgCompassion: `${avgCompassionValue}/5`
            },
            stuckIndexHistory,
            mindDistribution: formatDist(distributions.mind),
            bodyDistribution: formatDist(distributions.body),
            energyDistribution: formatDist(distributions.energy)
        });

    } catch (error: any) {
        console.error('Insights API Catch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

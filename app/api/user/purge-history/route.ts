import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as publicSupabase } from '@/lib/supabaseClient';

// Use service role key for administrative actions (deleting data bypassing RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        // 1. Authenticate the user requesting deletion
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        // Verify the user's token
        const { data: { user }, error: authError } = await publicSupabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const userId = user.id;
        const { mode, ids } = await req.json();

        console.log(`🧹 Purging history for user: ${userId}, mode: ${mode}, count: ${ids ? ids.length : 0}`);

        if (mode === 'all') {
            // Delete all reflections for the user
            const { error: refError } = await supabaseAdmin
                .from('reflections')
                .delete()
                .eq('user_id', userId);

            if (refError) {
                console.error("[PurgeHistory] Error deleting reflections:", refError);
                throw refError;
            }

            // Delete all coach messages for the user
            const { error: coachError } = await supabaseAdmin
                .from('coach_messages')
                .delete()
                .eq('user_id', userId);

            if (coachError) {
                console.error("[PurgeHistory] Error deleting coach_messages:", coachError);
                throw coachError;
            }

        } else if (mode === 'selected' && Array.isArray(ids) && ids.length > 0) {
            // Delete selected reflections for the user
            const { error: refError } = await supabaseAdmin
                .from('reflections')
                .delete()
                .eq('user_id', userId)
                .in('id', ids);

            if (refError) {
                console.error("[PurgeHistory] Error deleting selected reflections:", refError);
                throw refError;
            }

            // Delete selected coach messages for the user
            const { error: coachError } = await supabaseAdmin
                .from('coach_messages')
                .delete()
                .eq('user_id', userId)
                .in('id', ids);

            if (coachError) {
                console.error("[PurgeHistory] Error deleting selected coach_messages:", coachError);
                throw coachError;
            }
        } else {
            return NextResponse.json({ error: 'Invalid mode or empty IDs array' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'History items successfully deleted' });

    } catch (error: any) {
        console.error("❌ Error in purge-history API:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

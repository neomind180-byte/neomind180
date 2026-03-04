import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as publicSupabase } from '@/lib/supabaseClient';

// Use service role key for administrative actions (deleting users)
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

        // 2. Delete User Data from all identified tables
        // Note: Ordering matters if there are foreign key constraints without CASCADE
        const tablesToDeleteFrom = [
            { name: 'check_ins', column: 'user_id' },
            { name: 'reflections', column: 'user_id' },
            { name: 'coach_messages', column: 'user_id' },
            { name: 'sessions', column: 'user_id' },
            { name: 'shifts', column: 'user_id' },
            { name: 'neo_sessions', column: 'user_id' },
            { name: 'circle_invites', column: 'created_by' },
            { name: 'profiles', column: 'id' }
        ];

        for (const table of tablesToDeleteFrom) {
            const { error: deleteError } = await supabaseAdmin
                .from(table.name)
                .delete()
                .eq(table.column, userId);

            if (deleteError) {
                console.error(`[DeleteAccount] Error deleting from ${table.name}:`, deleteError);
            }
        }

        // 3. Delete the user from Supabase Auth
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authDeleteError) {
            console.error(`[DeleteAccount] Error deleting user from Auth:`, authDeleteError);
            return NextResponse.json({ error: 'Failed to delete user account from Auth' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Account and data successfully deleted' });

    } catch (error: any) {
        console.error("❌ Error in delete-account API:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

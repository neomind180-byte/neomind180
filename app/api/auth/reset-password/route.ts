import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendTemporaryPasswordEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Missing Supabase admin credentials.');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Locate user in Supabase Auth
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            console.error('❌ Error listing users during password reset:', listError.message);
            return NextResponse.json({ error: 'Unable to process reset request at this time.' }, { status: 500 });
        }

        const targetUser = users.find(u => u.email?.toLowerCase().trim() === normalizedEmail);

        if (!targetUser) {
            // For security & privacy, return a friendly generic message
            return NextResponse.json({
                success: true,
                message: 'If an account exists for this email, a temporary password has been sent.'
            });
        }

        // 2. Generate a secure, user-friendly temporary password
        // Format: Mind-8xK2mP9!
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
        let randomPart = '';
        const bytes = crypto.randomBytes(8);
        for (let i = 0; i < 8; i++) {
            randomPart += chars[bytes[i] % chars.length];
        }
        const tempPassword = `Mind-${randomPart}!`;

        // 3. Update the user password in Supabase Auth
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUser.id,
            { password: tempPassword }
        );

        if (updateError) {
            console.error('❌ Failed to update password in auth:', updateError.message);
            return NextResponse.json({ error: 'Failed to set temporary password.' }, { status: 500 });
        }

        // 4. Retrieve user's name from profiles if available
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', targetUser.id)
            .maybeSingle();

        const userName = profile?.full_name || targetUser.user_metadata?.full_name || 'there';

        // 5. Deliver the email via TurboSMTP
        const emailResult = await sendTemporaryPasswordEmail(normalizedEmail, userName, tempPassword);

        if (!emailResult.success) {
            console.error('⚠️ Failed to dispatch temporary password email:', emailResult.error);
            return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'A temporary password has been sent to your email address.'
        });

    } catch (error: any) {
        console.error('❌ Exception in reset-password route:', error);
        return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
    }
}

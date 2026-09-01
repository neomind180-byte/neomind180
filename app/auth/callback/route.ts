import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle any error returned by Supabase (e.g. expired or invalid OTP)
    if (error || errorDescription) {
        console.error('⚠️ Supabase Auth Callback Error:', error, errorDescription);
        if (next.includes('reset-password')) {
            const redirectUrl = new URL('/forgot-password', origin);
            redirectUrl.searchParams.set('error', errorDescription || error || 'The reset link is invalid or has expired.');
            return NextResponse.redirect(redirectUrl.toString());
        }
        const redirectUrl = new URL('/login', origin);
        redirectUrl.searchParams.set('error', errorDescription || error || 'Authentication failed.');
        return NextResponse.redirect(redirectUrl.toString());
    }

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch (err) {
                            // Can be ignored if setAll is called from middleware or headers already sent
                            console.warn('Cookie set error in route handler:', err);
                        }
                    },
                },
            }
        );

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError) {
            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development';
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }

        console.error('❌ Failed to exchange code for session:', exchangeError.message);
        if (next.includes('reset-password')) {
            const redirectUrl = new URL('/forgot-password', origin);
            redirectUrl.searchParams.set('error', 'The reset link is invalid or has expired. Please request a new one.');
            return NextResponse.redirect(redirectUrl.toString());
        }
    }

    // Fallback if no code was provided
    return NextResponse.redirect(`${origin}/login?error=auth_callback_missing_code`);
}

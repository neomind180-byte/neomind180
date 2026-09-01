"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);
    const [hasValidSession, setHasValidSession] = useState(false);
    const sessionEstablishedRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            if (typeof window === 'undefined') return;

            try {
                // 1. Immediately inspect URL hash before anything can clear it
                if (window.location.hash && window.location.hash.startsWith('#')) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    
                    const hashError = hashParams.get('error_description') || hashParams.get('error');
                    if (hashError) {
                        if (isMounted) {
                            setError(decodeURIComponent(hashError.replace(/\+/g, ' ')));
                            setCheckingSession(false);
                            setHasValidSession(false);
                        }
                        return;
                    }

                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');

                    if (accessToken) {
                        const { data, error: setSessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || ''
                        });

                        if (!setSessionError && data?.session) {
                            sessionEstablishedRef.current = true;
                            if (isMounted) {
                                setHasValidSession(true);
                                setCheckingSession(false);
                            }
                            return;
                        }
                    }
                }

                // 2. Check query params for errors or PKCE code
                const searchParams = new URLSearchParams(window.location.search);
                const urlError = searchParams.get('error_description') || searchParams.get('error');
                if (urlError) {
                    if (isMounted) {
                        setError(decodeURIComponent(urlError.replace(/\+/g, ' ')));
                        setCheckingSession(false);
                        setHasValidSession(false);
                    }
                    return;
                }

                const code = searchParams.get('code');
                if (code) {
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (!exchangeError && data?.session) {
                        sessionEstablishedRef.current = true;
                        if (isMounted) {
                            setHasValidSession(true);
                            setCheckingSession(false);
                        }
                        return;
                    } else if (exchangeError) {
                        if (isMounted) {
                            setError('The password reset link is invalid or has expired. Please request a new one.');
                            setCheckingSession(false);
                            setHasValidSession(false);
                        }
                        return;
                    }
                }

                // 3. Check for existing session
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    sessionEstablishedRef.current = true;
                    if (isMounted) {
                        setHasValidSession(true);
                        setCheckingSession(false);
                    }
                    return;
                }

                // 4. Fallback timer if auth client is still hydrating asynchronously
                setTimeout(() => {
                    if (isMounted && !sessionEstablishedRef.current) {
                        setCheckingSession(false);
                    }
                }, 3500);

            } catch (err: any) {
                console.error('Session verification error:', err);
                if (isMounted && !sessionEstablishedRef.current) {
                    setError('Unable to verify reset session. Please request a new link.');
                    setCheckingSession(false);
                }
            }
        };

        // Listen for auth state change events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || (session && event === 'INITIAL_SESSION')) {
                sessionEstablishedRef.current = true;
                if (isMounted) {
                    setHasValidSession(true);
                    setCheckingSession(false);
                    setError(null);
                }
            }
        });

        initAuth();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100">

                {/* Logo at 60x60 */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-[60px] h-[60px] relative mb-4">
                        <Image
                            src="/business-logo.png"
                            alt="NeoMind180 Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                        Set New Password
                    </h1>
                    <p className="text-base text-slate-400 mt-2 font-medium">
                        Choose a strong password for your account.
                    </p>
                </div>

                {/* Checking session state */}
                {checkingSession && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00538e]" />
                        <p className="text-sm font-medium text-slate-500">
                            Verifying your secure reset link...
                        </p>
                    </div>
                )}

                {/* Invalid or Expired Session */}
                {!checkingSession && !hasValidSession && (
                    <div className="space-y-6">
                        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-center space-y-2">
                            <div className="flex justify-center text-red-500 mb-1">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">
                                Session Invalid or Expired
                            </h3>
                            <p className="text-xs text-red-600 font-medium">
                                {error || "Your password reset session is missing or has expired. Password reset links are valid for single use only."}
                            </p>
                        </div>

                        <Link
                            href="/forgot-password"
                            className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-[13px] hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Request New Reset Link
                        </Link>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-xs text-slate-400 font-medium hover:text-[#00538e] transition-colors"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Return to Login
                            </Link>
                        </div>
                    </div>
                )}

                {/* Valid Session - Render Password Form */}
                {!checkingSession && hasValidSession && (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-widest">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-2xl text-center flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Password updated! Redirecting to login...
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {/* Password Field */}
                            <div className="space-y-1">
                                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00538e] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-1">
                                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                    Confirm Password
                                </label>
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-base"
                                />
                            </div>

                            {/* Primary CTA with Loading State */}
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-[14px] hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-[14px] text-slate-400 font-medium">
                            Remember your password? <Link href="/login" className="text-[#00538e] font-bold hover:underline text-base">Log In</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

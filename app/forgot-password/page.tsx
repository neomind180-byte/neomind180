"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
            setEmail('');

        } catch (err: any) {
            setError(err.message || "Failed to send reset email");
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
                        Reset Password
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 font-medium">
                        Enter your email to receive a reset link.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-2xl text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Reset link sent! Check your email.
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Primary CTA with Loading State */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>

                <div className="mt-8 space-y-3">
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium hover:text-[#00538e] transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Login
                    </Link>

                    <p className="text-center text-xs text-slate-400 font-medium">
                        Don't have an account? <Link href="/register" className="text-[#00538e] font-bold hover:underline">Start free.</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

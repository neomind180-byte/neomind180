"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Loader2, CheckCircle2, ArrowLeft, KeyRound, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlError = params.get('error');
            if (urlError) {
                setError(urlError);
            }
        }
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to request temporary password');
            }

            setSubmittedEmail(email);
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
                <div className="flex flex-col items-center text-center mb-8">
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
                        {success ? "Password Sent!" : "Reset Password"}
                    </h1>
                    <p className="text-base text-slate-400 mt-2 font-medium">
                        {success
                            ? "Check your inbox for your login details."
                            : "Enter your email to receive a temporary login password."}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-green-50/80 border border-green-200/60 rounded-3xl text-center space-y-3">
                            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto text-green-600">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                Temporary Password Dispatched
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                We generated a secure temporary password and emailed it to <span className="font-bold text-slate-900">{submittedEmail}</span>.
                            </p>
                            <div className="pt-2 text-[11px] text-slate-400 font-medium border-t border-green-200/50">
                                💡 Tip: Check your spam/junk folder if it doesn't appear in 1 minute.
                            </div>
                        </div>

                        <Link
                            href="/login"
                            className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-[14px] hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                        >
                            Proceed to Log In <ArrowRight className="w-4 h-4" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setSuccess(false)}
                            className="w-full text-center text-xs text-slate-400 font-medium hover:text-[#00538e] transition-colors"
                        >
                            Need to send to a different email? Click here
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-4">
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
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-base font-medium"
                                />
                            </div>
                        </div>

                        {/* Primary CTA with Loading State */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-[14px] hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Password...
                                </>
                            ) : (
                                "Send Temporary Password"
                            )}
                        </button>
                    </form>
                )}

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

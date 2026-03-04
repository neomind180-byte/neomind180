"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tier from URL (default to 'free' if missing)
  const selectedTier = searchParams.get('tier') || 'free';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Friendly names for the tiers
  const tierNames: Record<string, string> = {
    free: 'Basic Self-Help',
    tier2: 'Coaching Access',
    tier3: 'Deep Coaching'
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            subscription_tier: selectedTier, // This is sent to the DB trigger
          },
        },
      });

      if (authError) throw authError;

      // Successful registration
      setShowSuccess(true);

    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-[3rem] shadow-xl p-10 border border-[var(--border)] text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-[#00538e]/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#00538e]" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
          Check Your Email
        </h2>
        <p className="text-[15px] text-[var(--text-muted)] font-medium leading-relaxed mb-8">
          We've sent a verification link to <span className="text-[#00538e] font-bold">{formData.email}</span>.
          Please click the link to confirm your account and start your journey.
        </p>
        <Link
          href="/login"
          className="inline-block w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-[14px] hover:shadow-2xl transition-all"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-[var(--bg-card)] rounded-[3rem] shadow-xl p-10 border border-[var(--border)]">

      {/* Header & Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-[60px] h-[60px] relative mb-4 bg-white rounded-xl p-1 shadow-sm">
          <Image
            src="/business-logo.png"
            alt="NeoMind180 Logo"
            width={60}
            height={60}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
          Start Your Journey
        </h1>

        {/* Selected Tier Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-input)] rounded-full border border-[var(--border)]">
          <CheckCircle2 className="w-4 h-4 text-[#00538e]" />
          <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Plan: <span className="text-[#00538e]">{tierNames[selectedTier] || 'Basic'}</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[14px] font-bold rounded-2xl text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Full Name</label>
          <input
            type="text"
            required
            placeholder="Jane Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-6 py-4 bg-[var(--bg-input)] rounded-2xl outline-none border border-[var(--border)] focus:border-[#00538e] transition-all text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-dim)]"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Email Address</label>
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-6 py-4 bg-[var(--bg-input)] rounded-2xl outline-none border border-[var(--border)] focus:border-[#00538e] transition-all text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-dim)]"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-6 py-4 bg-[var(--bg-input)] rounded-2xl outline-none border border-[var(--border)] focus:border-[#00538e] transition-all text-base text-[var(--text-primary)] placeholder:text-[var(--text-dim)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[#00538e] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Confirm Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-6 py-4 bg-[var(--bg-input)] rounded-2xl outline-none border border-[var(--border)] focus:border-[#00538e] transition-all text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-[14px] hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</> : "Create Account"}
        </button>

      </form>

      <p className="mt-8 text-center text-[14px] text-[var(--text-muted)] font-medium">
        Already a member? <Link href="/login" className="text-[#00538e] font-bold hover:underline text-base">Log In</Link>
      </p>
    </div>
  );
}

// Wrapper for Suspense to handle useSearchParams in Next.js
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 font-sans">
      <Suspense fallback={<div className="text-[#00538e] font-bold">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
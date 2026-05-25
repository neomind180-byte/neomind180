"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any stale local storage or cookies related to Supabase to prevent auth/token conflicts
    try {
      // 1. Clear all localStorage keys starting with sb-
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      }
      
      // 2. Clear all cookies starting with sb-
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.startsWith('sb-')) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname.split('.').slice(-2).join('.') + ';';
        }
      }
    } catch (e) {
      console.error('Error clearing stale auth state:', e);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Successful login - send to dashboard
      router.push('/dashboard');
      router.refresh();

    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-[3rem] shadow-xl p-10 border border-[var(--border)]">

        {/* Logo at 60x60 */}
        <div className="flex flex-col items-center text-center mb-10">
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
            Welcome Back
          </h1>
          <p className="text-base text-[var(--text-muted)] mt-2 font-medium">
            Resume your path to clarity.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[14px] font-bold rounded-2xl text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-6 py-4 bg-[var(--bg-input)] rounded-2xl outline-none border border-[var(--border)] focus:border-[#00538e] transition-all text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-dim)]"
            />
          </div>

          {/* Password Field with Eye Toggle and Forgot Link */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-4">
              <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[12px] font-bold text-[#00538e] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          {/* Primary CTA with Loading State */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-[14px] hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[14px] text-[var(--text-muted)] font-medium">
          Don’t have an account? <Link href="/register" className="text-[#00538e] font-bold hover:underline text-base">Start free.</Link>
        </p>
      </div>
    </div>
  );
}
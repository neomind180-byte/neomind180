"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling visibility
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* BRAND BLOCK */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Logo className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-black text-[#00538e] tracking-tight">NeoMind180</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Welcome back to your center.</p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00538e]/10 outline-none text-slate-800 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-bold text-[#00538e] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Dynamic type
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00538e]/10 outline-none text-slate-800 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00538e] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none mt-4"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#00538e] font-black hover:underline underline-offset-4">
              Join NeoMind180
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
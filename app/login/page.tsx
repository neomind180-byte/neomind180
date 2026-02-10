"use client";

import { useState } from 'react';
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
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Resume your path to clarity.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
              Email Address
            </label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com" 
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          {/* Password Field with Eye Toggle and Forgot Link */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-bold text-[#00538e] hover:underline opacity-70"
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
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm"
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

          {/* Primary CTA with Loading State */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Don’t have an account? <Link href="/register" className="text-[#00538e] font-bold hover:underline">Start free.</Link>
        </p>
      </div>
    </div>
  );
}
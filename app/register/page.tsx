"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            Start Your Journey
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Join as a Basic Self-Help member today.
          </p>
        </div>

        <form className="space-y-6">
          {/* Full Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
              Email Address
            </label>
            <input 
              type="email" 
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
              <Link href="/forgot-password" title="Recover your password" className="text-[10px] font-bold text-[#00538e] hover:underline opacity-70">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
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

          {/* Confirm Password Field with Eye Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
              Confirm Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00538e] transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <button className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:shadow-2xl transition-all">
            Create Free Account
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Already a member? <Link href="/login" className="text-[#00538e] font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
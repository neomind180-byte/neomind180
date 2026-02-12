"use client";

import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export default function FeatureLockedPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      
      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Lock className="w-10 h-10 text-[#F39904]" />
      </div>

      <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
        Feature Locked
      </h1>
      
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-10 text-sm font-medium">
        This tool requires a higher coaching tier. Upgrade to access direct support, AI reflections, or 1:1 sessions.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link 
          href="/pricing" 
          className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-xl transition-all flex items-center justify-center"
        >
          View Upgrade Options
        </Link>
        <Link 
          href="/dashboard" 
          className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-bold uppercase text-xs tracking-widest hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center"
        >
          Maybe Later
        </Link>
      </div>

    </div>
  );
}
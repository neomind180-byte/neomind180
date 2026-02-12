"use client";

import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function FeatureLockedPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">

      <div className="w-24 h-24 bg-[#F39904]/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-[#F39904]/20 shadow-2xl shadow-[#F39904]/10">
        <Lock className="w-10 h-10 text-[#F39904]" />
      </div>

      <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
        Expansion Required
      </h1>

      <p className="text-[#94a3b8] max-w-sm mx-auto leading-relaxed mb-12 text-sm font-medium italic">
        This tool requires a higher coaching tier. Upgrade to access direct support, AI reflections, or 1:1 sessions.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/pricing"
          className="flex-1 py-5 bg-[#00538e] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-2xl shadow-[#00538e]/20 transition-all flex items-center justify-center hover:-translate-y-1"
        >
          View Upgrade Options
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 py-5 bg-[#232938] border border-[#2d3548] text-[#475569] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:border-[#94a3b8] hover:text-[#94a3b8] transition-all flex items-center justify-center"
        >
          Return Home
        </Link>
      </div>

    </div>
  );
}
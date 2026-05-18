"use client";

import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';

export default function DeprecatedSessionsPage() {
  return (
    <div className="h-full min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 bg-[var(--bg-primary)]">
      <div className="w-24 h-24 bg-[#E67E22]/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-[#E67E22]/20 shadow-2xl shadow-[#E67E22]/10">
        <Star className="w-10 h-10 text-[#E67E22]" />
      </div>

      <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
        1:1 Coaching Sessions
      </h1>

      <p className="text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed mb-12 text-base font-medium italic">
        We have retired 1:1 Live Sessions to double down on our daily AI reflection model and direct Ask-the-Coach async support.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/dashboard"
          className="flex-grow py-5 bg-[#00538e] text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] hover:shadow-2xl shadow-[#00538e]/20 transition-all flex items-center justify-center hover:-translate-y-1"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
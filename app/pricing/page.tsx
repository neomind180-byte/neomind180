"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const [currency, setCurrency] = useState<'USD' | 'ZAR'>('USD');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00538e] transition-colors font-bold uppercase text-xs tracking-widest mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#00538e] uppercase tracking-tighter">
            Choose Your Support
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            From self-guided clarity to deep 1:1 coaching. Upgrade or downgrade anytime.
          </p>

          {/* Currency Toggle */}
          <div className="flex justify-center pt-4">
            <div className="bg-slate-100 p-1.5 rounded-full inline-flex items-center">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${currency === 'USD'
                  ? 'bg-white text-[#00538e] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('ZAR')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${currency === 'ZAR'
                  ? 'bg-white text-[#00538e] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                ZAR (R)
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">

          {/* Tier 1: Free */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Basic Self-Help</h3>
            <div className="my-6">
              <span className="text-4xl font-black text-[#00538e]">Free</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-8 min-h-[40px]">
              Essential tools for daily grounding and self-observation.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Daily Check-In Tool",
                "Mindfulness Audio Library",
                "beEnough Socratic Journal",
                "Basic Progress Tracking"
              ].map((feature, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                  <Check className="w-5 h-5 text-[#0AA390] shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/register?tier=free" className="block w-full py-4 rounded-2xl border-2 border-[#00538e] text-[#00538e] font-bold text-center uppercase text-xs tracking-widest hover:bg-[#00538e] hover:text-white transition-all">
              Start Free
            </Link>
          </div>

          {/* Tier 2: Coaching Access ($19) */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-[#00538e] shadow-xl relative transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-[#00538e] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl rounded-tr-[2.3rem]">
              Most Popular
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Coaching Access</h3>
            <div className="my-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#00538e]">
                {currency === 'USD' ? '$19' : 'R350'}
              </span>
              <span className="text-slate-400 font-bold uppercase text-xs">/month</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-8 min-h-[40px]">
              Group support and AI coaching to keep you moving forward.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Everything in Free Tier",
                "Group Coaching Events (Circles)",
                "Async Coach Chat (Text)",
                "Daily AI Reflection (8 msgs/day)"
              ].map((feature, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 font-bold">
                  <Check className="w-5 h-5 text-[#00538e] shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/register?tier=tier2" className="block w-full py-4 rounded-2xl bg-[#00538e] text-white font-bold text-center uppercase text-xs tracking-widest hover:shadow-lg transition-all">
              Join Coaching Access
            </Link>
          </div>

          {/* Tier 3: Deep Coaching ($79) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Deep Coaching</h3>
            <div className="my-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#00538e]">
                {currency === 'USD' ? '$79' : 'R1400'}
              </span>
              <span className="text-slate-400 font-bold uppercase text-xs">/month</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-8 min-h-[40px]">
              High-touch 1:1 guidance for profound transformation.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Everything in Coaching Access",
                "2 × 1:1 Sessions per Month",
                "Priority Coach Support",
                "Extended AI Reflection (16 msgs/day)"
              ].map((feature, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                  <Check className="w-5 h-5 text-[#0AA390] shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/register?tier=tier3" className="block w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold text-center uppercase text-xs tracking-widest hover:border-[#00538e] hover:text-[#00538e] transition-all">
              Apply for Deep Coaching
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
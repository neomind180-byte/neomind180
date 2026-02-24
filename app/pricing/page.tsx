"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const [currency, setCurrency] = useState<'USD' | 'ZAR'>('USD');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-secondary)] py-12 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[#00538e] transition-colors font-black uppercase text-[10px] tracking-[0.2em] mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
            Choose Your Support
          </h1>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto text-lg font-medium italic">
            From self-guided clarity to deep 1:1 coaching. Upgrade or downgrade anytime.
          </p>

          {/* Currency Toggle */}
          <div className="flex justify-center pt-4">
            <div className="bg-[var(--bg-input)] p-1.5 rounded-full inline-flex items-center border border-[var(--border)]">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currency === 'USD'
                  ? 'bg-[#00538e] text-white shadow-lg'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                  }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('ZAR')}
                className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currency === 'ZAR'
                  ? 'bg-[#00538e] text-white shadow-lg'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                  }`}
              >
                ZAR (R)
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">

          {/* Tier 1: Free */}
          <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border)] shadow-xl shadow-[var(--shadow-color)] hover:-translate-y-1 transition-all">
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Basic Self-Help</h3>
            <div className="my-8">
              <span className="text-5xl font-black text-[#00538e]">Free</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-medium mb-10 min-h-[40px] italic">
              Essential tools for daily grounding and self-observation.
            </p>
            <ul className="space-y-5 mb-10">
              {[
                "Daily Check-In Tool",
                "Mindfulness Audio Library",
                "beEnough Socratic Journal",
                "Basic Progress Tracking"
              ].map((feature, i) => (
                <li key={i} className="flex gap-4 text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-tight">
                  <Check className="w-5 h-5 text-[#0AA390] shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/register?tier=free" className="block w-full py-5 rounded-2xl border-2 border-[#00538e] text-[#00538e] font-black uppercase text-[10px] tracking-[0.2em] text-center hover:bg-[#00538e] hover:text-white transition-all">
              Start Free
            </Link>
          </div>

          {/* Tier 2: Coaching Access ($19) */}
          <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border-2 border-[#00538e] shadow-2xl relative transform md:-translate-y-6">
            <div className="absolute top-0 right-0 bg-[#00538e] text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-bl-3xl rounded-tr-[2.9rem]">
              Most Popular
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Coaching Access</h3>
            <div className="my-8 flex items-baseline gap-2">
              <span className="text-5xl font-black text-[#00538e]">
                {currency === 'USD' ? '$19' : 'R350'}
              </span>
              <span className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest">/month</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-medium mb-10 min-h-[40px] italic">
              Group support and AI coaching to keep you moving forward.
            </p>
            <ul className="space-y-5 mb-10">
              {[
                "Everything in Free Tier",
                "Group Coaching Events (Circles)",
                "Async Coach Chat (Text)",
                "Daily AI Reflection (8 msgs/day)"
              ].map((feature, i) => (
                <li key={i} className="flex gap-4 text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-tight">
                  <Check className="w-5 h-5 text-[#00538e] shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/register?tier=tier2" className="block w-full py-5 rounded-2xl bg-[#00538e] text-white font-black uppercase text-[10px] tracking-[0.2em] text-center hover:shadow-2xl shadow-[#00538e]/40 transition-all hover:-translate-y-0.5">
              Join Coaching Access
            </Link>
          </div>

          {/* Tier 3: Deep Coaching ($79) */}
          <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border)] shadow-xl shadow-[var(--shadow-color)] hover:-translate-y-1 transition-all">
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Deep Coaching</h3>
            <div className="my-8 flex items-baseline gap-2">
              <span className="text-5xl font-black text-[#00538e]">
                {currency === 'USD' ? '$79' : 'R1400'}
              </span>
              <span className="text-[var(--text-muted)] font-black uppercase text-[10px] tracking-widest">/month</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-medium mb-10 min-h-[40px] italic">
              High-touch 1:1 guidance for profound transformation.
            </p>
            <ul className="space-y-5 mb-10">
              {[
                "Everything in Coaching Access",
                "2 × 1:1 Sessions per Month",
                "Priority Coach Support",
                "Extended AI Reflection (16 msgs/day)"
              ].map((feature, i) => (
                <li key={i} className="flex gap-4 text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-tight">
                  <Check className="w-5 h-5 text-[#0AA390] shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/register?tier=tier3" className="block w-full py-5 rounded-2xl border-2 border-[var(--border)] text-[var(--text-dim)] font-black uppercase text-[10px] tracking-[0.2em] text-center hover:border-[#00538e] hover:text-[#00538e] transition-all">
              Apply for Deep Coaching
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
"use client";

import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* --- NAVIGATION --- */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <span className="font-bold text-xl tracking-tight text-[#00538e]">NeoMind180</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-[#00538e]">Log in</Link>
          <Link href="/register" className="bg-[#00538e] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#004272] transition">
            Start Free
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#0AA390] uppercase mb-4 block">Mindset Coaching</span>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] mb-8">
          Rethink. Rewire.<br />
          <span className="text-[#00538e]">Renew.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Move from overthinking to clarity. AI-powered coaching that helps you become a calm, confident observer of your thoughts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-[#00538e] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition">Start Free</Link>
          <Link href="/pricing" className="bg-slate-100 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition">View Pricing</Link>
        </div>
      </header>

      {/* --- 5-PHASE JOURNEY --- */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">The 5-Phase Journey</h2>
            <p className="text-slate-500">Each 20-minute session guides you through a transformative process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { title: "Breathe", sub: "Calm your nervous system", color: "hover:border-[#00538e]" },
              { title: "Notice", sub: "Create distance from thoughts", color: "hover:border-[#0AA390]" },
              { title: "Separate", sub: "Thoughts are not facts", color: "hover:border-[#F39904]" },
              { title: "Understand", sub: "Work with compassion", color: "hover:border-[#993366]" },
              { title: "Choose", sub: "Take aligned action", color: "hover:border-[#00538e]" },
            ].map((phase, i) => (
              <button key={i} className={`bg-white p-6 rounded-2xl border-2 border-transparent shadow-sm transition-all text-left ${phase.color}`}>
                <span className="text-[10px] font-bold text-slate-400 block mb-2">PHASE 0{i+1}</span>
                <h3 className="font-bold text-xl text-slate-800 mb-1">{phase.title}</h3>
                <p className="text-xs text-slate-500">{phase.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- TWO COLUMN SECTION --- */}
      <section className="py-24 px-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-black text-slate-900 leading-tight">Your AI companion for <br /><span className="text-[#0AA390]">mental clarity</span></h2>
          <p className="text-lg text-slate-600 leading-relaxed">Designed for busy professional women who want to break free from overthinking and make decisions with confidence and compassion.</p>
          <ul className="space-y-4">
            {["Up to 12 deep-dive AI sessions/month", "Daily mindset check-ins", "Guided micro-resets", "Personal insights & trends", "Three coaching styles"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 font-medium text-slate-700">
                <svg className="w-5 h-5 text-[#0AA390]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="rounded-[40px] overflow-hidden shadow-2xl mb-8">
            <img src="/hero-woman.jpg" alt="Woman sitting on grass" className="w-full h-[500px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-xs transform rotate-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#F39904] rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
              <h4 className="font-bold text-sm">Daily Check-in</h4>
            </div>
            <p className="text-xs text-slate-600 italic">"How are you feeling in this moment?"</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-xl text-[#00538e]">NeoMind180</span>
            </div>
            <p className="text-sm text-slate-500">Mindset coaching for clarity, not therapy. Seek professional help for mental health concerns.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Secure Payments</h4>
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-300 text-xl tracking-tighter">PayFast</span>
              <p className="text-[11px] text-slate-500">Secure payments powered by PayFast. ZAR pricing.</p>
            </div>
          </div>
          <div className="text-right md:self-end text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            © 2026 NeoMind180
          </div>
        </div>
      </footer>
    </div>
  );
}
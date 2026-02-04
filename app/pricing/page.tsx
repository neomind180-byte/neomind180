"use client";

import Link from 'next/link';
import { Logo } from '@/components/Logo'; // Added this import

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- NAVIGATION --- */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-[#00538e]">NeoMind180</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#00538e]">Back to Dashboard</Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">Choose Your Plan</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Start with my free tier and upgrade when you're ready for deeper work.
          </p>
        </div>

        {/* --- PRICING GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* COLUMN 1: BASIC */}
          <div className="p-8 rounded-[32px] border-2 border-slate-100 flex flex-col hover:border-[#0AA390] transition-colors group">
            <h3 className="text-xl font-bold mb-1 text-[#0AA390]">Basic Self-Help</h3>
            <div className="text-4xl font-black mb-1">Free</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 italic">Self-guided exploration</p>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {["1 AI coaching session/month", "Daily check-ins", "Up to 2 micro-resets/day", "Basic insights only", "Single coach mode", "Community access"].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <svg className="w-4 h-4 text-[#0AA390]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="w-full py-4 rounded-xl font-black text-center bg-slate-100 text-slate-400 uppercase text-xs tracking-widest">
              Current Plan
            </div>
          </div>

          {/* COLUMN 2: MONTHLY */}
          <div className="p-8 rounded-[32px] border-2 border-[#00538e] shadow-xl shadow-indigo-50 flex flex-col relative scale-105 z-10 bg-white">
            <h3 className="text-xl font-bold mb-1 text-[#00538e]">Monthly</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black">R199</span>
              <span className="text-slate-400 font-bold">/month</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 italic">For consistent growth</p>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {["Up to 12 AI sessions/month", "Daily check-ins", "All micro-resets", "Full insights & trends", "All coach modes", "Email support"].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <svg className="w-4 h-4 text-[#00538e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-xl font-black bg-[#00538e] text-white hover:bg-[#004272] transition-colors">
              Get Monthly
            </button>
          </div>

          {/* COLUMN 3: YEARLY */}
          <div className="p-8 rounded-[32px] border-2 border-slate-100 flex flex-col hover:border-[#993366] transition-colors relative">
            <span className="absolute -top-4 right-8 bg-[#F39904] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Best Value
            </span>
            <h3 className="text-xl font-bold mb-1 text-[#993366]">Yearly</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black">R1,999</span>
              <span className="text-slate-400 font-bold">/year</span>
            </div>
            <p className="text-xs font-bold text-[#F39904] uppercase tracking-widest mb-6 italic">2 months free</p>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {["Everything in Monthly", "Up to 12 AI sessions/month", "Weekly community circles", "Book human coach sessions", "Advanced analytics", "Early feature access"].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <svg className="w-4 h-4 text-[#993366]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-xl font-black bg-[#993366] text-white hover:bg-[#7a2852] transition-colors">
              Get Yearly
            </button>
          </div>
        </div>

        {/* --- DESCRIPTIVE TEXT --- */}
        <div className="max-w-3xl mx-auto bg-slate-50 p-8 rounded-3xl mb-20">
          <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-3">What's a full AI coaching session?</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            A 20-minute guided conversation through our 5-phase flow (<span className="font-bold text-[#00538e]">Breathe</span> → <span className="font-bold text-[#0AA390]">Notice</span> → <span className="font-bold text-[#F39904]">Separate</span> → <span className="font-bold text-[#993366]">Understand</span> → <span className="font-bold text-[#00538e]">Choose</span>). Daily check-ins and micro-resets don't count toward your session limit.
          </p>
        </div>

        {/* --- COMMUNITY CTA --- */}
        <section className="max-w-5xl mx-auto bg-gradient-to-br from-[#00538e] to-[#004272] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-[#F39904] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Yearly plan exclusive
              </div>
              <h2 className="text-4xl font-black leading-tight">Weekly Community Circles</h2>
              <p className="text-indigo-100 leading-relaxed">
                Join our safe-space live group sessions on our secure online meeting platform. A 45–60 minute virtual gathering focused on calm, clarity, and shared reflection — facilitated by the coach.
              </p>
              <div className="space-y-2 pt-4 border-t border-white/20">
                <div className="flex items-center gap-3 font-bold">
                  <svg className="w-5 h-5 text-[#F39904]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                  Time will be confirmed by invite
                </div>
                <p className="text-xs text-indigo-200">Links are sent by email to eligible yearly members.</p>
              </div>
            </div>
            <div className="flex justify-center">
               <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-3xl border border-white/20">
                  <Logo className="w-32 h-32 bg-white rounded-3xl p-4 shadow-2xl" />
               </div>
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-[#00538e]">NeoMind180</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Mindset coaching for clarity, not therapy. Seek professional help for mental health concerns.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Payment Security</h4>
            <div className="flex items-center gap-4">
               <span className="font-black text-slate-300 text-xl tracking-tighter">PayFast</span>
               <p className="text-[11px] text-slate-500 font-medium leading-tight">
                 Secure payments powered by PayFast.<br />
                 Cancel anytime • No hidden fees • ZAR pricing
               </p>
            </div>
          </div>

          <div className="space-y-4 text-right md:self-end">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              © 2026 NeoMind180
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
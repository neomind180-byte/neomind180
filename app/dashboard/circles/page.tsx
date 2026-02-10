"use client";

import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Sparkles, 
  Calendar, 
  CheckCircle2,
  Video
} from 'lucide-react';

export default function DeepDiveCirclesPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-16">
        
        {/* Navigation & Header [cite: 27-38] */}
        <header className="space-y-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00538e] transition-colors font-bold uppercase text-[10px] tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#0AA390]/10 rounded-3xl">
                <Users className="w-8 h-8 text-[#0AA390]" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter leading-none">
                  Deep-Dive Circles
                </h1>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">
                  Live Collective Resets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0AA390]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#0AA390] w-fit">
              <CheckCircle2 className="w-3 h-3" /> Tier 2/3 Access
            </div>
          </div>
        </header>

        {/* Feature Overview  */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              A Space for Collective Clarity
            </h2>
            <p className="text-slate-600 leading-relaxed">
              I meet when the collective energy is right. These are not rigid, scheduled lectures; 
              they are live, responsive sessions designed to help you rethink your current 
              patterns and rewire your mindset alongside a community of like-minded women.
            </p>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start">
              <Mail className="w-5 h-5 text-[#00538e] mt-1 shrink-0" />
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                <strong className="text-slate-900">Announcement Logic:</strong> 
                I announce each session via email exactly one week before we gather. 
                Keep an eye on your inbox for your private access link and session themes.
              </p>
            </div>
          </div>
          
          <div className="bg-[#00538e] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <Sparkles className="absolute -top-6 -right-6 w-32 h-32 opacity-10" />
            <h3 className="text-lg font-black uppercase tracking-tighter mb-6">What to expect</h3>
            <ul className="space-y-5">
              {[
                "Live 180° shift exercises guided by me",
                "Community Q&A and shared reflections",
                "Immediate grounding tools for your week",
                "A recording available for 7 days post-session"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#0AA390]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Status Widget  */}
        <section className="bg-white border-2 border-slate-100 p-8 md:p-12 rounded-[3rem] text-center space-y-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Next Session Status</h3>
          <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Awaiting Announcement
          </p>
          <p className="text-sm text-slate-500 max-w-md mx-auto italic">
            "I will send an email invitation with the date, time, and private access link when the next circle is ready to form."
          </p>
        </section>

        {/* Footer Branding [cite: 73, 74] */}
        <footer className="pt-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
            NeoMind180 — Clarity, not therapy
          </p>
          <p className="text-[10px] text-slate-300 uppercase mt-2">© 2024 NeoMind180</p>
        </footer>
      </div>
    </div>
  );
}
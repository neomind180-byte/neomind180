"use client";

import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Video, 
  Clock, 
  Star, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function SessionsPage() {
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
              <div className="p-4 bg-[#00538e]/10 rounded-3xl">
                <Star className="w-8 h-8 text-[#00538e]" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter leading-none">
                  1:1 Sessions
                </h1>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">
                  Exclusive Deep Coaching
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0AA390]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#0AA390] w-fit">
              <CheckCircle2 className="w-3 h-3" /> Tier 3 Active
            </div>
          </div>
        </header>

        {/* Tier 3 Benefits Overview [cite: 131-134] */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-3">
            <Clock className="w-6 h-6 text-[#00538e]" />
            <h3 className="font-black uppercase text-xs tracking-widest text-slate-900">Monthly Time</h3>
            <p className="text-sm text-slate-500 leading-relaxed">2 × 60-minute deep-dive online sessions per month.</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-3">
            <Video className="w-6 h-6 text-[#00538e]" />
            <h3 className="font-black uppercase text-xs tracking-widest text-slate-900">Virtual Room</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Private, secure video space for our transformative work.</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-3">
            <Calendar className="w-6 h-6 text-[#00538e]" />
            <h3 className="font-black uppercase text-xs tracking-widest text-slate-900">Flexible Booking</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Book your sessions up to 30 days in advance.</p>
          </div>
        </section>

        {/* Scheduling Logic [cite: 136, 161] */}
        <section className="bg-white border-2 border-slate-100 p-8 md:p-12 rounded-[3.5rem] shadow-sm flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-grow space-y-6 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Ready for your next shift?
            </h2>
            <p className="text-slate-500 max-w-md leading-relaxed">
              Select a time that allows you to be fully present. We will use this hour to rewire 
              complex patterns and move toward aligned action.
            </p>
            <button className="px-10 py-5 bg-[#00538e] text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 mx-auto md:mx-0">
              Open Schedule <ExternalLink className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-full md:w-80 bg-slate-50 rounded-[2.5rem] p-8 space-y-6">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Remaining This Month</h4>
            <div className="flex justify-center items-baseline gap-2">
              <span className="text-6xl font-black text-[#00538e]">2</span>
              <span className="text-slate-400 font-bold uppercase text-xs">Sessions</span>
            </div>
            <div className="pt-4 border-t border-slate-200 text-center">
              <p className="text-[10px] text-[#0AA390] font-black uppercase tracking-widest">Plan: Deep Coaching</p>
            </div>
          </div>
        </section>

        {/* History Stub */}
        <section className="space-y-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4">Session History</h3>
          <div className="bg-white border border-slate-50 rounded-[2.5rem] p-12 text-center">
            <p className="text-sm text-slate-300 italic font-medium">Your upcoming and past session details will be recorded here.</p>
          </div>
        </section>

        {/* Footer Branding [cite: 73-74] */}
        <footer className="pt-12 pb-6 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-300">
            NeoMind180 — Confident Observation
          </p>
          <p className="text-[9px] text-slate-300 uppercase mt-4">© 2024 NeoMind180</p>
        </footer>
      </div>
    </div>
  );
}
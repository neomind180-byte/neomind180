"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, Brain, Sparkles, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00538e]/10">
      
      {/* 1. Header with Logo Restored */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 flex-shrink min-w-0">
            <Brain className="w-6 h-6 text-[#00538e] flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl font-black text-[#00538e] uppercase tracking-tighter truncate">
              NeoMind180
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
            <Link 
              href="/login" 
              className="text-[10px] sm:text-xs font-black uppercase text-slate-400 hover:text-[#00538e] transition-colors px-1"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 sm:px-6 sm:py-3 bg-[#00538e] text-white text-[10px] sm:text-xs font-black uppercase rounded-full hover:shadow-xl transition-all whitespace-nowrap"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with New Copy */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <Sparkles className="w-4 h-4 text-[#0AA390]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Shift Your Perspective
            </span>
          </div>

          <h2 className="text-6xl sm:text-8xl font-black text-slate-900 leading-[0.85] uppercase tracking-tighter">
            Rethink. <br />
            Rewire. <br />
            <span className="text-[#00538e]">Renew.</span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Move from overthinking to clarity. AI-powered coaching that helps you become a calm, confident observer of your thoughts. Enough thinking.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-10 py-5 bg-[#00538e] text-white rounded-[2rem] font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
            >
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/plans" 
              className="w-full sm:w-auto px-10 py-5 bg-white text-slate-400 border border-slate-100 rounded-[2rem] font-bold text-lg hover:bg-slate-50 transition-all text-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </main>

      {/* 3. Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-[#00538e]/10 rounded-2xl flex items-center justify-center text-[#00538e]">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">AI Coaching</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Experience deep-dive sessions with Neo, providing assertive and compassionate 180° shifts.
            </p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-[#0AA390]/10 rounded-2xl flex items-center justify-center text-[#0AA390]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Daily Check-ins</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Track your grounding levels daily to build a consistent habit of mental clarity.
            </p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Growth History</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Visualise your journey with mood trends and a record of every breakthrough.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            © 2026 NeoMind180.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Privacy</Link>
            <Link href="/terms" className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
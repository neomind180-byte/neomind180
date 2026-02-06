"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowRight, 
  Check, 
  Wind,         // Phase 1: Breathe
  Eye,          // Phase 2: Notice
  GitBranch,    // Phase 3: Separate
  Heart,        // Phase 4: Understand
  Compass       // Phase 5: Choose
} from 'lucide-react';

import { Logo } from '@/components/Logo';

export default function LandingPage() {
  const router = useRouter();

  // --- LOGIC: Session Check ---
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
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="font-black text-xl tracking-tight text-[#00538e] hidden sm:block">
              NeoMind180
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#00538e] transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-3 bg-[#00538e] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:shadow-lg hover:bg-[#004272] transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-40 pb-20 px-6 text-center max-w-5xl mx-auto">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#0AA390] uppercase mb-6 block">
          Mindset Coaching
        </span>
        
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] mb-8 tracking-tight">
          Rethink. Rewire.<br />
          <span className="text-[#00538e]">Renew.</span>
        </h1>
        
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Move from overthinking to clarity. AI-powered coaching that helps you become a calm, confident observer of your thoughts.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-[#00538e] text-white rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
          >
            Start Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/pricing" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-500 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all"
          >
            View Pricing
          </Link>
        </div>
      </header>

      {/* --- THE 5-PHASE JOURNEY --- */}
      <section className="bg-slate-50 py-24 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-medium text-slate-900 mb-3">
              The 5-Phase Journey
            </h2>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">
              Each 20-minute session guides you through a transformative process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { icon: Wind, title: "Breathe", sub: "Calm your nervous system", color: "text-[#00538e]", bg: "bg-[#00538e]/10", hover: "hover:border-[#00538e]" },
              { icon: Eye, title: "Notice", sub: "Create distance from thoughts", color: "text-[#0AA390]", bg: "bg-[#0AA390]/10", hover: "hover:border-[#0AA390]" },
              { icon: GitBranch, title: "Separate", sub: "Thoughts are not facts", color: "text-[#F39904]", bg: "bg-[#F39904]/10", hover: "hover:border-[#F39904]" },
              { icon: Heart, title: "Understand", sub: "Work with compassion", color: "text-[#993366]", bg: "bg-[#993366]/10", hover: "hover:border-[#993366]" },
              { icon: Compass, title: "Choose", sub: "Take aligned action", color: "text-[#00538e]", bg: "bg-[#00538e]/10", hover: "hover:border-[#00538e]" },
            ].map((phase, i) => (
              <div key={i} className={`bg-white p-8 rounded-[2rem] border-2 border-transparent shadow-sm transition-all text-center group ${phase.hover}`}>
                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-colors ${phase.bg} ${phase.color}`}>
                  <phase.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 block mb-3 tracking-widest">PHASE 0{i+1}</span>
                <h3 className="font-bold text-xl text-slate-900 mb-2">{phase.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{phase.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURE SPLIT SECTION --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 order-2 md:order-1">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 leading-tight">
            Your AI companion for <br />
            <span className="italic text-slate-400">mental clarity</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Designed for busy professional women who want to break free from overthinking and make decisions with confidence and compassion.
          </p>
          <ul className="space-y-5 pt-4">
            {[
              "Up to 12 deep-dive AI sessions/month", 
              "Daily mindset check-ins", 
              "Guided micro-resets", 
              "Personal insights & trends", 
              "Three coaching styles"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 font-medium text-slate-700">
                <div className="w-6 h-6 rounded-full bg-[#0AA390]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#0AA390] stroke-[3]" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative order-1 md:order-2">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl">
            <img src="/hero-woman.jpg" alt="Woman sitting on grass" className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="absolute bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 max-w-xs animate-bounce-slow hidden md:block">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#F39904] rounded-full flex items-center justify-center text-white text-xs font-bold">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Daily Check-in</h4>
            </div>
            <p className="text-xs text-slate-500 italic">"How are you feeling in this moment?"</p>
          </div>
        </div>
      </section>

      {/* --- NEW CTA SECTION --- */}
      <section className="py-24 bg-slate-50 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-slate-900">
            Ready to transform your mindset?
          </h2>
          <p className="text-sm md:text-base text-slate-500">
            Start on the free Basic Self-Help plan. Upgrade anytime.
          </p>
          <div className="pt-4">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-10 py-5 bg-[#00538e] text-white rounded-full font-bold text-lg hover:shadow-xl hover:bg-[#004272] transition-all"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left Column: Logo & Disclaimer (Original Position) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-[#00538e]">NeoMind180</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Mindset coaching for clarity, not therapy. Seek professional help for mental health concerns.
            </p>
          </div>

          {/* Center Column: Payment Security (Original Position) */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
              Payment Security
            </h4>
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-300 text-xl tracking-tighter">
                PayFast
              </span>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                Secure payments powered by PayFast.<br/>
                Cancel anytime • No hidden fees • ZAR pricing
              </p>
            </div>
          </div>
          
          {/* Right Column: Links & Copyright (Original Position) */}
          <div className="space-y-4 text-right md:self-end">
             <div className="flex gap-6 justify-end text-[10px] font-bold uppercase tracking-tight text-slate-400">
               <Link href="/privacy" className="hover:text-[#00538e]">Privacy</Link>
               <Link href="/terms" className="hover:text-[#00538e]">Terms</Link>
             </div>
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              © 2026 NeoMind180
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
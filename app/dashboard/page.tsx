"use client";

import { useCheckInData } from '@/hooks/useCheckInData';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Notifications from '@/components/Notifications';
import {
  BookOpen,
  MessageSquare,
  Zap,
  UserCircle,
  Sparkles,
  ArrowRight,
  LogOut,
  Heart,
  History,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Star,
  AlertTriangle,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import Greeting from '@/components/Greeting';
import { microResets } from '@/lib/micro-resets-data';
import * as LucideIcons from 'lucide-react';

// --- DATA STUBS ---
const scriptureQuotes = [
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "Peace I leave with you; my peace I give you.", ref: "John 14:27" }
];

const mindsetQuotes = [
  { text: "You are the observer of your thoughts, not the thoughts themselves.", author: "Neo" },
  { text: "Clarity comes from engagement, not thought.", author: "Marie Forleo" },
  { text: "Awareness is the first step toward change.", author: "Nathaniel Branden" }
];

// --- SUB-COMPONENT: PROGRESS SUMMARY ---
function ProgressSummary() {
  const { weeklyStreak } = useCheckInData();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-[#fff2cc] p-8 rounded-[2.5rem] border border-amber-200 shadow-sm space-y-6 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-amber-950 uppercase tracking-tight">Momentum</h3>
          <p className="text-[12px] font-black uppercase tracking-widest text-amber-800/70">7-Day Streak</p>
        </div>
        <div className="bg-white/40 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
          <TrendingUp className="w-3 h-3 text-amber-900" />
          <span className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="flex justify-between items-center py-2">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-amber-800/70 uppercase">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              weeklyStreak[i] ? "bg-amber-600 text-white shadow-lg shadow-amber-900/10" : "bg-amber-950/10 text-amber-900/30"
            }`}>
              {weeklyStreak[i] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1 h-1 rounded-full bg-amber-950/20" />}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-amber-950/10 pt-4 flex justify-start">
        <Link
          href="/dashboard/insights"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amber-950 hover:opacity-75 transition-opacity"
        >
          View Monthly Streaks <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { weeklyStreak, recentShifts, subscriptionTier, checkedInToday, todayCheckIn } = useCheckInData();
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % scriptureQuotes.length;
    setDayIndex(index);
  }, []);



  // --- Pending Payment State ---
  const [pendingPlan, setPendingPlan] = useState<{ plan_id: string; m_payment_id: string } | null>(null);

  useEffect(() => {
    async function checkPendingPayment() {
      if (!user) return;
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_id, m_payment_id')
        .eq('user_id', user.id)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setPendingPlan(data);
    }
    checkPendingPayment();
  }, [user]);

  const PLAN_NAMES: Record<string, string> = {
    starter: 'Full Plan',
    builder: 'Confidence Builder',
    catalyst: 'Compassion Catalyst',
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="mb-4">
        <Greeting />
      </div>

      {/* Pending Payment Banner */}
      {pendingPlan && profile?.subscription_tier === 'free' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 py-5 rounded-[2rem] bg-amber-500/10 border border-amber-400/30 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center shrink-0 border border-amber-400/30">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                Payment Incomplete — {PLAN_NAMES[pendingPlan.plan_id] || pendingPlan.plan_id}
              </p>
              <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">
                Your plan upgrade is awaiting payment. Complete checkout to unlock your features.
              </p>
            </div>
          </div>
          <a
            href="/pricing"
            className="flex items-center gap-2 shrink-0 px-6 py-3 bg-amber-500 text-white font-black uppercase text-[11px] tracking-[0.15em] rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            Complete Checkout
          </a>
        </div>
      )}

      {/* Getting Started Welcome FAQ Card */}
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-[#00538e]/10 to-[#0ca78d]/10 border border-[#00538e]/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-[#00538e]/20 shadow-sm">
            <HelpCircle className="w-6 h-6 text-[#00538e]" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-[var(--text-primary)]">
              Getting Started with NeoMind180
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] font-medium mt-1 leading-relaxed max-w-2xl">
              Welcome to your sanctuary for clarity. This guide explains how to use the core features of your dashboard to start transforming your mindset today.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/how-to"
          className="flex items-center gap-2 shrink-0 px-6 py-3 bg-[#00538e] hover:bg-[#00538e]/95 text-white font-black uppercase text-[11px] tracking-[0.15em] rounded-xl shadow-lg shadow-[#00538e]/15 transition-all"
        >
          View Guide
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Daily Insight Cards */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-[#0aa390] border border-teal-600 shadow-sm relative overflow-hidden group hover:border-white/30 transition-all">
          <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-10 text-white group-hover:opacity-20 transition-opacity" />
          <h4 className="text-[12px] font-black uppercase text-teal-100 tracking-widest mb-4">Daily Scripture</h4>
          <p className="text-lg font-medium text-white leading-relaxed italic">
            &quot;{scriptureQuotes[dayIndex].text}&quot;
          </p>
          <p className="text-[12px] text-teal-50 font-bold uppercase mt-6 opacity-80">
            {scriptureQuotes[dayIndex].ref}
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-[#0ca78d] border border-emerald-600 shadow-sm relative overflow-hidden group hover:border-white/30 transition-all">
          <Zap className="absolute -right-4 -top-4 w-24 h-24 opacity-10 text-white group-hover:opacity-20 transition-opacity" />
          <h4 className="text-[12px] font-black uppercase text-emerald-100 tracking-widest mb-4">Resilient Mindset</h4>
          <p className="text-lg font-medium text-white leading-relaxed italic">
            &quot;{mindsetQuotes[dayIndex].text}&quot;
          </p>
          <p className="text-[12px] text-emerald-50 font-bold uppercase mt-6 opacity-80">
            — {mindsetQuotes[dayIndex].author}
          </p>
        </div>
      </section>

      {/* Dynamic Path Navigation (Be-Enough & Neo Chat side by side) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Be-Enough Shift Card */}
        <div className="p-8 rounded-[2.5rem] bg-[#e7e5e4] border border-stone-300 shadow-sm relative overflow-hidden group hover:border-[#993366]/40 transition-all flex flex-col justify-between min-h-[180px]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#993366]/10 rounded-xl flex items-center justify-center text-[#993366]">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-[#993366]">Be-Enough Shift</h4>
            </div>
            <p className="text-[13px] leading-relaxed text-stone-700 font-medium">
              Dismantle conditional self-worth and quiet the inner critic. Reset your internal baseline to &quot;I am enough&quot; by stepping out of performance-driven pressure and practicing gentle self-compassion.
            </p>
          </div>
          <Link
            href="/dashboard/be-enough"
            className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#993366] hover:underline"
          >
            Practice Shift
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Reflections with Neo Socratic Chat Card */}
        <div className="p-8 rounded-[2.5rem] bg-[#e7e5e4] border border-stone-300 shadow-sm relative overflow-hidden group hover:border-[#8E44AD]/40 transition-all flex flex-col justify-between min-h-[180px]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8E44AD]/10 rounded-xl flex items-center justify-center text-[#8E44AD]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-[#8E44AD]">Reflections with Neo</h4>
            </div>
            <p className="text-[13px] leading-relaxed text-stone-700 font-medium">
              Your private sanctuary for guided self-reflection. Chat freely with Neo, observe your thought patterns, and uncover blind spots with supportive, non-judgmental dialogue.
            </p>
          </div>
          <Link
            href="/dashboard/reflection"
            className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#8E44AD] hover:underline"
          >
            Reflect with Neo
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Row 2: Daily Check-in + Momentum */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Daily Check-In */}
        <div className="bg-[#ffd966] p-8 md:p-10 rounded-[2.5rem] border border-amber-300 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-amber-950 uppercase tracking-tight">Daily Check-In</h3>
            <p className="text-sm text-amber-900/70 mt-2 font-medium">
              {checkedInToday ? "Done! You've acknowledged your internal climate today." : "Acknowledge your internal climate."}
            </p>
          </div>

          {checkedInToday ? (
            <div className="my-6 py-4 px-6 bg-white/40 rounded-2xl border border-white/20 flex flex-row gap-4 justify-around items-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950/60">Mind</span>
                <span className="text-sm font-black uppercase text-[#00538e]">{todayCheckIn?.mind || 'Balanced'}</span>
              </div>
              <div className="h-8 w-px bg-amber-950/15"></div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950/60">Body</span>
                <span className="text-sm font-black uppercase text-[#0AA390]">{todayCheckIn?.body || 'Neutral'}</span>
              </div>
              <div className="h-8 w-px bg-amber-950/15"></div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950/60">Energy</span>
                <span className="text-sm font-black uppercase text-[#993366]">{todayCheckIn?.energy || 'Steady'}</span>
              </div>
            </div>
          ) : (
            <Link href="/dashboard/check-in" className="block mt-6">
              <button className="w-full py-4.5 bg-[#00538e] text-white rounded-[1.5rem] font-bold uppercase text-[12px] tracking-[0.2em] hover:shadow-2xl shadow-[#00538e]/20 hover:-translate-y-0.5 transition-all">
                Begin Check-In
              </button>
            </Link>
          )}
        </div>

        {/* Momentum */}
        <div>
          <ProgressSummary />
        </div>
      </section>

      {/* Row 3: Micro-Resets + Direct Access */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Micro-Resets Section (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h3 className="text-xl font-black text-[#00538e] uppercase tracking-tight">MICRO-RESETS</h3>
            <p className="text-sm text-stone-500 mt-1 font-medium">Quick tools to reset your mind and body in moments.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.values(microResets).map((reset) => {
              const IconComponent = (LucideIcons as any)[reset.icon] || LucideIcons.Zap;
              return (
                <Link
                  key={reset.slug}
                  href={`/dashboard/micro-resets/${reset.slug}`}
                  className={`p-6 rounded-[2rem] border ${reset.borderColor} ${reset.bgColor} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group`}
                >
                  <div className="flex flex-col h-full justify-between gap-4">
                    <div className="space-y-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/50 ${reset.textColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-black text-[13px] ${reset.textColor} uppercase tracking-tight group-hover:text-[#00538e] transition-colors`}>
                          {reset.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-medium leading-normal mt-1 line-clamp-2">
                          {reset.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded bg-white/60 ${reset.textColor} border ${reset.borderColor}`}>
                        {reset.timeBadge}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${reset.textColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Direct Access (40%) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] px-4">Direct Access</h3>
            <nav className="space-y-2">
              {[
                { label: 'Reflection with Neo', href: '/dashboard/reflection', icon: Zap, color: '#8E44AD', minTier: 'free' },
                { label: 'Self-Help Library', href: '/dashboard/library', icon: BookOpen, color: '#F39904', minTier: 'free' },
                { label: 'Ask-the-Coach', href: '/dashboard/coach', icon: HelpCircle, color: '#0AA390', minTier: 'free' },
                { label: 'Insights & Analytics', href: '/dashboard/insights', icon: TrendingUp, color: '#0AA390', minTier: 'free' },
                { label: 'Shift History', href: '/dashboard/history', icon: History, color: '#0AA390', minTier: 'free' }
              ].map((item, idx) => {
                const isLocked = item.minTier === 'starter' && subscriptionTier === 'free';
                return (
                  <Link
                    key={idx}
                    href={isLocked ? '/pricing' : item.href}
                    className={`flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm transition-all group ${isLocked ? 'opacity-70 grayscale-[0.5]' : 'hover:border-[var(--text-dim)] hover:bg-[var(--border)]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[var(--bg-input)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform relative">
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        {isLocked && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-stone-200">
                            <LucideIcons.Lock className="w-2.5 h-2.5 text-[#F39904]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{item.label}</span>
                    </div>
                    {isLocked ? (
                      <span className="text-[10px] font-black uppercase text-[#F39904] tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100">Unlock</span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-muted)] group-hover:translate-x-1 transition-all" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </section>


    </div>
  );
}
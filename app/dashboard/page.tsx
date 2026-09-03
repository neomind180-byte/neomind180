"use client";

import { useCheckInData } from '@/hooks/useCheckInData';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  MessageSquare,
  Zap,
  Sparkles,
  ArrowRight,
  Heart,
  History,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  HelpCircle,
  ShieldCheck
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

// --- SUB-COMPONENT: MOMENTUM PRACTICE SUMMARY ---
function ProgressSummary() {
  const { weeklySummary, loading } = useCheckInData();

  return (
    <div className="bg-[#fff2cc] p-8 md:p-10 rounded-[2.5rem] border border-amber-200 shadow-sm space-y-6 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black text-amber-950 uppercase tracking-tight">MOMENTUM</h3>
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-800/75 mt-1">
            Your mindful practice this week
          </p>
        </div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-amber-900/10 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Dynamic Summary Numbers */}
      <div className="bg-white/60 p-5 rounded-2xl border border-amber-900/10 text-center space-y-1.5 shadow-xs">
        <div className="text-2xl font-black text-amber-950 tracking-tight">
          {weeklySummary.totalPractices} {weeklySummary.totalPractices === 1 ? 'PRACTICE' : 'PRACTICES'}
        </div>
        <div className="text-[11px] font-black uppercase tracking-wider text-amber-900/80 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>{weeklySummary.totalCheckIns} {weeklySummary.totalCheckIns === 1 ? 'CHECK-IN' : 'CHECK-INS'}</span>
          <span className="text-amber-900/30">•</span>
          <span>{weeklySummary.totalReflections} {weeklySummary.totalReflections === 1 ? 'REFLECTION' : 'REFLECTIONS'}</span>
          <span className="text-amber-900/30">•</span>
          <span>{weeklySummary.totalMicroResets} {weeklySummary.totalMicroResets === 1 ? 'MICRO-RESET' : 'MICRO-RESETS'}</span>
        </div>
      </div>

      {/* 7-Day Mindful Practice Pattern Map */}
      <div className="space-y-3 py-1">
        <div className="flex justify-between items-center px-1">
          {weeklySummary.days.map((day, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 flex-1 relative group"
              title={day.ariaLabel}
            >
              {/* Day Letter */}
              <span className={`text-[11px] font-black uppercase ${
                day.isToday ? 'text-amber-950 font-black' : 'text-amber-800/70'
              }`}>
                {day.dayName}
              </span>

              {/* Practice State Dot */}
              <div
                tabIndex={0}
                role="img"
                aria-label={day.ariaLabel}
                className={`transition-all duration-300 relative flex items-center justify-center cursor-default outline-none h-6 w-6 ${
                  day.isToday ? 'rounded-full ring-2 ring-amber-700/40 bg-amber-950/5' : ''
                }`}
              >
                {day.state === 'multiple' ? (
                  /* Multiple practices: Solid dot with layered ring */
                  <div className="w-4 h-4 rounded-full bg-amber-800 flex items-center justify-center shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-100" />
                  </div>
                ) : day.state === 'active' ? (
                  /* Active day (1 practice): Soft filled dot */
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-700/85 shadow-xs" />
                ) : (
                  /* No activity yet: Neutral empty circle */
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-950/20 bg-transparent" />
                )}
              </div>

              {/* Subtle Today Label */}
              {day.isToday && (
                <span className="text-[8px] font-black uppercase tracking-tighter text-amber-900/80 absolute -bottom-4">
                  TODAY
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Status & Encouraging Microcopy */}
      <div className="text-center space-y-1 pt-3">
        <div className="text-[11px] font-black uppercase tracking-widest text-amber-950">
          {weeklySummary.daysEngaged} OF 7 DAYS ENGAGED
        </div>
        <p className="text-[12px] font-medium italic text-amber-900/80">
          &quot;{weeklySummary.encouragement}&quot;
        </p>
      </div>

      {/* Footer Link */}
      <div className="border-t border-amber-950/10 pt-4 flex justify-between items-center">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-amber-950 hover:text-amber-800 transition-colors group"
        >
          <span>VIEW PRACTICE HISTORY</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { checkedInToday, todayCheckIn } = useCheckInData();
  const [dayIndex, setDayIndex] = useState(0);

  // --- Next Step State ---
  const [nextStepInput, setNextStepInput] = useState('');
  const [isSavingNextStep, setIsSavingNextStep] = useState(false);
  const [nextStepSaved, setNextStepSaved] = useState(false);

  const handleSaveNextStep = async () => {
    const text = nextStepInput.trim() || (typeof window !== 'undefined' ? localStorage.getItem('neomind_next_step') || '' : '');
    if (!text) return;
    setIsSavingNextStep(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('neomind_next_step', text);
      }
      if (user) {
        await supabase.from('shifts').insert([
          {
            user_id: user.id,
            thought: `Intentional Action: ${text}`,
            emotion: 'Intentional Response',
            evidence: 'Action Commitment',
            new_perspective: text
          }
        ]);
      }
      setNextStepSaved(true);
      setTimeout(() => setNextStepSaved(false), 3500);
    } catch (err) {
      console.error('Error saving Next Step:', err);
    } finally {
      setIsSavingNextStep(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % scriptureQuotes.length;
    setDayIndex(index);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neomind_next_step');
      if (saved) setNextStepInput(saved);
    }
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

      {/* Getting Started Welcome Card */}
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
              Welcome to your space for clarity and mindful growth. Start with a Daily Check-In, explore a Micro-Reset, or reflect with Neo when something is on your mind.
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

      {/* What's happening for you today? Triage Bar */}
      <section className="p-6 md:p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#0AA390] animate-pulse" />
          <h3 className="text-base font-black uppercase tracking-tight text-[var(--text-primary)]">
            What's happening for you today?
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {[
            { label: "I'm overwhelmed", action: "2-Minute Grounding", href: "/dashboard/micro-resets/grounding", color: "#0AA390" },
            { label: "My mind won't stop", action: "Thought Release", href: "/dashboard/micro-resets/thought-release", color: "#F39904" },
            { label: "I'm doubting myself", action: "Be-Enough Shift", href: "/dashboard/be-enough", color: "#993366" },
            { label: "I'm stuck on a decision", action: "Reflect with Neo", href: "/dashboard/reflection", color: "#8E44AD" },
            { label: "I need perspective", action: "Ask the Coach", href: "/dashboard/coach", color: "#00538e" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="px-4 py-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--text-muted)] text-[12px] font-bold text-[var(--text-primary)] transition-all flex items-center gap-2 group hover:-translate-y-0.5"
            >
              <span>{item.label}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white tracking-widest" style={{ backgroundColor: item.color }}>
                → {item.action}
              </span>
            </Link>
          ))}
        </div>
      </section>

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#993366]/10 rounded-xl flex items-center justify-center text-[#993366]">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-[#993366]">Be-Enough Shift</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#993366]/15 text-[#993366] border border-[#993366]/30">
                SELF-COMPASSION
              </span>
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

        {/* Reflections with Neo Card */}
        <div className="p-8 rounded-[2.5rem] bg-[#e7e5e4] border border-stone-300 shadow-sm relative overflow-hidden group hover:border-[#8E44AD]/40 transition-all flex flex-col justify-between min-h-[180px]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8E44AD]/10 rounded-xl flex items-center justify-center text-[#8E44AD]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-[#8E44AD]">Reflections with Neo</h4>
            </div>
            <p className="text-[13px] leading-relaxed text-stone-700 font-medium">
              Your private space for guided self-reflection. Explore what's on your mind with Neo and notice patterns, perspectives and possibilities without judgment.
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Daily Check-In + Next Step Tracker */}
        <div className="space-y-6">
          <div className="bg-[#ffd966] p-8 md:p-10 rounded-[2.5rem] border border-amber-300 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-amber-950 uppercase tracking-tight">Daily Check-In</h3>
              <p className="text-sm text-amber-900/80 mt-2 font-medium">
                Notice what's happening in your mind, emotions and body—without needing to change anything yet.
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

          {/* Next Step Tracking Card */}
          <div className="p-6 rounded-[2.5rem] bg-[#fdf4ff] border border-fuchsia-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#993366]" />
                <h4 className="text-xs font-black uppercase tracking-widest text-[#993366]">MY NEXT STEP</h4>
              </div>
              <Link
                href="/dashboard/reflection"
                className="text-[10px] font-black uppercase tracking-widest text-[#8E44AD] hover:underline"
              >
                Reflect with Neo →
              </Link>
            </div>
            <p className="text-xs font-bold text-fuchsia-950 leading-relaxed">
              Would you like to turn your reflection insight into one small action?
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nextStepInput}
                onChange={(e) => setNextStepInput(e.target.value)}
                placeholder="One small intentional action..."
                className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-fuchsia-200 rounded-xl text-xs text-stone-800 outline-none focus:border-[#993366] transition-all"
              />
              <button
                type="button"
                onClick={handleSaveNextStep}
                disabled={isSavingNextStep}
                className="px-4 py-2.5 bg-[#993366] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#802652] transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSavingNextStep ? 'Saving...' : nextStepSaved ? 'Saved ✓' : 'Save Step'}
              </button>
            </div>
            {nextStepSaved && (
              <p className="text-[11px] font-bold text-[#993366] tracking-wide">
                ✓ Saved to your practice tracker & journey history!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Momentum */}
        <div>
          <ProgressSummary />
        </div>
      </section>

      {/* Row 3: Micro-Resets + Direct Access */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Micro-Resets Section (60%) */}
        <div id="micro-resets" className="lg:col-span-3 space-y-6">
          <div>
            <h3 className="text-xl font-black text-[#00538e] uppercase tracking-tight">MICRO-RESETS</h3>
            <p className="text-sm text-stone-500 mt-1 font-medium">
              Short guided practices to pause, reset and create space for your next intentional response.
            </p>

            {/* Mentally Overloaded Recommendation Box */}
            <div className="mt-4 p-5 rounded-2xl border border-emerald-200 bg-[#f0fdfa] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-emerald-950 tracking-wider">
                  You seem mentally overloaded today.
                </p>
                <p className="text-xs font-medium text-emerald-900/80">
                  Try a 2-minute grounding reset to create immediate space.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/micro-resets/grounding"
                  className="px-4 py-2 bg-[#0AA390] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#088373] transition-all shadow-md shadow-[#0AA390]/20 shrink-0"
                >
                  2-Min Grounding →
                </Link>
              </div>
            </div>
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
                        <p className="text-[11px] font-extrabold text-stone-700 mt-1">
                          {reset.purpose}
                        </p>
                        <p className="text-[11px] text-stone-500 font-medium leading-normal mt-0.5 line-clamp-2">
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
          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] px-4">Direct Access Menu</h3>

            {/* Categorized Menu */}
            {[
              {
                category: "TODAY",
                items: [
                  { label: "Dashboard", href: "/dashboard", icon: LucideIcons.LayoutDashboard, color: "#00538e" },
                  { label: "Daily Check-In", href: "/dashboard/check-in", icon: Heart, color: "#993366" },
                  { label: "Micro-Resets", href: "/dashboard#micro-resets", icon: Zap, color: "#0AA390" },
                ]
              },
              {
                category: "REFLECT",
                items: [
                  { 
                    label: "REFLECT WITH NEO", 
                    subtext: "Explore your thoughts with your AI reflection coach.", 
                    href: "/dashboard/reflection", 
                    icon: Zap, 
                    color: "#8E44AD" 
                  },
                  { label: "Shift History", href: "/dashboard/history", icon: History, color: "#0AA390" },
                  { label: "Insights", href: "/dashboard/insights", icon: TrendingUp, color: "#0AA390" },
                ]
              },
              {
                category: "LEARN",
                items: [
                  { label: "Self-Help Library", href: "/dashboard/library", icon: BookOpen, color: "#F39904" },
                  { label: "How-To", href: "/dashboard/how-to", icon: HelpCircle, color: "#0AA390" },
                ]
              },
              {
                category: "CONNECT",
                items: [
                  { 
                    label: "ASK THE COACH", 
                    subtext: "Send a question to Emmeline when you'd like human coaching guidance.", 
                    href: "/dashboard/coach", 
                    icon: MessageSquare, 
                    color: "#4A90E2" 
                  },
                ]
              }
            ].map((catGroup) => (
              <div key={catGroup.category} className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00538e] px-4">
                  {catGroup.category}
                </div>
                <div className="space-y-2">
                  {catGroup.items.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="flex flex-col p-3.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm hover:border-[var(--text-muted)] hover:bg-[var(--border)] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[var(--bg-input)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <span className="text-[12px] font-extrabold text-[var(--text-primary)] uppercase tracking-tight">
                            {item.label}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-muted)] group-hover:translate-x-1 transition-all" />
                      </div>
                      {item.subtext && (
                        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-1 ml-11 leading-snug">
                          {item.subtext}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
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
  Star
} from 'lucide-react';
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
  const { weeklyStreak, recentShifts } = useCheckInData();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-[#ea9999] p-8 rounded-[2.5rem] border border-red-200 shadow-sm space-y-6 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-red-950 uppercase tracking-tight">Momentum</h3>
          <p className="text-[12px] font-black uppercase tracking-widest text-red-800/70">7-Day Streak</p>
        </div>
        <div className="bg-white/40 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
          <TrendingUp className="w-3 h-3 text-red-900" />
          <span className="text-[11px] font-black text-red-900 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-red-800/70 uppercase">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${weeklyStreak[i] ? "bg-red-600 text-white shadow-lg shadow-red-900/10" : "bg-red-900/10 text-red-900/30"
              }`}>
              {weeklyStreak[i] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1 h-1 rounded-full bg-red-950/20" />}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-red-950/10">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-800/70">Last Observations</h4>
        {recentShifts.length > 0 ? recentShifts.map((shift, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-white/30 rounded-xl border border-red-900/10">
            <span className="text-[10px] font-bold text-red-800/70 uppercase">
              {new Date(shift.created_at).toLocaleDateString(undefined, { weekday: 'short' })}
            </span>
            <div className="flex gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-1 bg-[#00538e] rounded-md text-white border border-white/10">{shift.mind}</span>
              <span className="text-[10px] font-black uppercase px-2 py-1 bg-[#0AA390] rounded-md text-white border border-white/10">{shift.body}</span>
            </div>
          </div>
        )) : (
          <p className="text-[11px] text-red-900/40 italic text-center py-2">No recent check-ins found.</p>
        )}
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
  const { weeklyStreak, recentShifts, subscriptionTier } = useCheckInData();
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % scriptureQuotes.length;
    setDayIndex(index);
  }, []);

  const isStarter = subscriptionTier !== 'free'; 
  const isBuilder = subscriptionTier === 'builder' || subscriptionTier === 'catalyst';
  const isCatalyst = subscriptionTier === 'catalyst';

  return (
    <div className="space-y-10 pb-20">
      <div className="mb-4">
        <Greeting />
      </div>

      {/* Daily Insight Cards */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-[#e7e5e4] border border-stone-300 shadow-sm relative overflow-hidden group hover:border-[#00538e]/30 transition-all">
          <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-5 text-stone-900 group-hover:opacity-10 transition-opacity" />
          <h4 className="text-[12px] font-black uppercase text-stone-500 tracking-widest mb-4">Daily Scripture</h4>
          <p className="text-lg font-medium text-stone-950 leading-relaxed italic">
            &quot;{scriptureQuotes[dayIndex].text}&quot;
          </p>
          <p className="text-[12px] text-stone-600 font-bold uppercase mt-6">
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

      {/* Row 2: Daily Check-in + Momentum */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Daily Check-In (60%) */}
        <div className="md:col-span-3 bg-[#ffd966] p-10 rounded-[3rem] border border-amber-300 shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-amber-950 uppercase tracking-tight">Daily Check-In</h3>
                <p className="text-sm text-amber-900/70 mt-2 italic font-medium">Acknowledge your internal climate.</p>
              </div>
            </div>

            <div className="space-y-4 py-8 border-y border-amber-950/10">
              {['Mind', 'Body', 'Energy'].map((label, i) => (
                <div key={i} className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest text-amber-900">
                  <span className="text-amber-900/60">{label}:</span>
                  <div className="flex gap-4 text-amber-950/40 font-bold">
                    <span>Low ▢</span> <span>Med ▢</span> <span className="text-amber-950 font-black">Clear ▣</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/dashboard/check-in" className="block mt-8">
            <button className="w-full py-5 bg-[#00538e] text-white rounded-[1.5rem] font-bold uppercase text-[12px] tracking-[0.2em] hover:shadow-2xl shadow-[#00538e]/20 hover:-translate-y-0.5 transition-all">
              Begin Today&apos;s Check-In
            </button>
          </Link>
        </div>

        {/* Momentum (40%) */}
        <div className="md:col-span-2 h-full">
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
                { label: 'BE-ENOUGH SHIFT', href: '/dashboard/be-enough', icon: Heart, color: '#993366', minTier: 'free' },
                { label: 'Self-Help Library', href: '/dashboard/library', icon: BookOpen, color: '#F39904', minTier: 'free' },
                { label: 'Reflection with Neo', href: '/dashboard/reflection', icon: Zap, color: '#8E44AD', minTier: 'free' },
                { label: '1:1 Sessions', href: '/dashboard/sessions', icon: Star, color: '#E67E22', minTier: 'catalyst' },
                { label: 'Insights & Analytics', href: '/dashboard/insights', icon: TrendingUp, color: '#0AA390', minTier: 'builder' },
                { label: 'Shift History', href: '/dashboard/history', icon: History, color: '#0AA390', minTier: 'free' }
              ].map((item, idx) => {
                const isLocked = (item.minTier === 'starter' && subscriptionTier === 'free') || 
                                 (item.minTier === 'builder' && (subscriptionTier === 'free' || subscriptionTier === 'starter')) ||
                                 (item.minTier === 'catalyst' && (subscriptionTier !== 'catalyst'));
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
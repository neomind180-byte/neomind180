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
  Lightbulb
} from 'lucide-react';

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
    <div className="bg-[#232938] p-8 rounded-[2.5rem] border border-[#2d3548] shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Momentum</h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8]">7-Day Streak</p>
        </div>
        <div className="bg-[#0AA390]/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-[#0AA390]/20">
          <TrendingUp className="w-3 h-3 text-[#0AA390]" />
          <span className="text-[9px] font-black text-[#0AA390] uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[8px] font-black text-[#64748b] uppercase">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${weeklyStreak[i] ? "bg-[#0AA390] text-white shadow-lg shadow-[#0AA390]/20" : "bg-[#1a1f2e] text-slate-700"
              }`}>
              {weeklyStreak[i] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1 h-1 rounded-full bg-[#2d3548]" />}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-[#2d3548]">
        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Last Observations</h4>
        {recentShifts.length > 0 ? recentShifts.map((shift, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-[#1a1f2e] rounded-xl border border-[#2d3548]">
            <span className="text-[8px] font-bold text-[#94a3b8] uppercase">
              {new Date(shift.created_at).toLocaleDateString(undefined, { weekday: 'short' })}
            </span>
            <div className="flex gap-2">
              <span className="text-[8px] font-black uppercase px-2 py-1 bg-[#232938] rounded-md text-[#00538e] border border-[#2d3548]">{shift.mind}</span>
              <span className="text-[8px] font-black uppercase px-2 py-1 bg-[#232938] rounded-md text-[#0AA390] border border-[#2d3548]">{shift.body}</span>
            </div>
          </div>
        )) : (
          <p className="text-[9px] text-[#64748b] italic text-center py-2">No recent check-ins found.</p>
        )}
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % scriptureQuotes.length;
    setDayIndex(index);
  }, []);

  return (
    <div className="space-y-10 pb-20">

      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            Welcome back
          </h1>
          <p className="text-[10px] font-black text-[#cbd5e1] uppercase tracking-[0.3em] mt-3">
            Rethink. Rewire. Renew.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Notifications />
          <Link
            href="/pricing"
            className="flex items-center gap-2 px-6 py-3 bg-[#00538e] text-white rounded-full text-[10px] font-black uppercase hover:shadow-2xl shadow-[#00538e]/20 transition-all"
          >
            Upgrade Plan
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-[#232938] border border-[#2d3548] rounded-full text-[10px] font-black uppercase text-[#94a3b8] hover:text-[#993366] hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Link>
        </div>
      </header>

      {/* Daily Insight Cards */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-[#232938] border border-[#2d3548] shadow-sm relative overflow-hidden group hover:border-[#00538e]/30 transition-all">
          <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-5 text-[#00538e] group-hover:opacity-10 transition-opacity" />
          <h4 className="text-[10px] font-black uppercase text-[#00538e] tracking-widest mb-4">Daily Scripture</h4>
          <p className="text-lg font-medium text-[#e2e8f0] leading-relaxed italic">
            "{scriptureQuotes[dayIndex].text}"
          </p>
          <p className="text-[10px] text-[#94a3b8] font-bold uppercase mt-6">
            {scriptureQuotes[dayIndex].ref}
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-[#232938] border border-[#2d3548] shadow-sm relative overflow-hidden group hover:border-[#0AA390]/30 transition-all">
          <Zap className="absolute -right-4 -top-4 w-24 h-24 opacity-5 text-[#0AA390] group-hover:opacity-10 transition-opacity" />
          <h4 className="text-[10px] font-black uppercase text-[#0AA390] tracking-widest mb-4">Resilient Mindset</h4>
          <p className="text-lg font-medium text-[#e2e8f0] leading-relaxed italic">
            "{mindsetQuotes[dayIndex].text}"
          </p>
          <p className="text-[10px] text-[#94a3b8] font-bold uppercase mt-6">
            — {mindsetQuotes[dayIndex].author}
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Daily Check-In */}
        <div className="lg:col-span-2">
          <div className="bg-[#232938] p-10 rounded-[3rem] border border-[#2d3548] shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Daily Check-In</h3>
                <p className="text-sm text-[#cbd5e1] mt-2 italic font-medium">Acknowledge your internal climate.</p>
              </div>
              <div className="bg-[#fffcf6] p-2.5 rounded-2xl shadow-xl border border-white/5 shrink-0 flex items-center justify-center">
                <Image src="/business-logo.png" alt="NeoMind180" width={40} height={40} className="object-contain" />
              </div>
            </div>

            <div className="space-y-4 py-8 border-y border-[#2d3548]">
              {['Mind', 'Body', 'Energy'].map((label, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-[#94a3b8]">{label}:</span>
                  <div className="flex gap-4 text-[#475569]">
                    <span>Low ▢</span> <span>Med ▢</span> <span className="text-[#0AA390]">Clear ▣</span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/dashboard/check-in" className="block mt-8">
              <button className="w-full py-5 bg-[#00538e] text-white rounded-[1.5rem] font-bold uppercase text-[10px] tracking-[0.2em] hover:shadow-2xl shadow-[#00538e]/20 hover:-translate-y-0.5 transition-all">
                Begin Today's Check-In
              </button>
            </Link>
          </div>
        </div>

        {/* Right Column: Progress & Nav */}
        <div className="space-y-6">
          <ProgressSummary />

          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.3em] px-4">Direct Access</h3>
            <nav className="space-y-2">
              {[
                { label: 'BE-ENOUGH SHIFT', href: '/dashboard/be-enough', icon: Heart, color: '#993366' },
                { label: 'Shift History', href: '/dashboard/history', icon: History, color: '#00538e' },
                { label: 'Self-Help Library', href: '/dashboard/library', icon: BookOpen, color: '#00538e' },
                { label: 'Reflection with Neo', href: '/dashboard/reflection', icon: Zap, color: '#0AA390' }
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center justify-between p-4 bg-[#232938] rounded-2xl border border-[#2d3548] shadow-sm hover:border-[#374151] hover:bg-[#2d3548] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1a1f2e] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-[#e2e8f0] uppercase tracking-tight">{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#475569] group-hover:text-[#94a3b8] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useCheckInData } from '@/hooks/useCheckInData';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  TrendingUp
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
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Momentum</h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">7-Day Streak</p>
        </div>
        <div className="bg-[#0AA390]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-[#0AA390]" />
          <span className="text-[9px] font-black text-[#0AA390] uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[8px] font-black text-slate-300 uppercase">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              weeklyStreak[i] ? "bg-[#0AA390] text-white shadow-lg shadow-[#0AA390]/20" : "bg-slate-50 text-slate-200"
            }`}>
              {weeklyStreak[i] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1 h-1 rounded-full bg-slate-200" />}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-50">
        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">Last Observations</h4>
        {recentShifts.length > 0 ? recentShifts.map((shift, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
             <span className="text-[8px] font-bold text-slate-400 uppercase">
               {new Date(shift.created_at).toLocaleDateString(undefined, {weekday: 'short'})}
             </span>
             <div className="flex gap-2">
               <span className="text-[8px] font-black uppercase px-2 py-1 bg-white rounded-md text-[#00538e] border border-slate-100">{shift.mind}</span>
               <span className="text-[8px] font-black uppercase px-2 py-1 bg-white rounded-md text-[#0AA390] border border-slate-100">{shift.body}</span>
             </div>
          </div>
        )) : (
          <p className="text-[9px] text-slate-300 italic text-center py-2">No recent check-ins found.</p>
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
          <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter leading-none">
            Welcome back
          </h1>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-2">
            Rethink. Rewire. Renew.
          </p>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-full text-[10px] font-black uppercase text-slate-400 hover:text-[#993366] hover:bg-red-50 transition-all"
        >
          <LogOut className="w-3 h-3" /> Sign Out
        </Link>
      </header>

      {/* Daily Insight Cards */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-[#00538e]/10 shadow-sm relative overflow-hidden group">
          <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-5 text-[#00538e] group-hover:opacity-10 transition-opacity" />
          <h4 className="text-[10px] font-black uppercase text-[#00538e] tracking-widest mb-4">Daily Scripture</h4>
          <p className="text-lg font-medium text-slate-800 leading-relaxed italic">
            "{scriptureQuotes[dayIndex].text}"
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">
            {scriptureQuotes[dayIndex].ref}
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-[#0AA390]/10 shadow-sm relative overflow-hidden group">
          <Zap className="absolute -right-4 -top-4 w-24 h-24 opacity-5 text-[#0AA390] group-hover:opacity-10 transition-opacity" />
          <h4 className="text-[10px] font-black uppercase text-[#0AA390] tracking-widest mb-4">Resilient Mindset</h4>
          <p className="text-lg font-medium text-slate-800 leading-relaxed italic">
            "{mindsetQuotes[dayIndex].text}"
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4">
            — {mindsetQuotes[dayIndex].author}
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Daily Check-In */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Daily Check-In</h3>
                <p className="text-sm text-slate-500 mt-2 italic font-medium">Acknowledge your internal climate.</p>
              </div>
              {/* Subtle Branding Removed as per Sidebar consistency request, or kept as decorative watermark */}
              <div className="opacity-5 grayscale">
                 <Image src="/business-logo.png" alt="" width={60} height={60} />
              </div>
            </div>
            
            <div className="space-y-4 py-8 border-y border-slate-100">
              {['Mind', 'Body', 'Energy'].map((label, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">{label}:</span>
                  <div className="flex gap-4 text-slate-200">
                    <span>Low ▢</span> <span>Med ▢</span> <span className="text-[#0AA390]">Clear ▣</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/dashboard/check-in" className="block mt-8">
              <button className="w-full py-5 bg-[#00538e] text-white rounded-[1.5rem] font-bold uppercase text-[10px] tracking-[0.2em] hover:shadow-xl transition-all">
                Begin Today's Check-In
              </button>
            </Link>
          </div>
        </div>

        {/* Right Column: Progress & Nav */}
        <div className="space-y-6">
          <ProgressSummary />

          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Direct Access</h3>
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
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
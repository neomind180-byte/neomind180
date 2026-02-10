"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  UserCircle, 
  MessageSquare, 
  Zap, 
  Sparkles, 
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

// Deterministic quotes for daily rotation
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

export default function DashboardPage() {
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % scriptureQuotes.length;
    setDayIndex(index);
  }, []);

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <header>
        <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter">
          Welcome back, Member
        </h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
          Your 180° Path for Today
        </p>
      </header>

      {/* Mandatory Daily Insight Cards */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-[#00538e]/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-20 h-20 text-[#00538e]" />
          </div>
          <h4 className="text-[10px] font-black uppercase text-[#00538e] tracking-widest mb-4">Daily Scripture</h4>
          <p className="text-lg font-medium text-slate-800 leading-relaxed italic mb-4">
            "{scriptureQuotes[dayIndex].text}"
          </p>
          <p className="text-xs text-slate-400 font-bold uppercase">
            {scriptureQuotes[dayIndex].ref}
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-[#0AA390]/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-20 h-20 text-[#0AA390]" />
          </div>
          <h4 className="text-[10px] font-black uppercase text-[#0AA390] tracking-widest mb-4">Resilient Mindset</h4>
          <p className="text-lg font-medium text-slate-800 leading-relaxed italic mb-4">
            "{mindsetQuotes[dayIndex].text}"
          </p>
          <p className="text-xs text-slate-400 font-bold uppercase">
            — {mindsetQuotes[dayIndex].author}
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Daily Check-In Module */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm">
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Daily Check-In</h3>
              <p className="text-sm text-slate-500 mt-2">Notice your mind, body, and energy in under a minute.</p>
            </div>
            
            {/* Visual Teaser for Check-in logic */}
            <div className="space-y-4 py-8 border-y border-slate-100">
              {[
                { label: 'Mind', options: ['noisy', 'balanced', 'clear'], active: 2 },
                { label: 'Body', options: ['tense', 'neutral', 'calm'], active: 0 },
                { label: 'Energy', options: ['low', 'medium', 'steady'], active: 1 },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">{row.label}:</span>
                  <div className="flex gap-4">
                    {row.options.map((opt, idx) => (
                      <span key={idx} className={row.active === idx ? "text-[#0AA390]" : "text-slate-300"}>
                        {opt} {row.active === idx ? '▣' : '▢'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-8 w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-xl transition-all">
              Begin Today's Check-In
            </button>
          </div>
        </div>

        {/* Updated Navigation Section */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4">Direct Access</h3>
          <nav className="space-y-3">
            {[
              { icon: BookOpen, label: 'Self-Help Library', href: '/dashboard/library' },
              { icon: MessageSquare, label: 'Ask-the-Coach', href: '/dashboard/coach' },
              { icon: Zap, label: 'Reflection with Neo', href: '/dashboard/reflection' },
              { icon: UserCircle, label: '1:1 Sessions', href: '/dashboard/sessions' }
            ].map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href} 
                className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-transparent hover:border-[#00538e]/10 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#00538e]/5 transition-colors">
                    <item.icon className="w-5 h-5 text-[#00538e]" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-[#00538e] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
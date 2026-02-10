"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Wind, 
  PenTool, 
  Sparkles, 
  ChevronRight,
  Anchor
} from 'lucide-react';

const journalPrompts = [
  {
    title: "The Observer's Seat",
    category: "Perspective Shift",
    prompt: "If you were watching your current thought from a distance, what would you notice about it that you can't see right now?",
    color: "#00538e"
  },
  {
    title: "The 180° Flip",
    category: "Belief Work",
    prompt: "What is the exact opposite of the thought currently causing you stress? How could that opposite thought be just as true?",
    color: "#993366"
  },
  {
    title: "Aligned Decisions",
    category: "Action",
    prompt: "Is this decision being made by the 'overthinker' or the 'confident observer'? What does the observer suggest?",
    color: "#0AA390"
  }
];

const mindfulnessTools = [
  {
    name: "The 4-7-8 Reset",
    type: "Breathing",
    desc: "Inhale for 4, hold for 7, exhale for 8 to quiet the nervous system.",
    icon: Wind
  },
  {
    name: "5-4-3-2-1 Grounding",
    type: "Awareness",
    desc: "Acknowledge 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.",
    icon: Anchor
  }
];

export default function LibraryPage() {
  const [activePrompt, setActivePrompt] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-16">
        
        {/* Navigation & Header */}
        <header className="space-y-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00538e] transition-colors font-bold uppercase text-[10px] tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#00538e]/10 rounded-3xl">
              <BookOpen className="w-8 h-8 text-[#00538e]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter">Self-Help Library</h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Tools for Clarity & Calm</p>
            </div>
          </div>
        </header>

        {/* Socratic Journaling Section  */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
            <PenTool className="w-5 h-5 text-[#993366]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Socratic Journaling</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {journalPrompts.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => setActivePrompt(idx)}
                className={`text-left p-8 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden ${
                  activePrompt === idx ? 'border-[#00538e] bg-white shadow-xl' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className="relative z-10 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white rounded-full border border-slate-100 group-hover:border-transparent transition-colors" style={{ color: item.color }}>
                    {item.category}
                  </span>
                  <h3 className="font-bold text-slate-800 leading-tight">{item.title}</h3>
                  <p className={`text-sm leading-relaxed transition-colors ${activePrompt === idx ? 'text-slate-600' : 'text-slate-400'}`}>
                    {activePrompt === idx ? item.prompt : "Click to reveal prompt..."}
                  </p>
                </div>
                {activePrompt !== idx && (
                  <Sparkles className="absolute -bottom-4 -right-4 w-16 h-16 text-slate-100 group-hover:text-slate-200 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Mindfulness Tools Section  */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
            <Wind className="w-5 h-5 text-[#0AA390]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Mindfulness Tools</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {mindfulnessTools.map((tool, idx) => (
              <div key={idx} className="flex gap-6 p-8 bg-white border-2 border-[#0AA390]/10 rounded-[2.5rem] group hover:border-[#0AA390]/30 transition-all hover:shadow-lg">
                <div className="w-16 h-16 shrink-0 bg-[#0AA390]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <tool.icon className="w-8 h-8 text-[#0AA390]" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{tool.name}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#0AA390] opacity-60">{tool.type}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
                  <button className="flex items-center gap-1 text-[10px] font-black uppercase text-[#0AA390] tracking-widest pt-2 hover:gap-2 transition-all">
                    Start Exercise <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Reminder [cite: 73-74] */}
        <footer className="pt-20 text-center opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            NeoMind180 — Clarity through reflection
          </p>
        </footer>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Send, Loader2, Heart } from 'lucide-react';

export default function BeEnoughPage() {
  const [reflection, setReflection] = useState('');
  const [neoResponse, setNeoResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    setIsThinking(true);
    setNeoResponse(null);

    try {
      const res = await fetch('/api/be-enough', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection }),
      });
      const data = await res.json();
      setNeoResponse(data.content);
    } catch (err) {
      console.error("Error fetching thinking:", err);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Image src="/business-logo.png" alt="NeoMind180" width={60} height={60} className="object-contain" />
          <div className="w-10" /> {/* Spacer */}
        </header>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter">The be-Enough Shift</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-[#993366]">From Performance to Being</p>
        </div>

        {/* Reflection Workspace */}
        <div className="grid gap-8">
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Current Thought</h3>
            <textarea 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What thought is telling you that you aren't 'enough' right now?"
              className="w-full min-h-[150px] bg-transparent outline-none text-lg font-medium text-slate-800 placeholder:text-slate-300 resize-none"
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleSubmit}
                disabled={isThinking || !reflection.trim()}
                className="px-8 py-4 bg-[#00538e] text-white rounded-full font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ask Neo
              </button>
            </div>
          </div>

          {/* Neo's Response (The "Thinking" Output) */}
          {neoResponse && (
            <div className="bg-white p-10 rounded-[3rem] border-2 border-[#993366]/10 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Heart className="absolute -right-4 -top-4 w-24 h-24 text-[#993366] opacity-5" />
              <h4 className="text-[10px] font-black uppercase text-[#993366] tracking-widest mb-4">Neo's Observation</h4>
              <p className="text-xl font-medium text-slate-800 leading-relaxed italic">
                "{neoResponse}"
              </p>
              <div className="mt-8 flex gap-4">
                <button className="text-[10px] font-black uppercase text-[#00538e] tracking-widest hover:underline">
                  Save to Journal
                </button>
                <button className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:underline" onClick={() => { setReflection(''); setNeoResponse(null); }}>
                  New Reflection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Typewriter } from '@/components/Typewriter';

export default function UnderstandPhase() {
  // 1. STATE MANAGEMENT
  const [userFeeling, setUserFeeling] = useState('');
  const [userIntention, setUserIntention] = useState('');
  const [neoResponse, setNeoResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Neo's Shift

  // 2. THE AI CONNECTION (The "handleSubmit" logic)
  const getNeoShift = async () => {
    if (!userFeeling || !userIntention) return alert("Please fill in both fields.");
    
    setLoading(true);
    try {
      const res = await fetch('/api/neo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feeling: userFeeling, 
          intention: userIntention 
        }),
      });
      
      const data = await res.json();
      setNeoResponse(data.message);
      setStep(2); // Move to the result screen
    } catch (error) {
      setNeoResponse("Neo is momentarily recharging. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-12 h-12 mb-4" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#00538e]">Phase 3: Understand</h2>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">What is the current feeling?</label>
              <textarea 
                value={userFeeling}
                onChange={(e) => setUserFeeling(e.target.value)}
                placeholder="e.g. I feel overwhelmed by my to-do list..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00538e]/10 h-32 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">What is your true intention?</label>
              <textarea 
                value={userIntention}
                onChange={(e) => setUserIntention(e.target.value)}
                placeholder="e.g. I want to provide high-quality computer services to my community..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00538e]/10 h-32 outline-none transition-all"
              />
            </div>

            <button 
              onClick={getNeoShift}
              disabled={loading}
              className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Neo is reflecting..." : "Ask Neo for a 180° Shift"}
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {step === 2 && (
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                <span className="absolute -top-3 left-8 bg-[#00538e] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Neo's Perspective
                </span>
                <p className="text-xl leading-relaxed font-medium italic text-slate-700">
                  "<Typewriter text={neoResponse} speed={40} />"
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Link href="/choose" className="w-full py-4 bg-[#0AA390] text-center text-white rounded-2xl font-bold hover:shadow-lg transition-all">
                Proceed to Phase 4: Choose
              </Link>
              <button onClick={() => setStep(1)} className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-all">
                Rephrase my thoughts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
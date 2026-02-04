"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeparatePhase() {
  const [step, setStep] = useState(1); // 1: Normalize, 2: Signal, 3: Headline
  const [headline, setHeadline] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center p-6">
      
      {/* --- PROGRESS INDICATOR --- */}
      <div className="fixed top-12 flex gap-2">
        <div className="h-1.5 w-12 rounded-full bg-slate-200"></div>
        <div className="h-1.5 w-12 rounded-full bg-slate-200"></div>
        <div className="h-1.5 w-12 rounded-full bg-[#F39904]"></div>
        {[4, 5].map((i) => (
          <div key={i} className="h-1.5 w-12 rounded-full bg-slate-100"></div>
        ))}
      </div>

      <main className="max-w-xl w-full text-center space-y-12">
        
        {/* --- STEP 1: NORMALIZE --- */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">Phase 3: Separate</h2>
            <div className="p-8 bg-[#F39904]/10 rounded-[40px] border-2 border-[#F39904]/20">
              <p className="text-2xl font-serif italic text-slate-800 leading-relaxed">
                "This is a thought, not a fact."
              </p>
            </div>
            <p className="text-lg text-slate-500 font-medium">
              Take a deep breath. How does it feel to say that out loud?
            </p>
            
            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#F39904] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition"
            >
              It feels lighter
            </button>
          </div>
        )}

        {/* --- STEP 2: THE SIGNAL --- */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
             <div className="w-12 h-12 bg-[#F39904] rounded-2xl flex items-center justify-center text-white mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h2 className="text-2xl font-black">Think of it as a signal.</h2>
             <p className="text-lg text-slate-600 leading-relaxed">
               If this thought were just a signal, what might it be asking for? (e.g., safety, rest, preparation, or connection)
             </p>
             
             <textarea 
               autoFocus
               placeholder="The signal might be..."
               className="w-full p-6 bg-slate-50 border-none rounded-3xl text-lg focus:ring-2 focus:ring-[#F39904]/20 outline-none resize-none h-32"
             />

             <button 
               onClick={() => setStep(3)}
               className="w-full py-4 bg-[#F39904] text-white rounded-2xl font-bold text-lg"
             >
               Next: Create Distance
             </button>
          </div>
        )}

        {/* --- STEP 3: THE HEADLINE --- */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <h2 className="text-2xl font-bold text-slate-800">The Headline Technique</h2>
            <p className="text-slate-500 leading-relaxed">
              To create observer distance, name this thought as a short headline. 
              Instead of "I'm failing," try "The 'Not Enough' News."
            </p>
            
            <div className="space-y-4">
              <input 
                autoFocus
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Give your thought a name..."
                className="w-full p-6 bg-slate-50 border-2 border-dashed border-[#F39904]/30 rounded-2xl text-center text-2xl font-black text-[#F39904] focus:outline-none placeholder:text-slate-200"
              />
            </div>

            <button 
              onClick={() => router.push('/understand')}
              disabled={!headline}
              className="w-full py-4 bg-[#F39904] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition disabled:opacity-20"
            >
              Move to Phase 4: Understand →
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
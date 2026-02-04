"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NoticePhase() {
  const [step, setStep] = useState(1); // 1: Anchor, 2: Story, 3: AI Reflection
  const [crowdedThoughts, setCrowdedThoughts] = useState("");
  const [mindActivity, setMindActivity] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center p-6">
      
      {/* --- PROGRESS INDICATOR --- */}
      <div className="fixed top-12 flex gap-2">
        <div className="h-1.5 w-12 rounded-full bg-slate-200"></div>
        <div className="h-1.5 w-12 rounded-full bg-[#0AA390]"></div>
        {[3, 4, 5].map((i) => (
          <div key={i} className="h-1.5 w-12 rounded-full bg-slate-100"></div>
        ))}
      </div>

      <main className="max-w-xl w-full text-center space-y-8">
        
        {/* --- STEP 1: THE ANCHOR --- */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">Phase 2: Notice</h2>
            <p className="text-xl text-slate-500 font-medium">
              "What feels most crowded, heavy, or stuck in your mind right now?"
            </p>
            
            <textarea 
              autoFocus
              value={crowdedThoughts}
              onChange={(e) => setCrowdedThoughts(e.target.value)}
              placeholder="Let it all out... no filter needed."
              className="w-full p-8 bg-slate-50 border-none rounded-[32px] text-lg focus:ring-2 focus:ring-[#0AA390]/20 outline-none resize-none h-64 leading-relaxed"
            />

            <button 
              onClick={() => setStep(2)}
              disabled={!crowdedThoughts}
              className="w-full py-4 bg-[#0AA390] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition disabled:opacity-20"
            >
              Continue
            </button>
          </div>
        )}

        {/* --- STEP 2: THE STORY --- */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-slate-800 italic">"What is your mind doing? What story are you telling yourself?"</h2>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Look at the thinking, not just the problem.</p>
            
            <textarea 
              autoFocus
              value={mindActivity}
              onChange={(e) => setMindActivity(e.target.value)}
              placeholder="e.g. My mind is looping on worst-case scenarios... I'm telling myself I'm not enough."
              className="w-full p-8 bg-slate-50 border-none rounded-[32px] text-lg focus:ring-2 focus:ring-[#0AA390]/20 outline-none resize-none h-64 leading-relaxed"
            />

            <button 
              onClick={() => setStep(3)}
              disabled={!mindActivity}
              className="w-full py-4 bg-[#0AA390] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition disabled:opacity-20"
            >
              Notice This
            </button>
          </div>
        )}

        {/* --- STEP 3: GENTLE REFLECTION --- */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 bg-[#0AA390]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0AA390]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            
            <div className="bg-[#0AA390]/5 p-8 rounded-[40px] border border-[#0AA390]/10 space-y-4">
              <span className="text-[10px] font-black text-[#0AA390] uppercase tracking-widest block">Neo's Reflection</span>
              <p className="text-lg text-slate-700 leading-relaxed italic">
                "I hear how heavy the story of <span className="font-bold text-slate-900">'{crowdedThoughts.substring(0, 20)}...'</span> feels. It’s a lot to carry, and it makes sense that your mind is trying to protect you by looping on these details."
              </p>
              <p className="text-sm text-slate-500">
                You’re doing great. Simply noticing these thoughts is the first step toward loosening their grip.
              </p>
            </div>

            <button 
              onClick={() => router.push('/separate')}
              className="w-full py-4 bg-[#0AA390] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition"
            >
              Move to Phase 3: Separate →
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
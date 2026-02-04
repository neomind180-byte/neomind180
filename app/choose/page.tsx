"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ChoosePhase() {
  const [step, setStep] = useState(1); // 1: The Step, 2: Alignment Check, 3: Micro-reset
  const [actionStep, setActionStep] = useState("");
  const [alignment, setAlignment] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const microResets = [
    { title: "Grounded Breath", desc: "One deep breath, exhaling twice as long as the inhale." },
    { title: "Body Check", desc: "Release your jaw and drop your shoulders away from your ears." },
    { title: "Affirmation", desc: "I am a calm observer, taking steady action." }
  ];

  async function completeJourney() {
    setIsSaving(true);
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Save this session to your 'checkins' table
      const { error } = await supabase
        .from('checkins')
        .insert([
          { 
            user_id: user.id,
            mood_score: alignment || 5, // We'll use the alignment score as the 'mood' for this session
            intention_text: actionStep,
            ai_coaching: "Session complete. You chose action over overthinking."
          }
        ]);

      if (error) {
        console.error("Error saving session:", error.message);
      }
    }

    setIsSaving(false);
    setStep(3);
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- PROGRESS INDICATOR --- */}
      <div className="fixed top-12 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1.5 w-12 rounded-full bg-slate-200"></div>
        ))}
        <div className="h-1.5 w-12 rounded-full bg-[#00538e]"></div>
      </div>

      <div className="fixed top-8 right-8">
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition">
          Exit Session
        </Link>
      </div>

      <main className="max-w-xl w-full text-center space-y-12">
        
        {/* --- STEP 1: THE ACTION STEP --- */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">Phase 5: Choose</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              "What is one grounded, aligned next step you can take from here?"
            </p>
            
            <textarea 
              autoFocus
              value={actionStep}
              onChange={(e) => setActionStep(e.target.value)}
              placeholder="Keep it small and concrete... e.g., 'I will send that one email now.'"
              className="w-full p-8 bg-slate-50 border-none rounded-[32px] text-lg focus:ring-2 focus:ring-[#00538e]/20 outline-none resize-none h-48 leading-relaxed shadow-inner"
            />

            <button 
              onClick={() => setStep(2)}
              disabled={!actionStep}
              className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition disabled:opacity-20 shadow-[0_10px_20px_rgba(0,83,142,0.2)]"
            >
              Check Alignment
            </button>
          </div>
        )}

        {/* --- STEP 2: ALIGNMENT CHECK --- */}
        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">How does this step feel?</h2>
              <p className="text-slate-500">On a scale of 1–10, how <span className="text-rose-500 font-bold underline">pressured</span> vs <span className="text-[#0AA390] font-bold underline">aligned</span> does that feel?</p>
            </div>

            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setAlignment(num)}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-black transition-all border-2 ${
                    alignment === num 
                    ? 'bg-[#00538e] text-white border-[#00538e] scale-110 shadow-lg' 
                    : 'bg-white text-slate-300 border-slate-100 hover:border-[#00538e]/30'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
              <span>Very Pressured</span>
              <span>Perfectly Aligned</span>
            </div>

            <button 
              onClick={completeJourney}
              disabled={alignment === null || isSaving}
              className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition disabled:opacity-20"
            >
              {isSaving ? "Saving Session..." : "Complete Journey"}
            </button>
          </div>
        )}

        {/* --- STEP 3: THE CLOSE / MICRO-RESET --- */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-1000">
            <div className="w-20 h-20 bg-[#0AA390]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0AA390]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900">Journey Complete.</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              You’ve moved from overthinking to clarity. <br />
              <span className="font-bold text-[#00538e]">Carry this calm with you.</span>
            </p>

            <div className="space-y-4 pt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Final Micro-Reset Option</p>
              {microResets.map((reset, i) => (
                <button 
                  key={i}
                  onClick={() => router.push('/dashboard')}
                  className="w-full p-6 bg-white border border-slate-100 rounded-[24px] text-left hover:border-[#00538e] hover:shadow-md transition-all group"
                >
                  <h4 className="font-bold text-[#00538e] mb-1 group-hover:translate-x-1 transition-transform">{reset.title}</h4>
                  <p className="text-sm text-slate-500">{reset.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
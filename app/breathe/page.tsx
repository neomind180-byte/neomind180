"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BreathePhase() {
  const [step, setStep] = useState(1); // 1: Entrance, 2: Breathing, 3: Body Scan
  const [userInput, setUserInput] = useState("");
  const [breatheState, setBreatheState] = useState("Inhale");
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // --- BOX BREATHING LOGIC ---
  useEffect(() => {
    if (step === 2) {
      // 4-4-4-4 Box Breathing Cycle
      const sequence = ["Inhale", "Hold", "Exhale", "Rest"];
      let i = 0;
      
      const interval = setInterval(() => {
        i = (i + 1) % sequence.length;
        setBreatheState(sequence[i]);
      }, 4000);

      // Auto-move to body scan after 90 seconds
      const timer = setTimeout(() => setStep(3), 90000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [step]);

  const startSession = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    setStep(2);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* BACKGROUND AUDIO */}
      <audio ref={audioRef} src="/breathe-meditation.mp3" />

      {/* --- PROGRESS BAR --- */}
      <div className="fixed top-12 flex gap-2">
        <div className="h-1.5 w-12 rounded-full bg-[#00538e]"></div>
        {[2, 3, 4, 5].map((i) => (
          <div key={i} className="h-1.5 w-12 rounded-full bg-slate-100"></div>
        ))}
      </div>

      {/* SAVE & EXIT */}
      <div className="fixed top-8 right-8 flex items-center gap-4">
        <button onClick={toggleMute} className="text-slate-300 hover:text-slate-500">
          {isMuted ? "🔇" : "🔊"}
        </button>
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition">
          Exit
        </Link>
      </div>

      <main className="max-w-xl w-full text-center">
        
        {/* STEP 1: ENTRANCE */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <h2 className="text-3xl font-black text-slate-900">Phase 1: Breathe</h2>
            <div className="space-y-4 text-left">
              <label className="text-xs font-bold uppercase tracking-widest text-[#00538e]">The Entry Point</label>
              <textarea 
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="In one sentence: what brings you here today?"
                className="w-full p-8 bg-slate-50 border-none rounded-[32px] text-lg focus:ring-2 focus:ring-[#00538e]/10 outline-none resize-none h-32 leading-relaxed"
              />
            </div>
            <button 
              onClick={startSession}
              disabled={!userInput}
              className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition disabled:opacity-20"
            >
              Begin Centering
            </button>
          </div>
        )}

        {/* STEP 2: ANIMATED BOX BREATHING */}
        {step === 2 && (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="space-y-2">
              <h2 className={`text-5xl font-black transition-colors duration-1000 ${
                breatheState === 'Inhale' ? 'text-[#00538e]' : 
                breatheState === 'Exhale' ? 'text-[#F39904]' : 'text-[#0AA390]'
              }`}>
                {breatheState}
              </h2>
              <p className="text-slate-400 font-medium tracking-wide">Follow the rhythm of the circle.</p>
            </div>

            <div className="flex justify-center items-center h-80">
              {/* Dynamic Scaling Circle */}
              <div className={`
                relative flex items-center justify-center rounded-full transition-all duration-[4000ms] ease-in-out
                ${breatheState === 'Inhale' ? 'w-72 h-72 bg-[#00538e]/10 scale-110 shadow-[0_0_50px_rgba(0,83,142,0.1)]' : ''}
                ${breatheState === 'Hold' ? 'w-72 h-72 bg-[#0AA390]/10 scale-110 shadow-[0_0_50px_rgba(10,163,144,0.1)]' : ''}
                ${breatheState === 'Exhale' ? 'w-32 h-32 bg-[#F39904]/10 scale-90 shadow-none' : ''}
                ${breatheState === 'Rest' ? 'w-32 h-32 bg-slate-50 scale-90 shadow-none' : ''}
              `}>
                <div className={`w-16 h-16 bg-white rounded-full shadow-lg border border-slate-100 transition-transform duration-[4000ms] ${
                  breatheState === 'Inhale' ? 'scale-150' : 'scale-100'
                }`}></div>
              </div>
            </div>

            <button onClick={() => setStep(3)} className="text-slate-300 hover:text-[#00538e] text-xs font-bold uppercase tracking-widest transition">
              I feel centered
            </button>
          </div>
        )}

        {/* STEP 3: BODY SCAN */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <h2 className="text-2xl font-bold text-slate-800 italic">"What do you notice in your body right now?"</h2>
            <div className="grid grid-cols-2 gap-3">
              {["Tightness", "Heavy", "Light", "Still", "Fluttery", "Tense"].map((s) => (
                <button 
                  key={s}
                  onClick={() => router.push('/notice')}
                  className="py-5 border-2 border-slate-50 bg-slate-50/30 rounded-3xl font-bold text-slate-600 hover:border-[#0AA390] hover:text-[#0AA390] hover:bg-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
import Link from 'next/link';
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnderstandPhase() {
  const [step, setStep] = useState(1); // 1: Socratic/Friend, 2: Values Shift
  const [friendPerspective, setFriendPerspective] = useState("");
  const router = useRouter();

  const values = [
    { name: "Peace", icon: "🕊️" },
    { name: "Clarity", icon: "💎" },
    { name: "Courage", icon: "🦁" },
    { name: "Authenticity", icon: "✨" },
    { name: "Connection", icon: "🤝" },
    { name: "Balance", icon: "⚖️" },
    { name: "Meaning", icon: "🌱" }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center p-6">
      
      {/* --- PROGRESS INDICATOR --- */}
      <div className="fixed top-12 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 w-12 rounded-full bg-slate-200"></div>
        ))}
        <div className="h-1.5 w-12 rounded-full bg-[#993366]"></div>
        <div className="h-1.5 w-12 rounded-full bg-slate-100"></div>
      </div>

      {/* --- SAVE & EXIT --- */}
      <div className="fixed top-8 right-8">
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition">
          Save & Exit
        </Link>
      </div>

      <main className="max-w-xl w-full text-center space-y-12">
        
        {/* --- STEP 1: COMPASSIONATE INQUIRY --- */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
            <h2 className="text-3xl font-black text-slate-900 text-center">Phase 4: Understand</h2>
            
            <div className="space-y-6 bg-[#993366]/5 p-8 rounded-[40px] border border-[#993366]/10">
              <p className="text-xl font-medium text-slate-800 leading-relaxed">
                "If your best friend had this thought, what else might be true?"
              </p>
              <textarea 
                autoFocus
                value={friendPerspective}
                onChange={(e) => setFriendPerspective(e.target.value)}
                placeholder="Looking with kindness, I would tell them..."
                className="w-full p-6 bg-white border-none rounded-3xl text-lg focus:ring-2 focus:ring-[#993366]/20 outline-none resize-none h-40 shadow-sm"
              />
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!friendPerspective}
              className="w-full py-4 bg-[#993366] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition disabled:opacity-20"
            >
              Look Deeper
            </button>
          </div>
        )}

        {/* --- STEP 2: VALUES-BASED INTERPRETATION --- */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-black">The Value Shift</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Fear tells one story. Your values tell another. <br />
              <span className="font-bold text-[#993366]">What value do you want to lean into right now?</span>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {values.map((v) => (
                <button 
                  key={v.name}
                  onClick={() => router.push('/choose')}
                  className="group p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#993366] transition-all text-center"
                >
                  <div className="text-2xl mb-1 group-hover:scale-125 transition-transform">{v.icon}</div>
                  <div className="font-bold text-sm text-slate-600 group-hover:text-[#993366]">{v.name}</div>
                </button>
              ))}
            </div>

            <p className="text-sm text-slate-400 italic">
              Choosing a value shifts your perspective from being "stuck" to being "aligned."
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
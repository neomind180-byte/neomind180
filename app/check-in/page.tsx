"use client";

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { Typewriter } from '@/components/Typewriter';

export default function CheckInPhase() {
  const [userId, setUserId] = useState<string | null>(null);
  const [feeling, setFeeling] = useState('');
  const [intention, setIntention] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Get userId from localStorage or auth context
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleCheckIn = async () => {
    if (!feeling || !intention) return alert("Please fill in both fields.");
    if (!userId) return alert("User not authenticated. Please log in.");

    setLoading(true);
    try {
      const response = await fetch('/api/neo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          mood: "checking-in",
          feeling, 
          intention 
        }),
      });

      const data = await response.json();
      const shiftText = data.message || data.error || "Neo is reflecting. Please try again.";
      setResponse(shiftText);
      setStep(2);
    } catch (error) {
      console.error("Check-in Error:", error);
      setResponse("Connection lost. Please try again.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-12 h-12 mb-4" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#00538e]">Daily Check-In</h2>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">How are you feeling today?</label>
              <textarea 
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Share your current feeling..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00538e]/10 h-32 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">What do you intend to accomplish?</label>
              <textarea 
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="Share your intention..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00538e]/10 h-32 outline-none transition-all"
              />
            </div>

            <button 
              onClick={handleCheckIn}
              disabled={loading || !userId}
              className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Neo is processing..." : "Check In with Neo"}
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {step === 2 && (
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                <span className="absolute -top-3 left-8 bg-[#00538e] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Neo's Insight
                </span>
                <p className="text-xl leading-relaxed font-medium italic text-slate-700">
                  "<Typewriter text={response} speed={40} />"
                </p>
              </div>
            )}

            <button 
              onClick={() => setStep(1)} 
              className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              Another Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
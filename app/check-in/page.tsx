"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Typewriter } from '@/components/Typewriter'; // Ensure this exists

export default function CheckIn() {
  const router = useRouter();
  const [mood, setMood] = useState(5);
  const [feeling, setFeeling] = useState('');
  const [intention, setIntention] = useState('');
  const [neoResponse, setNeoResponse] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    }
    checkUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    // 1. Get User ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // 2. Send to our new API Route (/api/neo)
      const response = await fetch('/api/neo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mood,
          feeling,
          intention
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Store Neo's Shift and Show Success
        setNeoResponse(data.message);
        setStatus('success');
      } else {
        throw new Error(data.error || "Something went wrong with Neo.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Connection failed");
      setStatus('idle');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100">
        
        {status === 'loading' ? (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00538e] mx-auto mb-4"></div>
            <p className="text-lg text-slate-600 font-medium">Neo is reflecting on your mindset...</p>
          </div>
        ) : status === 'success' ? (
          <div className="py-10 text-center space-y-6">
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-700 text-lg">
               "<Typewriter text={neoResponse} speed={40} />"
             </div>
             <button 
               onClick={() => router.push('/dashboard')}
               className="w-full py-4 bg-[#0AA390] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
             >
               Continue to Dashboard
             </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Daily Check-in</h1>
              <p className="text-slate-500 text-sm">Be honest. A 180° shift requires truth.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Slider */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Grounding Level ({mood}/10)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="10" value={mood} 
                    onChange={(e) => setMood(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00538e]"
                  />
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Current Feeling</label>
                  <textarea 
                    required rows={3}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-[#00538e]/10 outline-none resize-none transition-all"
                    placeholder="I feel..."
                    value={feeling} onChange={(e) => setFeeling(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Today's Intention</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-[#00538e]/10 outline-none transition-all"
                    placeholder="I will focus on..."
                    value={intention} onChange={(e) => setIntention(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => router.back()} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition">Cancel</button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-[#00538e] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                >
                  Get Coaching
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
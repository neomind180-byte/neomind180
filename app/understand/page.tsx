"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Typewriter } from '@/components/Typewriter';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ArrowRight, Sparkles, Brain } from 'lucide-react';

export default function UnderstandPage() {
  const router = useRouter();
  
  // State
  const [step, setStep] = useState(1); // 1: Input, 2: The Shift
  const [feeling, setFeeling] = useState('');
  const [intention, setIntention] = useState('');
  const [neoResponse, setNeoResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Auth Check
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    }
    checkUser();
  }, [router]);

  const getNeoShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Explicitly fetch the user to ensure the session is fresh (Crucial for Mobile)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Session expired. Please sign in again.");
        router.push('/login');
        return;
      }

      // 2. Call the Gemini 3 Flash API
      const response = await fetch('/api/neo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          feeling, 
          intention 
        }),
      });
      
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Neo is recharging.");

      // 3. Set Response and Move to Phase 2
      setNeoResponse(data.message);
      setStep(2);

      // 4. Check for Upgrade Prompt Logic (Post-First Session)
      const { data: profile } = await supabase
        .from('profiles')
        .select('sessions_this_month, plan')
        .eq('id', user.id)
        .single();

      if (profile?.plan === 'Basic Self-Help' && profile?.sessions_this_month === 1) {
        setShowUpgrade(true);
      }

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
        
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-[#00538e]">
                <Brain className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Deep Dive Session</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                What is clouding <br />your mind?
              </h1>
              <p className="text-slate-500 text-sm italic">Phase 1 & 2: Breathe and Notice.</p>
            </header>

            <form onSubmit={getNeoShift} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Current Feeling</label>
                <textarea 
                  required rows={4}
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-[#00538e]/10 outline-none resize-none transition-all text-slate-700"
                  placeholder="Describe the thought or feeling you want to shift..."
                  value={feeling} onChange={(e) => setFeeling(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Your Intention</label>
                <input 
                  type="text" required
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-[#00538e]/10 outline-none transition-all text-slate-700"
                  placeholder="What do you want to choose instead?"
                  value={intention} onChange={(e) => setIntention(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">Neo is reflecting...</span>
                  </span>
                ) : (
                  <>
                    Request 180° Shift
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <header className="space-y-2">
              <div className="flex items-center gap-2 text-[#0AA390]">
                <Sparkles className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">The Shift</span>
              </div>
              <p className="text-slate-500 text-sm italic">Phase 3 & 4: Separate and Understand.</p>
            </header>

            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 min-h-[200px]">
              <div className="text-lg text-slate-700 leading-relaxed font-medium italic">
                "<Typewriter text={neoResponse} speed={40} />"
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">Phase 5: Choose</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full py-5 bg-[#0AA390] text-white rounded-2xl font-bold hover:shadow-xl transition-all"
              >
                Carry this Grounding Forward
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors"
              >
                Refine the perspective
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal triggers based on session count logic in getNeoShift */}
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
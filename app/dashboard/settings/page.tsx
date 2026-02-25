"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const coachModes = [
  {
    id: 'Gentle Observer',
    name: 'The Gentle Observer',
    desc: 'Soft, validating, and slow-paced.',
    tier: 'Basic Self-Help'
  },
  {
    id: 'Insightful Mirror',
    name: 'The Insightful Mirror',
    desc: 'Reflective; helps see patterns.',
    tier: 'Coaching Access'
  },
  {
    id: 'Grounded Guide',
    name: 'The Grounded Guide',
    desc: 'Practical, concrete, and action-oriented.',
    tier: 'Coaching Access'
  }
];

export default function SettingsPage() {
  const [userPlan, setUserPlan] = useState('Basic Self-Help');
  const [selectedMode, setSelectedMode] = useState('Gentle Observer');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier, preferred_coach_mode')
          .eq('id', user.id)
          .single();

        if (data) {
          if (data.subscription_tier === 'tier2') setUserPlan('Coaching Access');
          if (data.subscription_tier === 'tier3') setUserPlan('Coaching Access'); // Both Coaching Access tiers
          if (data.preferred_coach_mode) setSelectedMode(data.preferred_coach_mode);
        }
      }
      setLoading(false);
    }
    loadPreferences();
  }, []);

  const handleModeSelect = async (modeId: string) => {
    const mode = coachModes.find(m => m.id === modeId);
    if (!mode) return;

    // Check if locked
    const isLocked = mode.tier !== 'Basic Self-Help' && userPlan === 'Basic Self-Help';
    if (isLocked) return;

    setSelectedMode(modeId);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ preferred_coach_mode: modeId })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error("Error saving preference:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00538e]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 md:p-12 animate-in fade-in duration-700">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-10 font-black uppercase text-[10px] tracking-widest group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase mb-4 tracking-tighter">Coach Preferences</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium italic">Personalize Neo's observation style to match your journey.</p>
        </div>
        {saving && (
          <div className="text-[10px] font-black uppercase tracking-widest text-[#0AA390] mb-1 animate-pulse">
            Saving...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {coachModes.map((mode) => {
          const isLocked = mode.tier !== 'Basic Self-Help' && userPlan === 'Basic Self-Help';
          const isActive = selectedMode === mode.id;

          return (
            <div
              key={mode.id}
              className={`p-10 rounded-[2.5rem] border transition-all relative overflow-visible ${isLocked ? 'bg-[var(--bg-card)]/30 border-[var(--border)] opacity-60 cursor-not-allowed' :
                isActive ? 'border-[#00538e] bg-[var(--bg-card)] shadow-2xl shadow-[#00538e]/10' : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--text-dim)] cursor-pointer'
                }`}
              onClick={() => handleModeSelect(mode.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-black uppercase text-sm tracking-tight mb-1 ${isActive ? 'text-[#0AA390]' : 'text-[var(--text-primary)]'}`}>{mode.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] italic">"{mode.desc}"</p>
                </div>
                {isLocked ? (
                  <div className="group relative">
                    <Lock className="w-6 h-6 text-[var(--text-dim)]" />
                    <div className="absolute right-0 bottom-full mb-4 hidden group-hover:block w-72 p-6 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[10px] rounded-2xl shadow-2xl z-50">
                      <p className="mb-4 font-black uppercase tracking-widest">Expansion Required</p>
                      <p className="mb-6 text-[var(--text-muted)] italic">Upgrade to {mode.tier} to unlock deeper guidance.</p>
                      <Link href="/pricing" className="block w-full py-3 bg-[#00538e] text-white text-center rounded-xl font-bold uppercase tracking-widest hover:shadow-lg transition-all">Explore Plans</Link>
                    </div>
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-[#0AA390] bg-[#0AA390]/10' : 'border-[var(--border)]'}`}>
                    {isActive && <div className="w-2.5 h-2.5 bg-[#0AA390] rounded-full shadow-[0_0_10px_#0AA390]" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

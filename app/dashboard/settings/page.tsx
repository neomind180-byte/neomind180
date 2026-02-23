"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

const coachModes = [
  { id: 'Gentle Observer', name: 'The Gentle Observer', desc: 'Soft, validating, and slow-paced.', tier: 'Basic Self-Help' },
  { id: 'Insightful Mirror', name: 'The Insightful Mirror', desc: 'Reflective; helps see patterns.', tier: 'Coaching Access' },
  { id: 'Grounded Guide', name: 'The Grounded Guide', desc: 'Practical, concrete, and action-oriented.', tier: 'Coaching Access' }
];

export default function SettingsPage() {
  const [userPlan] = useState('Basic Self-Help');
  const [selectedMode, setSelectedMode] = useState('Gentle Observer');

  return (
    <div className="max-w-2xl mx-auto p-8 md:p-12 animate-in fade-in duration-700">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-10 font-black uppercase text-[10px] tracking-widest group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase mb-4 tracking-tighter">Coach Preferences</h1>
        <p className="text-[var(--text-muted)] text-sm font-medium italic">Personalize Neo's observation style to match your journey.</p>
      </div>

      <div className="space-y-6">
        {coachModes.map((mode) => {
          const isLocked = mode.tier !== 'Basic Self-Help' && userPlan === 'Basic Self-Help';

          return (
            <div
              key={mode.id}
              className={`p-10 rounded-[2.5rem] border transition-all relative overflow-visible ${isLocked ? 'bg-[var(--bg-card)]/30 border-[var(--border)] opacity-60 cursor-not-allowed' :
                  selectedMode === mode.id ? 'border-[#00538e] bg-[var(--bg-card)] shadow-2xl shadow-[#00538e]/10' : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[#475569] cursor-pointer'
                }`}
              onClick={() => !isLocked && setSelectedMode(mode.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-black uppercase text-sm tracking-tight mb-1 ${selectedMode === mode.id ? 'text-[#0AA390]' : 'text-[var(--text-primary)]'}`}>{mode.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] italic">"{mode.desc}"</p>
                </div>
                {isLocked ? (
                  <div className="group relative">
                    <Lock className="w-6 h-6 text-[#2d3548]" />
                    <div className="absolute right-0 bottom-full mb-4 hidden group-hover:block w-72 p-6 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[10px] rounded-2xl shadow-2xl z-50">
                      <p className="mb-4 font-black uppercase tracking-widest">Expansion Required</p>
                      <p className="mb-6 text-[var(--text-muted)] italic">Upgrade to {mode.tier} to unlock deeper guidance.</p>
                      <Link href="/pricing" className="block w-full py-3 bg-[#00538e] text-white text-center rounded-xl font-bold uppercase tracking-widest hover:shadow-lg transition-all">Explore Plans</Link>
                    </div>
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedMode === mode.id ? 'border-[#0AA390] bg-[#0AA390]/10' : 'border-[var(--border)]'}`}>
                    {selectedMode === mode.id && <div className="w-2.5 h-2.5 bg-[#0AA390] rounded-full shadow-[0_0_10px_#0AA390]" />}
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
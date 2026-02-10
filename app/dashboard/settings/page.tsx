"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

const coachModes = [
  { id: 'Gentle Observer', name: 'The Gentle Observer', desc: 'Soft, validating, and slow-paced.', tier: 'Basic Self-Help' },
  { id: 'Insightful Mirror', name: 'The Insightful Mirror', desc: 'Reflective; helps see patterns.', tier: 'Coaching Access' },
  { id: 'Grounded Guide', name: 'The Grounded Guide', desc: 'Practical, concrete, and action-oriented.', tier: 'Coaching Access' }
];

export default function SettingsPage() {
  const [userPlan, setUserPlan] = useState('Basic Self-Help');
  const [selectedMode, setSelectedMode] = useState('Gentle Observer');

  return (
    <div className="max-w-2xl mx-auto p-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00538e] transition-colors mb-8 font-bold uppercase text-[10px] tracking-widest group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <h1 className="text-2xl font-black text-[#00538e] uppercase mb-8 tracking-tighter">Coach Preferences</h1>
      
      <div className="space-y-4">
        {coachModes.map((mode) => {
          // Lock logic based on new Tier names 
          const isLocked = mode.tier !== 'Basic Self-Help' && userPlan === 'Basic Self-Help';
          
          return (
            <div 
              key={mode.id}
              className={`p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden ${
                isLocked ? 'bg-slate-50 border-slate-100 opacity-70 cursor-not-allowed' : 
                selectedMode === mode.id ? 'border-[#00538e] bg-white shadow-md' : 'border-transparent bg-white hover:border-slate-200 cursor-pointer'
              }`}
              onClick={() => !isLocked && setSelectedMode(mode.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{mode.name}</h3>
                  <p className="text-xs text-slate-500">{mode.desc}</p>
                </div>
                {isLocked ? (
                  <div className="group relative">
                    <Lock className="w-5 h-5 text-slate-300" />
                    <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block w-64 p-5 bg-slate-800 text-white text-[10px] rounded-2xl shadow-2xl z-50">
                      <p className="mb-3">Upgrade to {mode.tier} to unlock deeper guidance.</p>
                      <Link href="/pricing" className="block w-full py-2 bg-[#0AA390] text-white text-center rounded-xl font-bold uppercase">Upgrade</Link>
                    </div>
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMode === mode.id ? 'border-[#00538e] bg-[#00538e]' : 'border-slate-200'}`}>
                    {selectedMode === mode.id && <div className="w-2 h-2 bg-white rounded-full" />}
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
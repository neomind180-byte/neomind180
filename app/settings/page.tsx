"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const coachModes = [
  { 
    id: 'Gentle Observer', 
    name: 'The Gentle Observer', 
    desc: 'Soft, validating, and slow-paced.', 
    isFree: true 
  },
  { 
    id: 'Insightful Mirror', 
    name: 'The Insightful Mirror', 
    desc: 'Reflective; helps see patterns.', 
    isFree: false 
  },
  { 
    id: 'Grounded Guide', 
    name: 'The Grounded Guide', 
    desc: 'Practical, concrete, and action-oriented.', 
    isFree: false 
  }
];

export default function SettingsPage() {
  const [userPlan, setUserPlan] = useState('Basic Self-Help');
  const [selectedMode, setSelectedMode] = useState('Gentle Observer');

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-black text-[#00538e] uppercase mb-8">Coach Preferences</h1>
      
      <div className="space-y-4">
        {coachModes.map((mode) => {
          const isLocked = !mode.isFree && userPlan === 'Basic Self-Help';
          
          return (
            <div 
              key={mode.id}
              className={`p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden ${
                isLocked ? 'bg-slate-50 border-slate-100 opacity-70' : 
                selectedMode === mode.id ? 'border-[#00538e] bg-white shadow-md' : 'border-transparent bg-white hover:border-slate-200'
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
                    <span className="text-xl">🔒</span>
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-xl z-50">
                      Upgrade to Monthly or Yearly to unlock all coach modes for deeper guidance.
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
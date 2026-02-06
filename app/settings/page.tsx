"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  // 1. Fetch Plan & Current Mode on Load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan, coach_mode')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            setUserPlan(profile.plan || 'Basic Self-Help');
            // If they have a mode saved, use it; otherwise default
            if (profile.coach_mode) setSelectedMode(profile.coach_mode);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Handle Saving the New Mode
  const handleModeSelect = async (modeId: string) => {
    setSelectedMode(modeId);
    
    // Save to Supabase immediately
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ coach_mode: modeId })
        .eq('id', user.id);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading preferences...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      
      {/* 3. Link Back to Dashboard */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00538e] transition-colors mb-8 font-bold uppercase text-[10px] tracking-widest group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-black text-[#00538e] uppercase mb-8">Coach Preferences</h1>
      
      <div className="space-y-4">
        {coachModes.map((mode) => {
          // 4. Logic to Unlock for Paid Users
          // If the plan is NOT Basic, we assume it's a paid tier (Monthly/Yearly)
          const isPaidUser = userPlan !== 'Basic Self-Help';
          
          // It is locked ONLY if it's not a free mode AND the user is not paid
          const isLocked = !mode.isFree && !isPaidUser;
          
          return (
            <div 
              key={mode.id}
              className={`p-6 rounded-[2rem] border-2 transition-all relative overflow-visible ${
                isLocked ? 'bg-slate-50 border-slate-100 opacity-90' : 
                selectedMode === mode.id ? 'border-[#00538e] bg-white shadow-md' : 'border-transparent bg-white hover:border-slate-200 cursor-pointer'
              }`}
              onClick={() => !isLocked && handleModeSelect(mode.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{mode.name}</h3>
                  <p className="text-xs text-slate-500">{mode.desc}</p>
                </div>
                
                {isLocked ? (
                  <div className="group relative">
                    <span className="text-xl cursor-help opacity-60 hover:opacity-100 transition-opacity">🔒</span>
                    
                    {/* 5. The Upgrade Popup */}
                    <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block w-64 p-5 bg-slate-800 text-white text-xs rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                      <p className="mb-4 leading-relaxed font-medium text-slate-200">
                        Upgrade to access all coach modes for deeper guidance
                      </p>
                      <Link 
                        href="/pricing" 
                        className="block w-full py-3 bg-[#0AA390] text-white text-center rounded-xl font-bold hover:bg-[#088f7e] transition-all shadow-lg hover:shadow-[#0AA390]/20"
                      >
                        Upgrade
                      </Link>
                      {/* Tooltip Arrow */}
                      <div className="absolute bottom-[-6px] right-2 w-3 h-3 bg-slate-800 rotate-45"></div>
                    </div>
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMode === mode.id ? 'border-[#00538e] bg-[#00538e]' : 'border-slate-200'}`}>
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
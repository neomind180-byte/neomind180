"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wind } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Fixed: Added import

const checkInSteps = [
  {
    id: 'mind',
    label: 'Mind',
    options: ['Noisy', 'Balanced', 'Clear'],
    description: 'How crowded is your mental space right now?'
  },
  {
    id: 'body',
    label: 'Body',
    options: ['Tense', 'Neutral', 'Calm'],
    description: 'Notice any physical holding or ease.'
  },
  {
    id: 'energy',
    label: 'Energy',
    options: ['Low', 'Medium', 'Steady'],
    description: 'What is your capacity for action right now?'
  }
];

export default function CheckInPage() {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (category: string, option: string) => {
    setSelections(prev => ({ ...prev, [category]: option }));
  };

  // Fixed: Added logic to verify all steps are completed
  const allSelected = checkInSteps.every(step => selections[step.id]);

  const handleSubmit = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fixed: supabase is now defined via import
        await supabase.from('check_ins').insert([
          { 
            user_id: user.id,
            mind: selections.mind,
            body: selections.body,
            energy: selections.energy 
          }
        ]);
      }

      setIsSubmitted(true);
      setTimeout(() => router.push('/dashboard'), 2000);
      
    } catch (error) {
      console.error('Error saving check-in:', error);
      // Optional: Add error state handling here
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-[#0AA390]/10 rounded-full flex items-center justify-center animate-bounce">
          <Wind className="w-12 h-12 text-[#0AA390]" />
        </div>
        <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter">Acknowledge.</h1>
        <p className="text-slate-500 font-medium">Your check-in is complete. Returning to your 180° path...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-12">
        
        <header className="flex items-center">
          <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          {/* Logo removed for sidebar consistency */}
        </header>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter">Daily Check-In</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#0AA390]" /> Under 1 minute to clarity
          </p>
        </div>

        <div className="space-y-10">
          {checkInSteps.map((step) => (
            <div key={step.id} className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{step.label}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{step.description}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {step.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(step.id, option)}
                    className={`py-6 rounded-[2rem] font-bold text-xs uppercase tracking-widest border-2 transition-all ${
                      selections[step.id] === option 
                        ? "bg-[#0AA390] border-transparent text-white shadow-lg scale-[1.02]" 
                        : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-12">
          {/* Fixed: allSelected is now defined */}
          <button
            onClick={handleSubmit}
            disabled={!allSelected}
            className="w-full py-6 bg-[#00538e] text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all disabled:opacity-30 disabled:shadow-none"
          >
            Complete Check-In
          </button>
          <p className="text-center mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Rethink. Rewire. Renew.
          </p>
        </div>
      </div>
    </div>
  );
}
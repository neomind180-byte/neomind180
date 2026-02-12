"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wind } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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

  const allSelected = checkInSteps.every(step => selections[step.id]);

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-[#0AA390]/10 rounded-full flex items-center justify-center animate-bounce border border-[#0AA390]/20">
          <Wind className="w-12 h-12 text-[#0AA390]" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Acknowledge.</h1>
        <p className="text-[#94a3b8] font-medium italic">Your check-in is complete. Returning to your 180° path...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e] font-sans text-[#cbd5e1]">
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-12">

        <header className="flex items-center">
          <Link href="/dashboard" className="p-2 hover:bg-[#232938] rounded-full transition-colors text-[#94a3b8] hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </header>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Daily Check-In</h1>
          <p className="text-sm text-[#94a3b8] font-bold uppercase tracking-widest flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#0AA390]" /> Under 1 minute to clarity
          </p>
        </div>

        <div className="space-y-12">
          {checkInSteps.map((step) => (
            <div key={step.id} className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">{step.label}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#475569]">{step.description}</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {step.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(step.id, option)}
                    className={`py-6 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.2em] border transition-all ${selections[step.id] === option
                        ? "bg-[#0AA390] border-transparent text-white shadow-lg shadow-[#0AA390]/20 scale-[1.02]"
                        : "bg-[#232938] border-[#2d3548] text-[#475569] hover:border-[#0AA390]/50 hover:text-white"
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
          <button
            onClick={handleSubmit}
            disabled={!allSelected}
            className="w-full py-6 bg-[#00538e] text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:shadow-2xl shadow-[#00538e]/20 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:shadow-none"
          >
            Complete Check-In
          </button>
          <p className="text-center mt-6 text-[10px] font-bold uppercase tracking-widest text-[#475569]">
            Rethink. Rewire. Renew.
          </p>
        </div>
      </div>
    </div>
  );
}
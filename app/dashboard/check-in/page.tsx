"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wind, CheckCircle2, Loader2, Heart, Brain, Target } from 'lucide-react';
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
  const [stuckIndex, setStuckIndex] = useState<number>(5);
  const [compassionRating, setCompassionRating] = useState<number>(3);
  const [alignedStep, setAlignedStep] = useState<boolean | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  useEffect(() => {
    async function checkDailyLimit() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('check_ins')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          setAlreadyCheckedIn(true);
        }
      } catch (err) {
        console.error('Error checking daily limit:', err);
      } finally {
        setLoading(false);
      }
    }

    checkDailyLimit();
  }, [router]);

  const handleSelect = (category: string, option: string) => {
    setSelections(prev => ({ ...prev, [category]: option }));
  };

  const allSelected = checkInSteps.every(step => selections[step.id]) && alignedStep !== null;

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('check_ins').insert([
          {
            user_id: user.id,
            mind: selections.mind,
            body: selections.body,
            energy: selections.energy,
            mind_state: selections.mind.toLowerCase(),
            body_state: selections.body.toLowerCase(),
            energy_level: selections.energy.toLowerCase(),
            stuck_in_head_index: stuckIndex,
            self_compassion_rating: compassionRating,
            aligned_step_taken: alignedStep
          }
        ]);
      }

      setIsSubmitted(true);
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00538e]" />
      </div>
    );
  }

  if (alreadyCheckedIn) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-[#0AA390]/10 rounded-[2.5rem] flex items-center justify-center border border-[#0AA390]/20 shadow-2xl shadow-[#0AA390]/10">
          <CheckCircle2 className="w-12 h-12 text-[#0AA390]" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
            Already Checked in.
          </h1>
          <p className="text-base text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed font-medium italic">
            You’ve already completed your check-in for today. Great job staying aware!
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="px-12 py-5 bg-[#00538e] text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-xl hover:shadow-2xl shadow-[#00538e]/20 transition-all hover:-translate-y-1"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-[#0AA390]/10 rounded-full flex items-center justify-center animate-bounce border border-[#0AA390]/20">
          <Wind className="w-12 h-12 text-[#0AA390]" />
        </div>
        <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Acknowledge.</h1>
        <p className="text-base text-[var(--text-muted)] font-medium italic">Your check-in is complete. Returning to your 180° path...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-secondary)] pb-20">
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-12">

        <header className="flex items-center">
          <Link href="/dashboard" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </header>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Daily Check-In</h1>
          <p className="text-base text-[var(--text-muted)] font-bold uppercase tracking-widest flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#0AA390]" /> Under 2 minutes to insights
          </p>
        </div>

        <div className="space-y-16">
          {/* Core States */}
          <div className="space-y-12">
            {checkInSteps.map((step) => (
              <div key={step.id} className="space-y-6">
                <div className="flex justify-between items-end border-b border-[var(--border)] pb-2">
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">{step.label}</h3>
                  <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">{step.description}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {step.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(step.id, option)}
                      className={`py-6 rounded-[2rem] font-bold text-[12px] uppercase tracking-[0.2em] border transition-all ${selections[step.id] === option
                        ? "bg-[#0AA390] border-transparent text-white shadow-lg shadow-[#0AA390]/20 scale-[1.02]"
                        : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-dim)] hover:border-[#0AA390]/50 hover:text-[var(--text-primary)]"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Stuck-in-Head Index */}
          <div className="space-y-8 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-[#00538e]" />
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Stuck-in-Head Index</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] font-medium italic">How much energy are you spending in repetitive thought loops? (0-10)</p>

            <div className="space-y-6">
              <input
                type="range"
                min="0"
                max="10"
                value={stuckIndex}
                onChange={(e) => setStuckIndex(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-[#00538e]"
              />
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                <span>Fully Present (0)</span>
                <span className="text-2xl text-[var(--text-primary)]">{stuckIndex}</span>
                <span>Deeply Spiraling (10)</span>
              </div>
            </div>
          </div>

          {/* Self-Compassion */}
          <div className="space-y-8 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-[#993366]" />
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Self-Compassion</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] font-medium italic">Rate your kindness toward yourself in this moment.</p>

            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setCompassionRating(rating)}
                  className={`flex-1 py-4 rounded-2xl border transition-all font-black text-lg ${compassionRating === rating
                    ? "bg-[#993366] text-white border-transparent shadow-lg shadow-[#993366]/20"
                    : "bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-dim)]"
                    }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* Aligned Step */}
          <div className="space-y-8 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-[#F39904]" />
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">One Aligned Step</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] font-medium italic">Did you take at least one step today that aligns with your values?</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAlignedStep(true)}
                className={`py-5 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest border transition-all ${alignedStep === true
                  ? "bg-[#0AA390] text-white border-transparent shadow-lg shadow-[#0AA390]/20"
                  : "bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-dim)]"
                  }`}
              >
                Yes
              </button>
              <button
                onClick={() => setAlignedStep(false)}
                className={`py-5 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest border transition-all ${alignedStep === false
                  ? "bg-stone-500 text-white border-transparent shadow-lg"
                  : "bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-dim)]"
                  }`}
              >
                Not yet
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={handleSubmit}
            disabled={!allSelected}
            className="w-full py-6 bg-[#00538e] text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-xl hover:shadow-2xl shadow-[#00538e]/20 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:shadow-none"
          >
            Complete Check-In
          </button>
          <p className="text-center mt-6 text-[12px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
            Rethink. Rewire. Renew.
          </p>
        </div>
      </div>
    </div>
  );
}

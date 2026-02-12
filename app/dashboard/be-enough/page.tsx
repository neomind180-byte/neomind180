"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Heart, Info, X, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function BeEnoughPage() {
  const [showExplainer, setShowExplainer] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    thought: '',
    emotion: '',
    evidence: ''
  });

  const [neoResponse, setNeoResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Suggested emotions for the "Overthinking Reset" aspect
  const emotionTags = ["Anxious", "Overwhelmed", "Guilty", "Stuck", "Frustrated", "Numb"];

  const handleSubmit = async () => {
    setIsThinking(true);

    // 1. Simulate the AI generation (or call your real API)
    const generatedShift = `I hear that you are feeling ${formData.emotion} because you believe "${formData.thought}". \n\nBut you also noted that the evidence is shaky: "${formData.evidence}". \n\nShift: You are not the chaos of your thoughts. You are the stillness observing them. You are enough, even without fixing this right now.`;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Save to Supabase 'shifts' table
        const { error } = await supabase.from('shifts').insert([
          {
            user_id: user.id,
            thought: formData.thought,
            evidence: formData.evidence,
            emotion: formData.emotion,
            new_perspective: generatedShift
          }
        ]);

        if (error) throw error;
      }

      // 3. Update UI
      setNeoResponse(generatedShift);
      setStep(4);

    } catch (error) {
      console.error("Error saving shift:", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8">

        {/* Header */}
        <header className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#00538e] uppercase tracking-tighter">The be-Enough Shift</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#993366]">Break the Overthinking Loop</p>
          </div>
        </header>

        {/* EXPLAINER SECTION (Dismissible) */}
        {showExplainer && (
          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 relative animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowExplainer(false)}
              className="absolute top-4 right-4 text-blue-300 hover:text-[#00538e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#00538e] rounded-full flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-200">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#00538e] uppercase tracking-wide">How this works</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                  Overthinking happens when we believe a stressful thought without checking if it's true.
                  This tool slows you down. We will <strong>name the loop</strong>, <strong>check the facts</strong>, and <strong>reset your nervous system</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE WORKSPACE */}
        <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-xl overflow-hidden relative">

          {/* Progress Bar */}
          {step < 4 && (
            <div className="w-full h-1 bg-slate-50">
              <div
                className="h-full bg-[#993366] transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          )}

          <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center">

            {/* STEP 1: NAME THE SPIN (Overthinking Reset) */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Step 1 of 3</span>
                <h2 className="text-2xl font-black text-slate-800">What is the "Spin"?</h2>
                <p className="text-slate-500 font-medium">What repetitive thought is causing you stress right now?</p>
                <textarea
                  value={formData.thought}
                  onChange={(e) => setFormData({ ...formData, thought: e.target.value })}
                  placeholder="e.g., I am failing at work because I missed that deadline..."
                  className="w-full p-6 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#993366]/20 text-lg font-medium text-slate-700 placeholder:text-slate-300 resize-none h-32"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.thought.trim()}
                    className="px-8 py-4 bg-[#00538e] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Next: Check Facts
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REALITY CHECK (The "Socratic" part, simplified) */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Step 2 of 3</span>
                <h2 className="text-2xl font-black text-slate-800">Is it 100% true?</h2>
                <p className="text-slate-500 font-medium">Be a detective. What is the actual evidence *against* this thought?</p>
                <textarea
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  placeholder="e.g., I actually finished 3 other projects on time this week..."
                  className="w-full p-6 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#993366]/20 text-lg font-medium text-slate-700 placeholder:text-slate-300 resize-none h-32"
                />
                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Back</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.evidence.trim()}
                    className="px-8 py-4 bg-[#00538e] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Next: The Reset
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: EMOTION & SUBMIT */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Step 3 of 3</span>
                <h2 className="text-2xl font-black text-slate-800">Name the Feeling</h2>
                <p className="text-slate-500 font-medium">Overthinking is often just a feeling trying to be heard. Pick one:</p>

                <div className="flex flex-wrap gap-3">
                  {emotionTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFormData({ ...formData, emotion: tag })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all ${formData.emotion === tag
                          ? 'border-[#993366] bg-[#993366] text-white'
                          : 'border-slate-100 text-slate-400 hover:border-[#993366]/30'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-8">
                  <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.emotion || isThinking}
                    className="px-10 py-4 bg-[#993366] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-xl hover:shadow-[#993366]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                    {isThinking ? "Shifting..." : "Create Shift"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: THE RESULT (Neo's Shift) */}
            {step === 4 && neoResponse && (
              <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
                <div className="w-20 h-20 bg-[#993366]/10 rounded-full flex items-center justify-center mx-auto text-[#993366]">
                  <Heart className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#993366] uppercase tracking-tighter mb-6">Shift Complete</h2>
                  <div className="bg-slate-50 p-8 rounded-[2rem] text-left border border-slate-100">
                    <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {neoResponse}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setStep(1);
                      setFormData({ thought: '', emotion: '', evidence: '' });
                      setNeoResponse(null);
                    }}
                    className="px-8 py-3 rounded-xl border-2 border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:border-slate-300 hover:text-slate-600 transition-all"
                  >
                    New Reflection
                  </button>
                  <Link href="/dashboard" className="px-8 py-3 rounded-xl bg-[#00538e] text-white font-bold uppercase text-[10px] tracking-widest hover:shadow-lg transition-all">
                    Return Home
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
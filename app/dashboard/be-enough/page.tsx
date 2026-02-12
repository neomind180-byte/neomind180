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
    <div className="min-h-screen bg-[#1a1f2e] font-sans text-[#cbd5e1] pb-20">
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8">

        {/* Header */}
        <header className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[#232938] rounded-full transition-colors text-[#94a3b8] hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">The be-Enough Shift</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#993366]">Break the Overthinking Loop</p>
          </div>
        </header>

        {/* EXPLAINER SECTION (Dismissible) */}
        {showExplainer && (
          <div className="bg-[#00538e]/10 p-6 rounded-[2rem] border border-[#00538e]/20 relative animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowExplainer(false)}
              className="absolute top-4 right-4 text-[#00538e]/40 hover:text-[#00538e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#00538e] rounded-full flex items-center justify-center shrink-0 text-white shadow-lg shadow-[#00538e]/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#00538e] uppercase tracking-wide">How this works</h3>
                <p className="text-sm text-[#cbd5e1] leading-relaxed max-w-lg">
                  Overthinking happens when we believe a stressful thought without checking if it's true.
                  This tool slows you down. We will <strong>name the loop</strong>, <strong>check the facts</strong>, and <strong>reset your nervous system</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE WORKSPACE */}
        <div className="bg-[#232938] rounded-[3rem] border border-[#2d3548] shadow-2xl shadow-black/20 overflow-hidden relative">

          {/* Progress Bar */}
          {step < 4 && (
            <div className="w-full h-1 bg-[#1a1f2e]">
              <div
                className="h-full bg-[#993366] transition-all duration-500 shadow-[0_0_10px_#993366]"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          )}

          <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center">

            {/* STEP 1: NAME THE SPIN (Overthinking Reset) */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#475569]">Step 1 of 3</span>
                <h2 className="text-2xl font-black text-white">What is the "Spin"?</h2>
                <p className="text-[#94a3b8] font-medium">What repetitive thought is causing you stress right now?</p>
                <textarea
                  value={formData.thought}
                  onChange={(e) => setFormData({ ...formData, thought: e.target.value })}
                  placeholder="e.g., I am failing at work because I missed that deadline..."
                  className="w-full p-6 bg-[#1a1f2e] rounded-2xl outline-none border border-[#2d3548] focus:border-[#993366] text-lg font-medium text-white placeholder:text-[#2d3548] resize-none h-32"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.thought.trim()}
                    className="px-8 py-4 bg-[#00538e] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:shadow-xl shadow-[#00538e]/20 transition-all disabled:opacity-50"
                  >
                    Next: Check Facts
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REALITY CHECK (The "Socratic" part, simplified) */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#475569]">Step 2 of 3</span>
                <h2 className="text-2xl font-black text-white">Is it 100% true?</h2>
                <p className="text-[#94a3b8] font-medium">Be a detective. What is the actual evidence *against* this thought?</p>
                <textarea
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  placeholder="e.g., I actually finished 3 other projects on time this week..."
                  className="w-full p-6 bg-[#1a1f2e] rounded-2xl outline-none border border-[#2d3548] focus:border-[#993366] text-lg font-medium text-white placeholder:text-[#2d3548] resize-none h-32"
                />
                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-[#475569] hover:text-[#94a3b8]">Back</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.evidence.trim()}
                    className="px-8 py-4 bg-[#00538e] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:shadow-xl shadow-[#00538e]/20 transition-all disabled:opacity-50"
                  >
                    Next: The Reset
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: EMOTION & SUBMIT */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#475569]">Step 3 of 3</span>
                <h2 className="text-2xl font-black text-white">Name the Feeling</h2>
                <p className="text-[#94a3b8] font-medium">Overthinking is often just a feeling trying to be heard. Pick one:</p>

                <div className="flex flex-wrap gap-3">
                  {emotionTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFormData({ ...formData, emotion: tag })}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.emotion === tag
                        ? 'border-[#993366] bg-[#993366] text-white shadow-lg shadow-[#993366]/20'
                        : 'border-[#2d3548] text-[#94a3b8] hover:border-[#993366]'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-8">
                  <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-widest text-[#475569] hover:text-[#94a3b8]">Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.emotion || isThinking}
                    className="px-10 py-5 bg-[#993366] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:shadow-2xl hover:shadow-[#993366]/20 transition-all disabled:opacity-50 flex items-center gap-2"
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
                <div className="w-20 h-20 bg-[#993366]/10 rounded-full flex items-center justify-center mx-auto text-[#993366] border border-[#993366]/20">
                  <Heart className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">Shift Complete</h2>
                  <div className="bg-[#1a1f2e] p-8 rounded-[2rem] text-left border border-[#2d3548]">
                    <p className="text-lg text-[#e2e8f0] leading-relaxed font-medium whitespace-pre-wrap">
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
                    className="px-8 py-4 rounded-2xl border border-[#2d3548] text-[#475569] font-black uppercase text-[10px] tracking-widest hover:border-[#94a3b8] hover:text-[#94a3b8] transition-all"
                  >
                    New Reflection
                  </button>
                  <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-[#00538e] text-white font-black uppercase text-[10px] tracking-widest hover:shadow-2xl shadow-[#00538e]/20 transition-all">
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
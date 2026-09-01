"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const FAQ_ITEMS = [
  {
    q: "What is NeoMind180?",
    a: "NeoMind180 is an AI-powered Mindful Neuro-Coaching app designed for women who tend to overthink. It combines guided AI reflection, practical Micro Resets, self-reflection tools and access to human coaching support to help you understand your thinking patterns, gain clarity and make more intentional decisions."
  },
  {
    q: "How does the AI Coach work?",
    a: "Powered by advanced AI, the AI Coach guides you through structured conversations designed to help you reflect on what is happening in your thoughts, emotions and decisions. It asks questions, helps you explore different perspectives and offers practical prompts based on what you share.\n\nThe AI is designed to support reflection and personal development. It does not replace human coaching, therapy or professional healthcare."
  },
  {
    q: "Does the AI remember what I tell it?",
    a: "NeoMind180 may use information from your previous sessions to provide continuity and more personalised guidance, depending on the features and settings available in your account.\n\nThis may include information such as previous reflections, goals, recurring themes or other context you have chosen to share."
  },
  {
    q: "What information is stored?",
    a: "NeoMind180 may store information needed to provide the app's features, such as your account details, reflections, coaching conversations, goals and progress information.\n\nWe store your data in an encrypted database (Supabase). AI prompts are processed securely via APIs where your content is never used to train public foundation models. We aim to collect and use only the information needed to provide and improve the service. Please see our Privacy Policy for details about what is stored, why it is stored, how it is protected and how you can manage your data."
  },
  {
    q: "Can I delete my reflections or personal information?",
    a: "You remain in control of your personal information. Depending on the feature, you may be able to delete individual reflections or other stored information from within the app, or permanently purge your history and delete your account from your settings.\n\nFor full details about deletion and your data rights, please see our Privacy Policy or contact us."
  },
  {
    q: "Is my information private?",
    a: "Your reflections and coaching conversations are personal information and are handled according to our Privacy Policy.\n\nNeoMind180 does not present your personal reflections publicly. We use your information to provide the features you use and to support your experience with the app."
  },
  {
    q: "Is NeoMind180 a therapist or mental-health treatment?",
    a: "No. NeoMind180 is a coaching and personal-development tool. It is designed to support self-awareness, healthier thinking patterns, clarity and intentional action.\n\nIt is not a substitute for therapy, diagnosis, medical advice or other professional healthcare."
  },
  {
    q: "What are Micro Resets?",
    a: "Micro Resets are short, guided practices designed to help you pause when you notice overthinking, emotional overwhelm or another unhelpful mental pattern.\n\nThey are intended to create a moment of awareness, help you shift your response and make space for your next intentional step."
  },
  {
    q: "When should I use a Micro Reset?",
    a: "You can use a Micro Reset whenever you notice that your thoughts or emotions are starting to pull you into a pattern you would like to interrupt.\n\nFor example, you might use one when you are:\n\n• stuck in overthinking\n• second-guessing a decision\n• feeling mentally overwhelmed\n• caught in self-doubt\n• struggling to move from thinking into action"
  },
  {
    q: "How is NeoMind180 different from a generic AI chatbot?",
    a: "NeoMind180 is designed specifically around the NeoMind180 Mindful Neuro-Coaching approach.\n\nRather than simply generating answers, the app guides you through reflection, awareness and practical action. It combines AI support with structured tools such as Micro Resets, reflections and a self-help library, with access to human coaching support from Emmeline when deeper guidance is appropriate."
  },
  {
    q: "Is there a real person behind NeoMind180?",
    a: "Yes. NeoMind180 was created by Emmeline van Zyl, a Mindful Neuro-Coach and the founder of NeoMind180.\n\nThe app is designed to extend her coaching approach into an accessible digital experience, while keeping the human connection available when needed."
  },
  {
    q: "How does the 7-day free trial work?",
    a: "Your 7-day free trial gives you the opportunity to explore the NeoMind180 app and experience its core features before deciding whether to continue with a paid subscription.\n\nYour subscription and billing terms are shown during sign-up."
  }
];

export default function FAQPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[#00538e] transition-colors font-black uppercase text-[12px] tracking-[0.2em] mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
            Frequently Asked <br />
            <span className="bg-gradient-to-r from-[#7c4dff] via-[#00d4ff] to-[#ff4fd8] bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-[var(--text-secondary)] font-medium max-w-xl mx-auto text-lg italic">
            Everything you need to know about your transformation journey with NeoMind180.
          </p>
        </div>

        {/* Privacy Highlight Banner */}
        <div className="mb-10 p-6 rounded-[2rem] border border-[#0AA390]/30 bg-[#0AA390]/10 flex items-start gap-4 shadow-lg">
          <ShieldCheck className="w-6 h-6 text-[#0AA390] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-black uppercase tracking-widest text-[#0AA390]">Privacy Notice</div>
            <p className="text-base font-bold text-[var(--text-primary)] leading-relaxed">
              Your reflections are private. Here's what we store, why we store it, and how you remain in control.
            </p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          {FAQ_ITEMS.map((item, idx) => (
            <div 
              key={idx} 
              className="group bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] hover:border-[var(--text-dim)] transition-all shadow-xl shadow-[var(--shadow-color)]"
            >
              <div className="flex gap-4 items-start">
                <HelpCircle className="w-6 h-6 text-[#00538e] shrink-0 mt-1" />
                <div className="space-y-4 w-full">
                  <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight">
                    {item.q}
                  </h3>
                  <div className="text-[var(--text-secondary)] font-medium leading-relaxed text-[15px] whitespace-pre-line">
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-20 text-center p-12 bg-gradient-to-br from-[#00538e]/5 to-transparent border border-[var(--border)] rounded-[3rem]">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4">Still have questions?</h2>
          <p className="text-[var(--text-secondary)] font-medium mb-8">
            We're here to help you find the clarity you deserve.
          </p>
          <a 
            href="mailto:coach@neomind180.com" 
            className="ctaBtn inline-flex items-center gap-3 px-10"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

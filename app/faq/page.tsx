"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const FAQ_ITEMS = [
  {
    q: "What's the difference between AI reflections in each tier?",
    a: "All tiers include AI-powered coaching reflections that remember your journey. Free users get 10 sessions/day to experience the value, Clarity Starter gets 30/day for consistent growth, and Confidence Builder+ get intensive Deep Journey AI Sessions. The AI learns from your conversations and provides increasingly personalized guidance."
  },
  {
    q: "Does the AI remember my previous conversations?",
    a: "Yes! Your AI coach maintains context from all your previous reflections, tracking your growth patterns, recurring themes, and transformation milestones. This creates a truly personalized coaching experience that deepens over time."
  },
  {
    q: "Why is Clarity Starter annual-only?",
    a: "Annual commitment helps you stay accountable to your transformation journey while giving you the best value - just $1.58/month. Plus, you can cancel anytime with our 30-day guarantee."
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Absolutely! You can upgrade immediately to access more features. Downgrades take effect at your next billing cycle, and we'll prorate any differences."
  },
  {
    q: "What makes NeoMind180 different from ChatGPT or other AI tools?",
    a: "While general AI tools are powerful, NeoMind180 provides structured coaching frameworks, personalized progress tracking with memory of your entire journey, community support, and integration with mindfulness tools - all designed specifically for mindset transformation. It's the difference between a blank notebook and a guided journal with a coach who knows your story."
  },
  {
    q: "What payment methods do you accept?",
    a: "We use PayFast, South Africa's leading payment gateway. You can pay with credit cards, debit cards, instant EFT, or other local payment methods. All transactions are secure and encrypted."
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

        {/* FAQ List */}
        <div className="space-y-6">
          {FAQ_ITEMS.map((item, idx) => (
            <div 
              key={idx} 
              className="group bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] hover:border-[var(--text-dim)] transition-all shadow-xl shadow-[var(--shadow-color)]"
            >
              <div className="flex gap-4 items-start">
                <HelpCircle className="w-6 h-6 text-[#00538e] shrink-0 mt-1" />
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight">
                    {item.q}
                  </h3>
                  <p className="text-[var(--text-secondary)] font-medium leading-relaxed text-[15px]">
                    {item.a}
                  </p>
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
            href="mailto:support@neomind180.com" 
            className="ctaBtn inline-flex items-center gap-3 px-10"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

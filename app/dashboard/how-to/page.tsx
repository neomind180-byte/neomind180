import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, MessageCircle, Users } from 'lucide-react';

export default function HowToPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)]">
          Getting Started with NeoMind180
        </h1>
        <p className="mt-3 text-[14px] text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
          Welcome to your sanctuary for clarity. This guide explains how to use the core features of your dashboard to start transforming your mindset today.
        </p>
      </header>

      <div className="grid gap-6">

        {/* Feature 1 */}
        <section className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 md:p-10 border border-[var(--border)] shadow-xl relative overflow-hidden group hover:border-[#00538e] transition-all">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#00538e]/10 flex items-center justify-center flex-shrink-0 text-[#00538e]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-2">1. The Be-Enough Shift (Daily Check-in)</h2>
              <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] font-medium mb-4">
                This is your daily grounding practice. When you log in, start here. Answer the simple prompt honestly. It tracks your Emotional Baseline over time.
              </p>
              <div className="bg-[var(--bg-input)] rounded-xl p-4 border border-[var(--border)]">
                <strong className="text-[12px] uppercase tracking-widest text-[var(--text-primary)] block mb-1">How to use it:</strong>
                <span className="text-[13px] text-[var(--text-muted)]">Type 1-2 sentences about your current mental state. Press "Save". Review your history below the input box to see your patterns.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2 */}
        <section className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 md:p-10 border border-[var(--border)] shadow-xl relative overflow-hidden transition-all hover:border-[#0AA390]">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#0AA390]/10 flex items-center justify-center flex-shrink-0 text-[#0AA390]">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-2">2. Reflections with Neo</h2>
              <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] font-medium mb-4">
                Neo is your secure, private AI reflection guide. Neo does not give advice; instead, it asks the exact right questions to help you uncover your own blind spots.
              </p>
              <div className="bg-[var(--bg-input)] rounded-xl p-4 border border-[var(--border)]">
                <strong className="text-[12px] uppercase tracking-widest text-[var(--text-primary)] block mb-1">How to use it:</strong>
                <span className="text-[13px] text-[var(--text-muted)]">Navigate to "Neo Chat" (the message icon in the sidebar). Simply start typing whatever is on your mind—Neo will guide you through powerful reflective questioning to help you find clarity.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3 */}
        <section className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 md:p-10 border border-[var(--border)] shadow-xl relative overflow-hidden transition-all hover:border-purple-500">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-500">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-2">3. The Self-Help Library</h2>
              <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] font-medium mb-4">
                A curated vault of resources ranging from deep-focus audio tracks to articles and video masterclasses by Coach Emmeline.
              </p>
              <div className="bg-[var(--bg-input)] rounded-xl p-4 border border-[var(--border)]">
                <strong className="text-[12px] uppercase tracking-widest text-[var(--text-primary)] block mb-1">How to use it:</strong>
                <span className="text-[13px] text-[var(--text-muted)]">Open the "Library" from the sidebar. You can bookmark specific items to your "Watchlist" for easy access later.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 4 */}
        <section className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 md:p-10 border border-[var(--border)] shadow-xl relative overflow-hidden transition-all hover:border-amber-500">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-2">4. Ask the Coach</h2>
              <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] font-medium mb-4">
                Directly message Coach Emmeline for personalized, human guidance to support your transformation.
              </p>
              <div className="bg-[var(--bg-input)] rounded-xl p-4 border border-[var(--border)] text-[13px] text-[var(--text-muted)]">
                <strong className="text-[12px] uppercase tracking-widest text-[var(--text-primary)] block mb-1">How to use it:</strong>
                Use the <strong>Ask Coach</strong> tab in the sidebar to send structured messages and receive custom perspectives directly from Coach Emmeline. Note: Available on the Full Plan.
              </div>
            </div>
          </div>
        </section>

      </div>

      <div className="pt-8 text-center">
        <Link href="/dashboard" className="px-8 py-4 bg-[#00538e] text-white rounded-full font-bold uppercase tracking-widest text-[12px] hover:shadow-[0_10px_30px_rgba(0,83,142,0.3)] transition-all">
          Go To My Dashboard
        </Link>
      </div>

    </div>
  );
}

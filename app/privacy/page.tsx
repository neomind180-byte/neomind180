import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans py-20 px-5">
      <div className="max-w-[800px] mx-auto bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border)] p-10 md:p-14 shadow-2xl">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#00538e] mb-2">
          Privacy Policy
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-10">
          Last Updated: April 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed text-[var(--text-secondary)]">

          <section>
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
              1. Introduction & POPIA Compliance
            </h2>
            <p>
              NeoMind180 ("we," "our," "us") profoundly respects your privacy. We comply with the Protection of Personal Information Act (POPIA) of South Africa. This document outlines how we process your personal data, why we need it, and your rights regarding the right to be forgotten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
              2. Data We Collect
            </h2>
            <p className="mb-2">We collect the following minimal data to provide our coaching services:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Profile Information:</strong> Name, Email Address, and Phone Number.</li>
              <li><strong>Usage Data:</strong> Daily check-ins, reflection chat history, session records, and basic analytics.</li>
              <li><strong>System Data:</strong> Essential cookies strictly used for secure authentication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
              3. Privacy of "Neo" Chat Conversations
            </h2>
            <div className="bg-[#0AA390]/10 border border-[#0AA390]/30 rounded-2xl p-6">
              <p className="font-bold text-[#0AA390] mb-2 uppercase tracking-widest text-[12px]">Strictly Confidential AI Interaction</p>
              <p>
                We understand that your interactions with <strong>Neo</strong> involve deeply personal reflections. 
                <br /><br />
                <strong>Data Sharing:</strong> The contents of your chats are processed securely via our AI provider (Google Gemini API). 
                We employ specific API tier settings to ensure that <strong>your conversations are NEVER used by Google to train their public foundation models</strong>. 
                Your chat content is never publicly leaked and is stored securely in our encrypted database exclusively for your historical continuity.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
              4. Third-Party Service Providers
            </h2>
            <p>We use specific third-party services to deliver functionality. Data is only shared securely to perform specific tasks:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Supabase:</strong> Our highly secure, encrypted database and authentication provider.</li>
              <li><strong>PayFast:</strong> To process subscription payments. Your payment details are strictly handled by PayFast—we do not touch or store credit card information.</li>
              <li><strong>Systeme.io (Onboarding Emails):</strong> If you opt-in during registration, your name and email are sent to Systeme.io so we can deliver your "Getting Started" introductory email sequence. <strong>Your contact details are stored securely within our private account at Systeme.io and won't be shared publicly or otherwise.</strong> If you opt-out, your email stays strictly within our app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
              5. The Right to Be Forgotten
            </h2>
            <p>
              You maintain total control over your data. You may delete your account entirely at any time from your dashboard settings. Clicking "Delete Account" triggers a cascading wipe of all your profile information, chats, check-ins, and authentication records instantly and permanently. 
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">
              6. Cookies
            </h2>
            <p>
              We use strictly necessary cookies to keep you logged in safely. You consent to these essential cookies by using our platform.
            </p>
          </section>

        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block py-4 px-10 bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[#00538e] hover:text-white rounded-full font-bold uppercase tracking-widest text-[12px] transition-all border border-[var(--border)]">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

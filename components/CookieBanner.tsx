"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('neomind_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('neomind_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4">
      <div className="max-w-[1120px] mx-auto bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
        
        <div className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed max-w-3xl">
          <strong className="text-[var(--text-primary)]">We value your privacy.</strong> We strictly use essential cookies to maintain your signed-in session securely. Our analytics and third-party integrations (like payment processing) are outlined in our 
          <Link href="/privacy" className="mx-1 text-[#0AA390] font-bold hover:underline">
            Privacy Policy
          </Link>. 
          By using our site, you consent to these essential cookies.
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <button 
            onClick={handleDismiss}
            className="w-full md:w-auto px-6 py-2.5 bg-[#0AA390] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:shadow-[0_4px_15px_rgba(10,163,144,0.3)] transition-all"
          >
            I Understand
          </button>
          <button 
            onClick={handleDismiss}
            className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] rounded-xl transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

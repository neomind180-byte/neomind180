'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type Plan = 'monthly' | 'yearly';
type Currency = 'USD' | 'ZAR';

const PRICING = {
  USD: {
    monthly: {
      basic: { name: 'Basic Self-Help', price: 0, blurb: 'Start free. Upgrade when you’re ready.' },
      plus: { name: 'Plus', price: 19, blurb: 'More sessions, more support, more momentum.' },
      premium: { name: 'Premium', price: 79, blurb: 'Maximum depth with the full toolkit.' },
    },
    yearly: {
      basic: { name: 'Basic Self-Help', price: 0, blurb: 'Still free. Still useful.' },
      plus: { name: 'Plus', price: 19 * 10, blurb: '2 months free (paid yearly).' },
      premium: { name: 'Premium', price: 79 * 10, blurb: '2 months free (paid yearly).' },
    },
  },
  ZAR: {
    monthly: {
      basic: { name: 'Basic Self-Help', price: 0, blurb: 'Start free. Upgrade when you’re ready.' },
      plus: { name: 'Plus', price: 299, blurb: 'More sessions, more support, more momentum.' },
      premium: { name: 'Premium', price: 499, blurb: 'Maximum depth with the full toolkit.' },
    },
    yearly: {
      basic: { name: 'Basic Self-Help', price: 0, blurb: 'Still free. Still useful.' },
      plus: { name: 'Plus', price: 299 * 10, blurb: '2 months free (paid yearly).' },
      premium: { name: 'Premium', price: 499 * 10, blurb: '2 months free (paid yearly).' },
    },
  },
} as const;

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

function formatPrice(n: number, currency: Currency) {
  if (n === 0) return 'Free';
  const symbol = currency === 'USD' ? '$' : 'R';
  return `${symbol}${n.toLocaleString('en-ZA')}`;
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>('monthly');
  const [currency, setCurrency] = useState<Currency>('ZAR');
  const [selectedTier, setSelectedTier] = useState<'basic' | 'plus' | 'premium'>('plus');
  const [toast, setToast] = useState<string | null>(null);

  const pricingRef = useRef<HTMLDivElement | null>(null);
  const heroImageRef = useRef<HTMLDivElement | null>(null);

  const tiers = useMemo(() => PRICING[currency][plan], [currency, plan]);

  useEffect(() => {
    const p = (localStorage.getItem('neomind_plan') as Plan | null) ?? 'monthly';
    const c = (localStorage.getItem('neomind_currency') as Currency | null) ?? 'ZAR';
    const t = (localStorage.getItem('neomind_tier') as 'basic' | 'plus' | 'premium' | null) ?? 'plus';
    if (p === 'monthly' || p === 'yearly') setPlan(p);
    if (c === 'USD' || c === 'ZAR') setCurrency(c);
    if (t === 'basic' || t === 'plus' || t === 'premium') setSelectedTier(t);
  }, []);

  useEffect(() => {
    localStorage.setItem('neomind_plan', plan);
    localStorage.setItem('neomind_currency', currency);
    localStorage.setItem('neomind_tier', selectedTier);
  }, [plan, currency, selectedTier]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPricingOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const startFree = () => {
    localStorage.setItem('neomind_onboarding', 'started');
    showToast('Free plan activated (demo).');
  };

  const openPricing = () => {
    setPricingOpen(true);
    setTimeout(() => pricingRef.current?.focus(), 50);
  };

  const beginJourney = () => {
    localStorage.setItem('neomind_checkout', JSON.stringify({ plan, currency, tier: selectedTier, ts: Date.now() }));
    showToast(`Selected ${tiers[selectedTier].name} (${plan}).`);
    setPricingOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-white/20 font-sans transition-colors duration-300">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-[10%] h-[520px] w-[520px] rounded-full bg-[#7c4dff]/10 blur-[100px] opacity-50 dark:opacity-100" />
        <div className="absolute top-10 right-[10%] h-[520px] w-[520px] rounded-full bg-[#00d4ff]/10 blur-[110px] opacity-50 dark:opacity-100" />
        <div className="absolute bottom-[-180px] left-[45%] h-[520px] w-[520px] rounded-full bg-[#ff4fd8]/8 blur-[110px] opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)] opacity-40" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/40 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-5 py-4">
          <div className="group flex items-center gap-3">
            <div className="h-[60px] w-[60px] relative bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
              <Image
                src="/business-logo.png"
                alt="NeoMind180 Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold tracking-tight text-[var(--text-primary)]">
              NeoMind180
              <span className="ml-2 rounded-full border border-[var(--border)] bg-[var(--bg-input)] px-2 py-0.5 text-[12px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                Mindset Coaching
              </span>
            </span>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <button onClick={() => heroImageRef.current?.scrollIntoView({ behavior: 'smooth' })} className="navLink text-[var(--text-secondary)]">
              The Journey
            </button>
            <button onClick={openPricing} className="navLink text-[var(--text-secondary)]">
              Pricing
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden rounded-full border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] md:inline-flex transition-all"
            >
              Log In
            </a>
            <a href="/register" className="ctaBtn">
              Start Free
            </a>

            <button
              className="md:hidden rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mx-auto w-full max-w-[1120px] px-5 pb-4 md:hidden">
            <div className="grid gap-2 rounded-2xl border border-white/12 bg-white/5 p-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  heroImageRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="drawerLink"
              >
                The Journey
              </button>
              <button onClick={() => { setMobileOpen(false); openPricing(); }} className="drawerLink">Pricing</button>
              <a href="/login" className="drawerLink">Log In</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <main className="mx-auto w-full max-w-[1120px] px-5">
        <section className="grid items-start gap-8 pb-10 pt-14 md:grid-cols-[1.15fr_.85fr] md:pt-16">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2 text-sm text-[var(--text-secondary)]">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(77,255,181,.10)]" />
              AI-powered clarity sessions
            </div>

            <h1 className="mt-4 text-balance text-[50px] font-black leading-[1.03] tracking-tighter text-[var(--text-primary)] md:text-[70px] uppercase">
              Rethink. Rewire.
              <span className="block bg-gradient-to-r from-[#7c4dff] via-[#00d4ff] to-[#ff4fd8] bg-clip-text text-transparent">
                Renew.
              </span>
            </h1>

            <p className="mt-4 max-w-[60ch] text-[19px] leading-relaxed text-[var(--text-secondary)] font-medium">
              Move from overthinking to clarity. AI-powered coaching that helps you become a calm, confident observer of your thoughts.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="/register" className="ctaBtn">
                Start Free
              </a>
              <button onClick={openPricing} className="secondaryBtn">
                View Pricing
              </button>
            </div>

            <p className="mt-4 text-xs text-white/55">
              Mindset coaching for clarity, not therapy. Seek professional help for mental health concerns.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { k: 'Daily', v: 'check-ins' },
                { k: 'AI powered', v: 'coaching sessions' },
                { k: '3', v: 'coaching styles' },
              ].map((x) => (
                <div key={x.k} className="statCard">
                  <div className="text-sm text-white/65">{x.k}</div>
                  <div className="mt-1 text-lg font-semibold">{x.v}</div>
                </div>
              ))}
            </div>

            {/* Journey Section */}
            <div className="mt-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-primary)]">The Journey</h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                <span className="text-[var(--text-primary)]">Be-Enough Shift</span>
                <span className="text-[var(--text-dim)]">→</span>
                <span className="text-[var(--text-primary)]">Reflections with Neo</span>
                <span className="text-[var(--text-dim)]">→</span>
                <span className="text-[var(--text-primary)]">Ask the Coach</span>
                <span className="text-[var(--text-dim)]">→</span>
                <span className="text-[var(--text-primary)]">Deep Dive Circles</span>
              </div>
            </div>

            {/* Journey Section Image */}
            <div ref={heroImageRef} className="mt-10 overflow-hidden rounded-[3rem] border border-[var(--border)] shadow-2xl relative aspect-[4/3] w-full group">
              <Image
                src="/hero-woman.jpg"
                alt="Serene woman reflecting"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Ready to transform?</h2>
                <p className="mt-1 text-xs text-white/70 font-medium">Start free on the Basic plan today.</p>
                <div className="mt-6 flex gap-3">
                  <a href="/register" className="ctaBtn !py-3 !px-8">Begin</a>
                  <button onClick={openPricing} className="secondaryBtn !bg-white/10 !backdrop-blur-md !border-white/20 !text-white !py-3 !px-8">Pricing</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right hero card - Demo */}
          <div className="rounded-[3rem] border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-2xl shadow-[var(--shadow-color)]">
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-input)] p-6">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">Daily Check-in</div>
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Live Demo
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-[var(--text-secondary)] italic">
                &quot;How are you feeling at this moment?&quot;
              </p>

              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const msg = String(fd.get('msg') ?? '').trim();
                  if (msg.length < 6) return showToast('Write a bit more than that.');
                  localStorage.setItem('neomind_checkin', JSON.stringify({ msg, ts: Date.now() }));
                  (form as HTMLFormElement).reset();
                  showToast('Check-in saved (demo account).');
                }}
              >
                <textarea
                  name="msg"
                  rows={4}
                  placeholder="Type 1–2 honest sentences..."
                  className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none focus:border-[#00538e] transition-all"
                />
                <button className="ctaBtn w-full py-4" type="submit">
                  Save Check-in
                </button>
                <div className="text-[12px] text-center font-bold uppercase tracking-widest text-[var(--text-dim)]">
                  Stored locally for testing.
                </div>
              </form>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-input)] p-6">
                <div className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-2">Mental Clarity</div>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  Designed for professional women who want to break free from overthinking and lead with confidence.
                </p>
              </div>

              <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-input)] p-6">
                <div className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-3">What you get</div>
                <ul className="grid gap-3">
                  {[
                    'Deep-dive AI sessions',
                    'Daily mindset check-ins',
                    'Guided micro-resets',
                    'In-app Chat with Coach',
                    'Group coaching circles',
                  ].map((t) => (
                    <li key={t} className="flex gap-3 text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#0AA390]" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={openPricing} className="secondaryBtn w-full py-4 uppercase tracking-[0.2em] text-[12px]">
                Compare all plans
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] py-16 text-sm text-[var(--text-muted)]">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-[60px] w-[60px] relative bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
                <Image
                  src="/business-logo.png"
                  alt="NeoMind180 Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div className="space-y-1">
                <div className="font-black uppercase tracking-tighter text-[var(--text-primary)]">NeoMind180 Mindset Coaching</div>
                <div className="text-[12px] font-bold uppercase tracking-widest leading-normal max-w-sm">
                  Clarity, not therapy. Seek professional help for clinical mental health concerns.
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:text-right font-bold uppercase tracking-widest text-[11px]">
              <div className="text-[var(--text-dim)]">Payment Security</div>
              <div className="text-[var(--text-primary)] font-black text-xs">PayFast Secure</div>
              <div className="text-[var(--text-dim)]">Cancel anytime • ZAR / USD pricing</div>
              <div className="text-[var(--text-dim)]">© {new Date().getFullYear()} NeoMind180</div>
            </div>
          </div>
        </footer>
      </main>

      {/* Pricing Modal */}
      {pricingOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 px-4 py-8 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPricingOpen(false);
          }}
        >
          <div
            ref={pricingRef as any}
            tabIndex={-1}
            className="w-full max-w-[980px] rounded-[3rem] border border-[var(--border)] bg-[var(--bg-card)] p-10 shadow-3xl outline-none my-auto"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[12px] font-black uppercase tracking-[0.3em] text-[#00538e] mb-2">Investment</div>
                <h3 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                  Choose your transformation pace
                </h3>
                <p className="mt-3 max-w-[70ch] text-sm text-[var(--text-secondary)] font-medium">
                  Select a plan that aligns with your current growth goals.
                </p>
              </div>

              <div className="flex flex-col gap-4 items-end">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-input)] p-1.5 text-[12px] font-black uppercase tracking-widest">
                    {(['ZAR', 'USD'] as const).map((c) => (
                      <button
                        key={c}
                        className={cn('rounded-full px-5 py-2 transition-all', currency === c ? 'bg-[#00538e] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
                        onClick={() => setCurrency(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-input)] p-1.5 text-[12px] font-black uppercase tracking-widest">
                    {(['monthly', 'yearly'] as const).map((p) => (
                      <button
                        key={p}
                        className={cn('rounded-full px-5 py-2 transition-all capitalize', plan === p ? 'bg-[#00538e] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
                        onClick={() => setPlan(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-6 py-2.5 text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                  onClick={() => setPricingOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {(['basic', 'plus', 'premium'] as const).map((tier) => {
                const t = tiers[tier];
                const isPicked = selectedTier === tier;
                const featured = tier === 'plus';
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      'text-left rounded-[2.5rem] border p-8 transition-all flex flex-col',
                      isPicked ? 'border-[#00538e] bg-[#00538e]/5 shadow-xl ring-2 ring-[#00538e]/20' : 'border-[var(--border)] bg-[var(--bg-input)] hover:border-[var(--text-dim)]',
                      featured && 'relative overflow-hidden'
                    )}
                  >
                    <div className="relative flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{t.name}</div>
                        {featured && (
                          <span className="rounded-full bg-[#00538e] px-3 py-1 text-[10px] font-black uppercase text-white tracking-widest">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">
                        {formatPrice(t.price, currency)}
                        {t.price !== 0 && (
                          <span className="ml-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                            /{plan === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 text-xs text-[var(--text-secondary)] font-medium leading-relaxed italic">{t.blurb}</div>

                      <ul className="mt-8 grid gap-4 text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">
                        {(tier === 'basic'
                          ? ['Daily check-ins', 'Micro-resets', 'BE-ENOUGH Shift', 'Mindfulness Audio & Video']
                          : tier === 'plus'
                            ? ['Async Coach Chat', 'Coaching Circles', 'AI Reflection (10/day)', 'Trends & insights']
                            : ['Everything in Plus', 'Coaching Circles', 'AI Reflection (20/day)', '2x 1:1 Sessions/mo']
                        ).map((x) => (
                          <li key={x} className="flex gap-3">
                            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#0AA390]/80" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[var(--border)]">
                      <div className={cn('inline-flex items-center gap-3 text-[12px] font-black uppercase tracking-widest', isPicked ? 'text-[#0AA390]' : 'text-[var(--text-dim)]')}>
                        <span className={cn('h-3 w-3 rounded-full', isPicked ? 'bg-[#0AA390] shadow-glow' : 'bg-[var(--border)]')} />
                        {isPicked ? 'Tier Selected' : 'Select Plan'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                Secure checkout via PayFast. Cancel anytime.
              </div>
              <div className="flex gap-4">
                <button className="secondaryBtn !py-4 !px-10" onClick={() => setPricingOpen(false)}>
                  Keep Browsing
                </button>
                <button className="ctaBtn !py-4 !px-10" onClick={beginJourney}>
                  Begin Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 z-[200] -translate-x-1/2 animate-in slide-in-from-bottom-5">
          <div className="rounded-full border border-[#0AA390]/30 bg-[var(--bg-card)]/90 px-8 py-3 text-[12px] font-black uppercase tracking-widest text-[#0AA390] shadow-2xl backdrop-blur-md">
            {toast}
          </div>
        </div>
      )}

      <style jsx global>{`
        .navLink {
          border: 1px solid transparent;
          background: transparent;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 12px;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .navLink:hover {
          border-color: var(--border);
          background: var(--bg-input);
        }
        .drawerLink {
          display: block;
          width: 100%;
          text-align: left;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: var(--bg-input);
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .drawerLink:hover {
          border-color: var(--text-dim);
          background: var(--bg-card);
          color: var(--text-primary);
        }
        .ctaBtn {
          border: 0;
          cursor: pointer;
          padding: 12px 24px;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #fff;
          background: linear-gradient(135deg, #00538e, #0AA390);
          box-shadow: 0 12px 30px rgba(0, 83, 142, 0.15);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-size: 12px;
        }
        .ctaBtn:hover { 
          transform: translateY(-2px); 
          filter: brightness(1.1);
          box-shadow: 0 15px 35px rgba(0, 83, 142, 0.25);
        }
        .ctaBtn:active { transform: translateY(0) scale(0.98); }
        .secondaryBtn {
          cursor: pointer;
          padding: 12px 24px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-secondary);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          transition: all 0.2s ease;
          font-size: 12px;
        }
        .secondaryBtn:hover { 
          transform: translateY(-1px); 
          border-color: var(--text-dim); 
          background: var(--bg-card); 
          color: var(--text-primary);
        }

        .shadow-glow {
          box-shadow: 0 0 10px rgba(10, 163, 144, 0.5);
        }
        .statCard {
          padding: 24px;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--bg-input);
          transition: all 0.3s ease;
        }
        .statCard:hover {
          border-color: var(--text-dim);
          background: var(--bg-card);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
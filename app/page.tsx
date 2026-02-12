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
    <div className="min-h-screen bg-[#07060a] text-white selection:bg-white/20 font-sans">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-[10%] h-[520px] w-[520px] rounded-full bg-[#7c4dff]/20 blur-[80px]" />
        <div className="absolute top-10 right-[10%] h-[520px] w-[520px] rounded-full bg-[#00d4ff]/16 blur-[90px]" />
        <div className="absolute bottom-[-180px] left-[45%] h-[520px] w-[520px] rounded-full bg-[#ff4fd8]/12 blur-[90px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/35" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-5 py-4">
          <div className="group flex items-center gap-3">
            <div className="h-[60px] w-[60px] relative bg-[#fcfcf6] rounded-xl flex items-center justify-center">
              <Image
                src="/business-logo.png"
                alt="NeoMind180 Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold tracking-tight">
              NeoMind180
              <span className="ml-2 rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-xs text-white/70 group-hover:text-white/85">
                Mindset Coaching
              </span>
            </span>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <button onClick={() => heroImageRef.current?.scrollIntoView({ behavior: 'smooth' })} className="navLink">
              The Journey
            </button>
            <button onClick={openPricing} className="navLink">
              Pricing
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75 hover:border-white/25 hover:text-white md:inline-flex"
            >
              Log In
            </a>
            <a href="/register" className="ctaBtn">
              Start Free
            </a>

            <button
              className="md:hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:border-white/25"
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
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(77,255,181,.10)]" />
              AI-powered clarity sessions
            </div>

            <h1 className="mt-4 text-balance text-[42px] font-semibold leading-[1.03] tracking-tight md:text-[58px]">
              Rethink. Rewire.
              <span className="block bg-gradient-to-r from-[#7c4dff] via-[#00d4ff] to-[#ff4fd8] bg-clip-text text-transparent">
                Renew.
              </span>
            </h1>

            <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-white/70">
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
              <h2 className="text-2xl font-semibold tracking-tight">The Journey</h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span className="text-white/85 font-medium">Be-Enough Shift</span>
                <span className="text-white/40">→</span>
                <span className="text-white/85 font-medium">Reflections with Neo</span>
                <span className="text-white/40">→</span>
                <span className="text-white/85 font-medium">Ask the Coach</span>
                <span className="text-white/40">→</span>
                <span className="text-white/85 font-medium">Deep Dive Circles</span>
              </div>
            </div>

            {/* Hero Image Card - Moved here */}
            <div ref={heroImageRef} className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl relative aspect-[4/3] w-full">
              <Image
                src="/hero-woman.jpg"
                alt="Serene woman reflecting"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-xl font-semibold tracking-tight">Ready to transform?</h2>
                <p className="mt-1 text-xs text-white/70">Start free on the Basic plan.</p>
                <div className="mt-4 flex gap-2">
                  <a href="/register" className="ctaBtn !py-2 !px-4 !text-xs">Begin</a>
                  <button onClick={openPricing} className="secondaryBtn !py-2 !px-4 !text-xs">Pricing</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right hero card - Demo */}
          <div className="rounded-[26px] border border-white/15 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,.45)]">
            <div className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/10 to-white/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Daily Check-in</div>
                <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/65">
                  Demo
                </span>
              </div>

              <p className="mt-3 text-white/75">
                "How are you feeling at this moment?"
              </p>

              <form
                className="mt-4 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const msg = String(fd.get('msg') ?? '').trim();
                  if (msg.length < 6) return showToast('Write a bit more than that.');
                  localStorage.setItem('neomind_checkin', JSON.stringify({ msg, ts: Date.now() }));
                  (form as HTMLFormElement).reset();
                  showToast('Check-in saved (demo).');
                }}
              >
                <textarea
                  name="msg"
                  rows={4}
                  placeholder="Type 1–2 honest sentences..."
                  className="w-full resize-none rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                />
                <button className="ctaBtn w-full" type="submit">
                  Save Check-in
                </button>
                <div className="text-xs text-white/55">
                  Stored locally for testing.
                </div>
              </form>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/12 bg-black/20 p-4">
                <div className="text-sm font-semibold">Your AI companion for mental clarity</div>
                <p className="mt-2 text-sm text-white/70">
                  Designed for busy professional women who want to break free from overthinking and make decisions with confidence and compassion.
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-black/20 p-4">
                <div className="text-sm font-semibold">What you get</div>
                <ul className="mt-2 grid gap-2 text-sm text-white/70">
                  {[
                    'Deep-dive AI sessions',
                    'Daily mindset check-ins',
                    'Guided micro-resets',
                    'In-app Chat with Coach Emmeline',
                    'Access to group coaching circles',
                    'Personal coaching with Coach Emmeline',
                  ].map((t) => (
                    <li key={t} className="flex gap-2 text-xs">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300/90" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={openPricing} className="secondaryBtn w-full">
                Compare plans
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-10 text-sm text-white/65">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-[60px] w-[60px] relative bg-[#fcfcf6] rounded-xl flex items-center justify-center">
                <Image
                  src="/business-logo.png"
                  alt="NeoMind180 Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="font-semibold text-white/85">NeoMind180 Mindset Coaching</div>
                <div className="text-xs text-white/55">
                  Mindset coaching for clarity, not therapy. Seek professional help for mental health concerns.
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:text-right">
              <div className="text-xs text-white/55">Payment Security</div>
              <div className="font-semibold text-white/80">PayFast</div>
              <div className="text-xs text-white/55">Cancel anytime • ZAR / USD pricing</div>
              <div className="text-xs text-white/45">© {new Date().getFullYear()} NeoMind180</div>
            </div>
          </div>
        </footer>
      </main>

      {/* Pricing Modal */}
      {pricingOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/65 px-4 py-8 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPricingOpen(false);
          }}
        >
          <div
            ref={pricingRef as any}
            tabIndex={-1}
            className="w-full max-w-[980px] rounded-[28px] border border-white/15 bg-[#0b0a12] p-5 shadow-[0_18px_70px_rgba(0,0,0,.65)] outline-none my-auto"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm font-semibold text-white/85">Pricing</div>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  Choose the pace that fits your life
                </h3>
                <p className="mt-2 max-w-[70ch] text-sm text-white/70">
                  Select a plan to see how it feels. Your choice is stored locally for this demo.
                </p>
              </div>

              <div className="flex flex-col gap-3 items-end">
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-full border border-white/12 bg-white/5 p-1 text-xs">
                    {(['ZAR', 'USD'] as const).map((c) => (
                      <button
                        key={c}
                        className={cn('rounded-full px-3 py-1', currency === c ? 'bg-white/12 text-white' : 'text-white/60 hover:text-white')}
                        onClick={() => setCurrency(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex rounded-full border border-white/12 bg-white/5 p-1 text-xs">
                    {(['monthly', 'yearly'] as const).map((p) => (
                      <button
                        key={p}
                        className={cn('rounded-full px-3 py-1 capitalize', plan === p ? 'bg-white/12 text-white' : 'text-white/60 hover:text-white')}
                        onClick={() => setPlan(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:border-white/25"
                  onClick={() => setPricingOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(['basic', 'plus', 'premium'] as const).map((tier) => {
                const t = tiers[tier];
                const isPicked = selectedTier === tier;
                const featured = tier === 'plus';
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={cn(
                      'text-left rounded-[22px] border p-5 transition flex flex-col',
                      isPicked ? 'border-white/28 bg-white/8' : 'border-white/12 bg-white/5 hover:border-white/20',
                      featured && 'relative overflow-hidden'
                    )}
                  >
                    {featured && (
                      <div className="absolute -right-24 -top-28 h-56 w-56 rounded-full bg-[#00d4ff]/20 blur-[40px]" />
                    )}
                    <div className="relative flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white/85">{t.name}</div>
                        {featured && (
                          <span className="rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[10px] text-white/70">
                            Most popular
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-3xl font-semibold">
                        {formatPrice(t.price, currency)}
                        {t.price !== 0 && (
                          <span className="ml-2 text-xs font-medium text-white/60">
                            /{plan === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-white/70 leading-relaxed">{t.blurb}</div>

                      <ul className="mt-4 grid gap-2 text-xs text-white/70">
                        {(tier === 'basic'
                          ? ['Daily check-ins', 'Micro-resets', 'Basic insights', 'Mindfulness Audio', 'Basic Journaling']
                          : tier === 'plus'
                            ? ['Async Coach Chat', 'Group Coaching Circles', 'Weekly AI Reflection (8/day)', 'Trends & insights', 'All coaching styles']
                            : ['Advanced features', 'Group Coaching Circles', 'Weekly AI Reflection (16/day)', '2x 1:1 Sessions/mo', 'Priority Support']
                        ).map((x) => (
                          <li key={x} className="flex gap-2">
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300/90" />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-5 relative">
                      <div className={cn('inline-flex items-center gap-2 text-[10px]', isPicked ? 'text-emerald-200' : 'text-white/55')}>
                        <span className={cn('h-2 w-2 rounded-full', isPicked ? 'bg-emerald-300' : 'bg-white/25')} />
                        {isPicked ? 'Selected' : 'Click to select'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-white/55">
                Selections are stored in your browser for this demo.
              </div>
              <div className="flex gap-3">
                <button className="secondaryBtn" onClick={() => setPricingOpen(false)}>
                  Keep browsing
                </button>
                <button className="ctaBtn" onClick={beginJourney}>
                  Continue with selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[200] -translate-x-1/2">
          <div className="rounded-full border border-white/12 bg-black/70 px-4 py-2 text-sm text-white/85 backdrop-blur">
            {toast}
          </div>
        </div>
      )}

      <style jsx global>{`
        .navLink {
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255, 255, 255, 0.70);
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .navLink:hover {
          color: rgba(255, 255, 255, 0.92);
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
        }
        .drawerLink {
          display: block;
          width: 100%;
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.04);
          padding: 12px 16px;
          color: rgba(255, 255, 255, 0.78);
          cursor: pointer;
        }
        .drawerLink:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
        }
        .ctaBtn {
          border: 0;
          cursor: pointer;
          padding: 10px 20px;
          border-radius: 999px;
          font-weight: 700;
          color: #07060a;
          background: linear-gradient(135deg, #7c4dff, #00d4ff);
          box-shadow: 0 12px 30px rgba(0, 212, 255, 0.15), 0 14px 45px rgba(124, 77, 255, 0.18);
          transition: transform 0.18s ease, filter 0.18s ease;
          font-size: 14px;
        }
        .ctaBtn:hover { transform: translateY(-1px); filter: brightness(1.04); }
        .ctaBtn:active { transform: translateY(0) scale(0.99); }

        .secondaryBtn {
          cursor: pointer;
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          font-weight: 600;
          transition: all 0.18s ease;
          font-size: 14px;
        }
        .secondaryBtn:hover { transform: translateY(-1px); border-color: rgba(255, 255, 255, 0.26); background: rgba(255, 255, 255, 0.08); }

        .statCard {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          padding: 14px;
        }
      `}</style>
    </div>
  );
}
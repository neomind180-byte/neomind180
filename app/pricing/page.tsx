"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft, HelpCircle, Info, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { supabase } from '@/lib/supabaseClient';

const FAQ_ITEMS = [
  {
    q: "How does the 7-Day Free Trial work?",
    a: "You get full, unrestricted access to daily check-ins, self-help guides, progress tracking, and 30 minutes of guided AI reflection with Neo every single day. No credit card is required to start."
  },
  {
    q: "What do I get in the Full Plan?",
    a: "The Full Plan unlocks the complete transformation toolkit. This includes 60 minutes of daily Neo AI reflections, direct Ask-the-Coach async messaging with Coach Emmeline, advanced progress insights, and lifetime self-help library updates."
  },
  {
    q: "Does the AI remember my previous conversations?",
    a: "Yes! Neo maintains context from all your previous reflections, recognizing recurring patterns, mindset growth, and life shifts. This ensures a personalized, continuous coaching relation over time."
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. The Full Plan is billed monthly with no lock-ins. You can cancel, upgrade, or downgrade directly from your account settings at any time."
  },
  {
    q: "What payment methods do you accept?",
    a: "We use PayFast, South Africa's most trusted, highly secure payment gateway. We accept all major credit cards, debit cards, instant EFTs, and local banking options."
  }
];

const COMPARISON_FEATURES = [
  { name: "Daily Check-In", tiers: [true, true] },
  { name: "Self-Help Library & Worksheets", tiers: [true, true] },
  { name: "Basic Shift Tracking", tiers: [true, true] },
  { name: "Neo AI Daily Reflection Time", tiers: ["30 mins / day", "60 mins / day"] },
  { name: "Ask-the-Coach Async Messaging", tiers: [false, "Coach Emmeline"] },
  { name: "Advanced Analytics & Insights", tiers: [false, true] },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<'USD' | 'ZAR'>('USD');
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [isVoucherValid, setIsVoucherValid] = useState(false);
  const [voucherTier, setVoucherTier] = useState<string | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const router = useRouter();
 
  async function validateVoucher() {
    if (!voucherCode.trim()) return;
    setValidatingVoucher(true);
    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim() })
      });
      const data = await res.json();
      if (data.valid) {
        setIsVoucherValid(true);
        setVoucherTier(data.tier);
        alert(data.message);
      } else {
        alert(data.error || 'Invalid code');
        setIsVoucherValid(false);
        setVoucherTier(null);
      }
    } catch (err) {
      alert('Error validating voucher');
    } finally {
      setValidatingVoucher(false);
    }
  }

  async function handleAction(plan: any) {
    // Determine active session dynamically to avoid stale state or hydration lag
    const { data: { session: activeSession } } = await supabase.auth.getSession();
    const currentLoggedIn = !!activeSession;

    if (plan.id === 'free') {
      router.push(currentLoggedIn ? "/dashboard" : "/register?tier=free");
      return;
    }

    if (!currentLoggedIn) {
      router.push(`/register?tier=${plan.id}${isVoucherValid && voucherTier === plan.id ? `&voucher=${voucherCode}` : ''}`);
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      const token = activeSession?.access_token;

      if (!token) {
        alert('Your session has expired. Please log in again.');
        router.push('/login');
        return;
      }

      const res = await fetch('/api/payfast/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan.id,
          billingPeriod: plan.price[currency].period,
          currency: currency,
          voucherCode: isVoucherValid && voucherTier === plan.id ? voucherCode : undefined
        })
      });

      const data = await res.json();
      if (data.redirect) {
        router.push(data.redirect);
      } else if (data.pfData && data.url) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;

        Object.entries(data.pfData).forEach(([key, value]) => {
          if (value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setLoadingPlanId(null);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-secondary)] py-12 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <Link 
            href={isLoggedIn ? "/dashboard" : "/"} 
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[#00538e] transition-colors font-black uppercase text-[12px] tracking-[0.2em] mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
            Transform Your Perspective <br />
            <span className="text-[#0AA390]">With Structured AI & Expert Coaching</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg md:text-xl font-medium italic">
            Simple, honest plans tailored to your transformation. Cancel anytime.
          </p>
 
          {/* Currency Toggle & Voucher */}
          <div className="flex flex-col items-center gap-8 pt-8">
            <div className="bg-[var(--bg-card)] p-1.5 rounded-full inline-flex items-center border border-[var(--border)] shadow-xl">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-10 py-3 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${currency === 'USD'
                  ? 'bg-[#00538e] text-white shadow-lg'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                  }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('ZAR')}
                className={`px-10 py-3 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${currency === 'ZAR'
                  ? 'bg-[#00538e] text-white shadow-lg'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                  }`}
              >
                ZAR (R)
              </button>
            </div>

            {/* Voucher Input */}
            <div className="w-full max-w-sm">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="HAVE A PROMO CODE?"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className={`w-full bg-[var(--bg-input)] border ${isVoucherValid ? 'border-[#0AA390]' : 'border-[var(--border)]'} rounded-2xl px-6 py-4 text-xs font-black tracking-widest outline-none focus:border-[#00538e] transition-all`}
                />
                <button 
                  onClick={validateVoucher}
                  disabled={validatingVoucher || !voucherCode}
                  className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest hover:border-[#00538e] hover:text-[#00538e] transition-all disabled:opacity-30"
                >
                  {validatingVoucher ? '...' : 'Apply'}
                </button>
              </div>
              {isVoucherValid && (
                <div className="mt-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-black text-[#0AA390] uppercase tracking-widest animate-pulse drop-shadow-[0_0_10px_rgba(10,163,144,0.3)]">
                    ✨ PROMO APPLIED — R0.00 AT CHECKOUT
                  </p>
                  <p className="text-[10px] font-bold text-[var(--text-primary)] tracking-widest bg-[var(--bg-input)]/50 py-1.5 px-3 rounded-full inline-block border border-[var(--border)]">
                    Please click the corresponding plan button below to proceed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 mb-24">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredTier(plan.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`relative bg-[var(--bg-card)] p-8 rounded-[3.5rem] border transition-all duration-500 flex flex-col ${
                plan.badgeType === 'primary' 
                  ? 'border-[#00538e] shadow-2xl scale-105 z-10' 
                  : 'border-[var(--border)] shadow-lg'
              } ${hoveredTier === plan.id ? '-translate-y-2' : ''}`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 px-6 py-2.5 rounded-bl-3xl rounded-tr-[3.4rem] text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#00538e]">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">{plan.title}</h3>
                <p className="text-[12px] text-[var(--text-muted)] font-medium italic leading-relaxed min-h-[40px]">{plan.tagline}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-[var(--text-primary)]">
                  {currency === 'USD' ? '$' : 'R'}{plan.price[currency].amount}
                </span>
                {plan.price[currency].period && (
                  <span className="text-[var(--text-dim)] font-black uppercase text-[10px] tracking-widest">
                    /{plan.price[currency].period.toLowerCase()}
                  </span>
                )}
              </div>

              {plan.highlight && (
                <div className="mb-8 p-4 bg-[#00538e]/10 rounded-2xl border border-[#00538e]/20">
                  <p className="text-[11px] font-bold text-[#00538e] italic flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> {plan.highlight}
                  </p>
                </div>
              )}

              <ul className="space-y-4 mb-20 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-tight leading-tight">
                    <Check className="w-4 h-4 shrink-0 text-[#0AA390]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="space-y-4">
                <button
                  disabled={loadingPlanId !== null}
                  onClick={() => handleAction(plan)}
                  className={`block w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.id === 'free'
                      ? 'border-2 border-[var(--border)] text-[var(--text-muted)] hover:border-[#00538e] hover:text-[#00538e]'
                      : 'bg-[#00538e] text-white shadow-xl shadow-[#00538e]/20'
                  }`}
                >
                  {loadingPlanId === plan.id ? 'Processing...' : plan.cta}
                </button>
                {plan.note && (
                  <p className="text-[10px] text-[var(--text-muted)] text-center italic font-medium">{plan.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-24 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter text-center mb-12">Compare Plans</h2>
          <div className="overflow-x-auto rounded-[3rem] border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg-input)]/50">
                  <th className="p-8 text-left text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] border-b border-[var(--border)]">Feature</th>
                  {PRICING_PLANS.map(plan => (
                    <th key={plan.id} className="p-8 text-center text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)] border-b border-[var(--border)]">
                      {plan.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-input)]/30 transition-colors">
                    <td className="p-8 text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-tight border-b border-[var(--border)]">{feature.name}</td>
                    {feature.tiers.map((status, i) => (
                      <td key={i} className="p-8 text-center border-b border-[var(--border)]">
                        {typeof status === 'string' ? (
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#00538e]">{status}</span>
                        ) : status ? (
                          <Check className="w-5 h-5 text-[#0AA390] mx-auto" />
                        ) : (
                          <span className="text-[var(--text-dim)] text-[20px]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 justify-center mb-12">
            <HelpCircle className="w-8 h-8 text-[#00538e]" />
            <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-6">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] hover:border-[#00538e]/30 transition-all group">
                <div className="flex gap-4">
                  <Info className="w-5 h-5 text-[#0AA390] shrink-0 mt-1 group-hover:rotate-12 transition-transform" />
                  <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight mb-3">{item.q}</h3>
                    <p className="text-[14px] text-[var(--text-muted)] font-medium leading-relaxed italic">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
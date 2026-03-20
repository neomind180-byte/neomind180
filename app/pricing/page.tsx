"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft, HelpCircle, Info, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/pricing-config';
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

const COMPARISON_FEATURES = [
  { name: "Daily Check-In", tiers: [true, true, true, true] },
  { name: "Self-Help Library", tiers: [true, true, true, true] },
  { name: "Progress Tracking", tiers: [true, true, true, true] },
  { name: "AI Sessions", tiers: ["10/day", "30/day", "Deep Journey AI", "Deep Journey AI"] },
  { name: "Group Circles", tiers: [false, true, true, true] },
  { name: "Async Coach Chat", tiers: [false, "Emmeline", "Emmeline", "Emmeline"] },
  { name: "1:1 Sessions", tiers: [false, false, false, "2/month"] },
  { name: "Priority Support", tiers: [false, "Community", "Priority", "Direct"] },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<'USD' | 'ZAR'>('USD');
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(plan: any) {
    if (plan.id === 'free') {
      router.push(isLoggedIn ? "/dashboard" : "/register?tier=free");
      return;
    }

    if (!isLoggedIn) {
      router.push(`/register?tier=${plan.id}`);
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

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
          currency: currency
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
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
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[#00538e] transition-colors font-black uppercase text-[12px] tracking-[0.2em] mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
            Choose Your Path to <br />
            <span className="text-[#0AA390]">Clarity, Confidence, and Compassion</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg md:text-xl font-medium italic">
            Flexible plans designed for every stage of your mindset journey. Cancel anytime.
          </p>

          {/* Currency Toggle */}
          <div className="flex justify-center pt-8">
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
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredTier(plan.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`relative bg-[var(--bg-card)] p-8 rounded-[3.5rem] border transition-all duration-500 flex flex-col ${
                plan.badgeType === 'accent' 
                  ? 'border-[#0AA390] shadow-2xl scale-105 z-10' 
                  : plan.badgeType === 'primary' 
                  ? 'border-[#00538e] shadow-xl' 
                  : 'border-[var(--border)] shadow-lg'
              } ${hoveredTier === plan.id ? '-translate-y-2' : ''}`}
            >
              {plan.badge && (
                <div className={`absolute top-0 right-0 px-6 py-2.5 rounded-bl-3xl rounded-tr-[3.4rem] text-[10px] font-black uppercase tracking-[0.2em] text-white ${
                  plan.badgeType === 'accent' ? 'bg-[#0AA390] animate-pulse' : 'bg-[#00538e]'
                }`}>
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
                <div className="mb-8 p-4 bg-[#0AA390]/10 rounded-2xl border border-[#0AA390]/20">
                  <p className="text-[11px] font-bold text-[#0AA390] italic flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> {plan.highlight}
                  </p>
                </div>
              )}

              <ul className="space-y-4 mb-20 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-tight leading-tight">
                    <Check className={`w-4 h-4 shrink-0 ${plan.badgeType === 'accent' ? 'text-[#0AA390]' : 'text-[#00538e]'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="space-y-4">
                <button
                  disabled={loadingPlanId !== null}
                  onClick={() => handleAction(plan)}
                  className={`block w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.badgeType === 'accent'
                      ? 'bg-[#0AA390] text-white shadow-xl shadow-[#0AA390]/20'
                      : plan.id === 'free'
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
        <div className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter text-center mb-12">Compare Features</h2>
          <div className="overflow-x-auto rounded-[3rem] border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg-input)]/50">
                  <th className="p-8 text-left text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] border-b border-[var(--border)]">Feature</th>
                  {PRICING_PLANS.map(plan => (
                    <th key={plan.id} className="p-8 text-center text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)] border-b border-[var(--border)]">
                      {plan.title.split(' ')[1]}
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
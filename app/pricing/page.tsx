import Link from 'next/link';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: "Basic Self-Help",
    price: "Free",
    features: ["Self-help library", "Daily check-in & tracking", "Daily Scripture & Mindset cards"],
    cta: "Start Free",
    link: "/register",
    color: "slate-900"
  },
  {
    name: "Coaching Access",
    price: "Tier 2",
    features: ["Ask-the-Coach channel (async)", "Deep-Dive Circles (Live)", "Weekly AI Clarity Reflection", "Full Self-Help Library"],
    cta: "Upgrade to Coaching",
    link: "/register",
    color: "[#00538e]",
    popular: true
  },
  {
    name: "Deep Coaching",
    price: "Tier 3",
    features: ["Everything in Tier 2", "1:1 coaching (2 sessions/mo)", "Deeper insights & support"],
    cta: "Apply for Deep Coaching",
    link: "/register",
    color: "[#0AA390]"
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-black text-[#00538e] uppercase tracking-tighter mb-4">Choose Your Path</h1>
        <p className="text-slate-500">Select the level of support that fits your current season.</p>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {tiers.map((tier, i) => (
          <div key={i} className={`p-10 rounded-[3rem] border-2 flex flex-col ${tier.popular ? 'border-[#00538e] shadow-2xl relative' : 'border-slate-100'}`}>
            {tier.popular && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00538e] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase">Most Popular</span>}
            <h3 className="text-xl font-black uppercase text-slate-900 mb-2">{tier.name}</h3>
            <div className="text-3xl font-black text-[#00538e] mb-8">{tier.price}</div>
            <ul className="space-y-4 mb-10 flex-grow">
              {tier.features.map((f, j) => (
                <li key={j} className="text-sm text-slate-600 flex items-start gap-3 leading-tight">
                  <Check className="w-4 h-4 text-[#0AA390] mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href={tier.link} className={`w-full py-4 text-center rounded-2xl font-bold transition-all ${tier.popular ? 'bg-[#00538e] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
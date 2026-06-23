export type SubscriptionTier = 'free' | 'starter' | 'builder' | 'catalyst' | 'tier2' | 'tier3';

export interface PricingPlan {
  id: SubscriptionTier;
  title: string;
  tagline: string;
  price: {
    USD: { amount: string; period: string };
    ZAR: { amount: string; period: string };
  };
  highlight?: string;
  badge?: string;
  badgeType?: 'primary' | 'accent';
  features: string[];
  cta: string;
  note?: string;
  aiLimit: number | 'unlimited';
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    title: '7-Day Free Trial',
    tagline: 'Experience daily grounding, self-observation, and guided AI reflections.',
    price: {
      USD: { amount: '0', period: '' },
      ZAR: { amount: '0', period: '' },
    },
    features: [
      'Daily Check-In Tool',
      'Self-Help Library & Guides',
      'Basic Progress Tracking & Shifts',
      'Neo AI Reflection (30 minutes/day)'
    ],
    cta: 'Start Your 7-Day Trial',
    aiLimit: 30, // 30 minutes daily limit
  },
  {
    id: 'starter', // Keeping starter ID to map cleanly to DB subscription tier constraints
    title: 'Full Plan',
    badge: 'MOST POWERFUL',
    badgeType: 'primary',
    tagline: 'Deepen your transformation with extended reflection time and direct coach guidance.',
    price: {
      USD: { amount: '15', period: 'MONTH' },
      ZAR: { amount: '250.00', period: 'MONTH' },
    },
    highlight: '💡 Complete coaching system: Advanced Insights + Async Coach Chat',
    features: [
      'Everything in the Free Trial',
      'Neo AI Reflection (60 minutes/day)',
      'Ask-the-Coach: Direct Async Chat with Coach Emmeline',
      'Advanced Progress Insights & Shift Analytics',
      'Priority coach response time',
      'Lifetime access to self-help worksheets & library updates'
    ],
    cta: 'Unlock the Full Plan',
    note: 'Billed monthly. Cancel anytime.',
    aiLimit: 60, // 60 minutes daily limit
  }
];

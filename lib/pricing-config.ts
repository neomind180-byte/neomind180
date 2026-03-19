export type SubscriptionTier = 'free' | 'starter' | 'builder' | 'catalyst';

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
    title: 'Clarity Foundation',
    tagline: 'Essential tools for daily grounding and self-observation.',
    price: {
      USD: { amount: '0', period: '' },
      ZAR: { amount: '0', period: '' },
    },
    features: [
      'Daily Check-In Tool',
      'Self-Help Library',
      'Basic Progress Tracking',
      'AI Reflection (10 sessions/day)'
    ],
    cta: 'Start Your Journey',
    aiLimit: 10,
  },
  {
    id: 'starter',
    title: 'Clarity Starter',
    badge: 'BEST VALUE',
    badgeType: 'primary',
    tagline: 'Lock in your commitment to transformation at the best rate.',
    price: {
      USD: { amount: '19', period: 'YEAR' },
      ZAR: { amount: '350', period: 'YEAR' },
    },
    highlight: '💡 Annual commitment only - just $1.58/month when paid yearly',
    features: [
      'Everything in Clarity Foundation',
      'Group Coaching Events (Circles)',
      'Async Coach Chat with Emmeline',
      'AI Reflection (30 sessions/day)',
      'Priority community support'
    ],
    cta: 'Commit to Clarity',
    note: 'Billed annually. Cancel anytime with 30-day satisfaction guarantee.',
    aiLimit: 30,
  },
  {
    id: 'builder',
    title: 'Confidence Builder',
    badge: 'MOST POPULAR',
    badgeType: 'accent',
    tagline: 'Accelerate your transformation with community and deep journey AI sessions.',
    price: {
      USD: { amount: '15', period: 'MONTH' },
      ZAR: { amount: '250', period: 'MONTH' },
    },
    features: [
      'Everything in Clarity Starter',
      'Deep Journey AI Sessions (High Intensity)',
      'Advanced progress insights',
      'Priority coach response time',
      'Exclusive community events'
    ],
    cta: 'Build Confidence',
    note: 'Billed monthly. Upgrade or cancel anytime.',
    aiLimit: 'unlimited',
  },
  {
    id: 'catalyst',
    title: 'Compassion Catalyst',
    tagline: 'High-touch 1:1 guidance for profound, lasting transformation.',
    price: {
      USD: { amount: '79', period: 'MONTH' },
      ZAR: { amount: '1400', period: 'MONTH' },
    },
    features: [
      'Everything in Confidence Builder',
      '2 × 1:1 Coaching Sessions per Month',
      'Priority Coach Support',
      'Priority Deep Journey AI Sessions',
      'Personalized transformation roadmap',
      'Direct access to Coach Emmeline'
    ],
    cta: 'Transform with Compassion',
    note: 'Premium tier. Limited spots available for personalized attention.',
    aiLimit: 'unlimited',
  },
];

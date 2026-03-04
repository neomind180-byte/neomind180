export interface MicroReset {
    slug: string;
    title: string;
    purpose: string;
    description: string;
    timeBadge: string;
    color: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    steps: string[];
    completionMessage: string;
    icon: string;
}

export const microResets: Record<string, MicroReset> = {
    breathing: {
        slug: 'breathing',
        title: '60-Second Breathing',
        purpose: 'Calm your nervous system in one minute.',
        description: 'Calm your nervous system in one minute.',
        timeBadge: '60 SEC',
        color: '#00538e', // Light blue/teal accent
        textColor: 'text-blue-900',
        bgColor: 'bg-[#f0f7ff]',
        borderColor: 'border-blue-200',
        icon: 'Wind',
        steps: [
            'Find a comfortable position. You can sit or stand.',
            'Close your eyes or soften your gaze.',
            'Take a deep breath in through your nose for 4 counts.',
            'Hold gently for 2 counts.',
            'Exhale slowly through your mouth for 6 counts.',
            'Repeat this 4 times.',
            'Notice how your body feels now.'
        ],
        completionMessage: 'Reset complete! Take a moment to notice how you feel!'
    },
    grounding: {
        slug: 'grounding',
        title: '2-Minute Grounding',
        purpose: 'For decision overwhelm - come back to the present moment.',
        description: 'Come back to the present moment.',
        timeBadge: '2 MIN',
        color: '#0AA390', // Green accent
        textColor: 'text-emerald-900',
        bgColor: 'bg-[#f0fdfa]',
        borderColor: 'border-emerald-200',
        icon: 'Navigation',
        steps: [
            'Pause whatever you\'re doing.',
            'Feel your feet on the ground. Press them down gently.',
            'Notice 5 things you can see around you.',
            'Notice 4 things you can touch or feel.',
            'Notice 3 things you can hear.',
            'Notice 2 things you can smell.',
            'Notice 1 thing you can taste.',
            'Take one deep breath and return to your day.'
        ],
        completionMessage: 'Well done! You\'ve completed the 2-Minute Grounding. Take a moment to notice any shifts in your body or mind.'
    },
    'self-compassion': {
        slug: 'self-compassion',
        title: '3-Minute Self-Compassion Reset',
        purpose: 'After a difficult day or moment of self-criticism.',
        description: 'Offer yourself kindness after a hard moment.',
        timeBadge: '3 MIN',
        color: '#993366', // Pink/red-violet accent
        textColor: 'text-fuchsia-900',
        bgColor: 'bg-[#fdf4ff]',
        borderColor: 'border-fuchsia-200',
        icon: 'Heart',
        steps: [
            'Place your hand on your heart.',
            'Acknowledge: "This is a moment of struggle."',
            'Remind yourself: "Struggle is part of being human."',
            'Say to yourself: "May I be kind to myself right now."',
            'Breathe in kindness, breathe out tension.',
            'Ask: "What do I need right now?"',
            'Offer yourself one small act of care.',
            'Thank yourself for taking this moment.'
        ],
        completionMessage: 'Well done! You\'ve completed the Self-Compassion Reset.'
    },
    'thought-release': {
        slug: 'thought-release',
        title: 'Thought Release Exercise',
        purpose: 'When thoughts feel overwhelming and stuck.',
        description: 'Let overwhelming thoughts drift away.',
        timeBadge: '2 MIN',
        color: '#F39904', // Orange accent
        textColor: 'text-orange-900',
        bgColor: 'bg-[#fffbeb]',
        borderColor: 'border-orange-200',
        icon: 'Cloud',
        steps: [
            'Imagine your thoughts as clouds in the sky.',
            'You are the sky - vast, open, unchanged.',
            'Watch each thought-cloud drift by.',
            'You don\'t need to hold onto any of them.',
            'Say: "I notice I\'m having the thought that..."',
            'Watch it float away.',
            'Return to the spaciousness of the sky.',
            'Take three gentle breaths.'
        ],
        completionMessage: 'Well done! You\'ve completed the Thought Release Exercise.'
    },
    'body-scan': {
        slug: 'body-scan',
        title: 'Quick Body Scan',
        purpose: 'Release tension you didn\'t know you were holding.',
        description: 'Release tension you didn\'t know you were holding.',
        timeBadge: '2 MIN',
        color: '#00538e', // Blue accent
        textColor: 'text-blue-900',
        bgColor: 'bg-[#eff6ff]',
        borderColor: 'border-blue-200',
        icon: 'Zap',
        steps: [
            'Close your eyes and take a breath.',
            'Scan from the top of your head downward.',
            'Notice your forehead - soften it.',
            'Notice your jaw - let it drop slightly.',
            'Notice your shoulders - let them fall.',
            'Notice your hands - unclench them.',
            'Notice your belly - let it soften.',
            'Take a final breath and open your eyes.'
        ],
        completionMessage: 'Well done! You\'ve completed the Quick Body Scan.'
    }
};

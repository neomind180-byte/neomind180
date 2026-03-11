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
    stepAudio?: string[];
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
        color: '#00538e',
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
        stepAudio: [
            '/micro-resets/1_breathing/1_position.mp3',
            '/micro-resets/1_breathing/2_close-eyes.mp3',
            '/micro-resets/1_breathing/3_breath.mp3',
            '/micro-resets/1_breathing/4_hold.mp3',
            '/micro-resets/1_breathing/5_exhale.mp3',
            '/micro-resets/1_breathing/6_repeat.mp3',
            '/micro-resets/1_breathing/7_notice.mp3'
        ],
        completionMessage: 'Reset complete! Take a moment to notice how you feel!'
    },
    grounding: {
        slug: 'grounding',
        title: '2-Minute Grounding',
        purpose: 'For decision overwhelm - come back to the present moment.',
        description: 'Come back to the present moment.',
        timeBadge: '2 MIN',
        color: '#0AA390',
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
        stepAudio: [
            '/micro-resets/2_grounding/1_pause.mp3',
            '/micro-resets/2_grounding/2_feel-feet.mp3',
            '/micro-resets/2_grounding/3_notice-5.mp3',
            '/micro-resets/2_grounding/4_notice-4.mp3',
            '/micro-resets/2_grounding/5_notice-3.mp3',
            '/micro-resets/2_grounding/6_notice-2.mp3',
            '/micro-resets/2_grounding/7_notice-1.mp3',
            '/micro-resets/2_grounding/8_return.mp3'
        ],
        completionMessage: 'Well done! You\'ve completed the 2-Minute Grounding. Take a moment to notice any shifts in your body or mind.'
    },
    'self-compassion': {
        slug: 'self-compassion',
        title: '3-Minute Self-Compassion Reset',
        purpose: 'After a difficult day or moment of self-criticism.',
        description: 'Offer yourself kindness after a hard moment.',
        timeBadge: '3 MIN',
        color: '#993366',
        textColor: 'text-fuchsia-900',
        bgColor: 'bg-[#fdf4ff]',
        borderColor: 'border-fuchsia-200',
        icon: 'Heart',
        steps: [
            'Place your hand on your heart.',
            'Acknowledge: "This is a moment of overcoming."',
            'Remind yourself: "Overcoming is part of being human."',
            'Say to yourself: "May I be kind to myself right now."',
            'Breathe in kindness, breathe out tension.',
            'Ask: "What do I need right now?"',
            'Offer yourself one small act of care.',
            'Thank yourself for taking this moment.'
        ],
        stepAudio: [
            '/micro-resets/3_self-compassion/1_hand-heart.mp3',
            '/micro-resets/3_self-compassion/2_acknowledge.mp3',
            '/micro-resets/3_self-compassion/3_remind.mp3',
            '/micro-resets/3_self-compassion/4_kind.mp3',
            '/micro-resets/3_self-compassion/5_breathe.mp3',
            '/micro-resets/3_self-compassion/6_ask.mp3',
            '/micro-resets/3_self-compassion/7_act-of-care.mp3',
            '/micro-resets/3_self-compassion/8_thank-you.mp3'
        ],
        completionMessage: 'Well done! You\'ve completed the Self-Compassion Reset.'
    },
    'thought-release': {
        slug: 'thought-release',
        title: 'Thought Release Exercise',
        purpose: 'When thoughts feel overwhelming and stuck.',
        description: 'Let overwhelming thoughts drift away.',
        timeBadge: '2 MIN',
        color: '#F39904',
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
        stepAudio: [
            '/micro-resets/4_thought-release/1_thoughts-clouds.mp3',
            '/micro-resets/4_thought-release/2_you-are-the-sky.mp3',
            '/micro-resets/4_thought-release/3_watch.mp3',
            '/micro-resets/4_thought-release/4_no-hold.mp3',
            '/micro-resets/4_thought-release/5_notice.mp3',
            '/micro-resets/4_thought-release/6_away.mp3',
            '/micro-resets/4_thought-release/7_return.mp3',
            '/micro-resets/4_thought-release/8_breaths.mp3'
        ],
        completionMessage: 'Well done! You\'ve completed the Thought Release Exercise.'
    },
    'body-scan': {
        slug: 'body-scan',
        title: 'Quick Body Scan',
        purpose: 'Release tension you didn\'t know you were holding.',
        description: 'Release tension you didn\'t know you were holding.',
        timeBadge: '2 MIN',
        color: '#00538e',
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
        stepAudio: [
            '/micro-resets/5_body-scan/1_close-eyes-breath.mp3',
            '/micro-resets/5_body-scan/2_scan.mp3',
            '/micro-resets/5_body-scan/3_notice-forehead.mp3',
            '/micro-resets/5_body-scan/4_notice-jaw.mp3',
            '/micro-resets/5_body-scan/5_notice-shoulders.mp3',
            '/micro-resets/5_body-scan/6_notice-hands.mp3',
            '/micro-resets/5_body-scan/7_notice-belly.mp3',
            '/micro-resets/5_body-scan/8_final-breath.mp3'
        ],
        completionMessage: 'Well done! You\'ve completed the Quick Body Scan.'
    }
};

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { 
  getRecentReflections, 
  getDailyChatTime 
} from '@/lib/db/reflections';
import { 
  formatAIHistoryContext, 
  getTierLimit
} from '@/lib/ai/gemini-context';
import { buildSystemInstruction } from '@/lib/ai/prompts';
import { runNeoConversation, ChatCompletionMessageParam } from '@/lib/ai/openrouter';

// Allow up to 60s for AI-powered reflection responses (Vercel Hobby supports up to 60s)
export const maxDuration = 60;

interface ChatMessage {
  role: string;
  content: string;
}

const INTERRUPTION_OPTIONS = [
  "I hit a temporary interruption while following your thought. Try sending that again.",
  "I lost connection to the flow of our conversation for a moment. Please resend your last message.",
  "Something interrupted my response mid-thought. Go ahead and send that again.",
  "I momentarily lost the conversational thread. I'm ready to continue.",
  "Looks like our conversation got briefly interrupted. Please continue from your last thought."
];

function getInterruptionResponse(): string {
  const randomIndex = Math.floor(Math.random() * INTERRUPTION_OPTIONS.length);
  return INTERRUPTION_OPTIONS[randomIndex];
}

function isInterruptionMessage(content: string): boolean {
  if (!content) return false;
  const normalized = content.trim().toLowerCase();
  return INTERRUPTION_OPTIONS.some(option => option.trim().toLowerCase() === normalized);
}

/**
 * Crisis safety check helper function.
 * Matches keywords for suicide, self-harm, domestic violence, or severe illegal harm.
 * Returns a formatted message with hotlines if a crisis is detected, or null.
 */
function checkCrisisSafety(message: string): string | null {
  if (!message) return null;
  
  const text = message.toLowerCase();
  
  // Crisis safety triggers
  const selfHarmPattern = /\b(suicide|suicidal|kill myself|end my life|want to die|commit suicide|self harm|cutting myself|harming myself)\b/;
  const violencePattern = /\b(kill him|kill her|kill them|murder|shoot someone|stab someone|harm someone)\b/;
  const domesticAbusePattern = /\b(abuse|domestic violence|beating me|physically hurting me|assaulted me|hitting me|husband beats)\b/;
  
  if (selfHarmPattern.test(text) || violencePattern.test(text) || domesticAbusePattern.test(text)) {
    return `It sounds like you are going through an incredibly difficult time or experiencing a crisis. Your safety and well-being are the absolute priority, and I want to make sure you have immediate access to professional support. 

Please reach out to one of the following free, confidential resources right now:

🇿🇦 **South Africa Helplines:**
• **Suicide Crisis Helpline:** 0800 567 567 (24/7)
• **Careline (24hr Crisis distress support):** 082 787 6452 or 082 822 7981

🇺🇸 / 🇨🇦 **US & Canada Helplines:**
• **Suicide & Crisis Lifeline:** Call or text 988 (24/7)
• **Crisis Text Line:** Text "HOME" to 741741

🇬🇧 **UK Helplines:**
• **Samaritans:** Call 116 123
• **National Domestic Abuse Helpline:** 0808 2000 247

🌐 **International Support:**
• Find a crisis center in your country at [Befrienders Worldwide](https://www.befrienders.org/) or [Find A Helpline](https://findahelpline.com/)

Please connect with someone who can help keep you safe. I am here to support your reflection once you are in a safe space.`;
  }
  
  return null;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_tier, trial_expires_at')
      .eq('id', user.id)
      .single();

    if (!profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tier = profileData.subscription_tier || 'free';
    const trialExpiresAt = profileData.trial_expires_at ? new Date(profileData.trial_expires_at) : null;
    const isTrialExpired = tier === 'free' && trialExpiresAt && trialExpiresAt < new Date();

    const dailyChatTime = await getDailyChatTime(user.id);
    const limit = getTierLimit(tier);
    const isLimitReached = dailyChatTime >= limit;

    let limitMessage = null;
    if (isTrialExpired) {
      limitMessage = "Your 7-day free trial of Neo Reflections has expired. You can still use your self-help tools, journaling, and daily check-in anytime. Subscribe to the Full Plan for longer support, more reflection time, and deeper access.";
    } else if (isLimitReached) {
      const messages = [
        "You've completed your reflection time for today. Your next window opens tomorrow.",
        "You can still use your self-help tools, journaling, and daily check-in anytime."
      ];
      
      if (tier === 'free') {
        messages.push("Need longer support? Subscribe for more reflection time and deeper access.");
      }
      
      limitMessage = messages.join('\n\n');
    }

    return NextResponse.json({
      dailyChatTime,
      limit,
      isLimitReached,
      isTrialExpired,
      limitMessage,
      tier
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Reflection Status GET Error:", err);
    return NextResponse.json({ error: 'Internal server error', message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // Create a dedicated supabase client for this request using the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { message, history } = await req.json();

    // Run hard safety crisis middleware check
    const crisisWarning = checkCrisisSafety(message);
    if (crisisWarning) {
      return NextResponse.json({
        role: 'neo',
        content: crisisWarning,
        timestamp: new Date().toISOString()
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("Server Configuration Error: OPENROUTER_API_KEY is not set.");
      return NextResponse.json({
        role: 'neo',
        content: "I'm having trouble connecting to my cognitive system right now. Please verify server configurations."
      }, { status: 500 });
    }

    // 1. Fetch user's profile and tier details
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, trial_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tier = profileData.subscription_tier || 'free';
    const trialExpiresAt = profileData.trial_expires_at ? new Date(profileData.trial_expires_at) : null;
    const isTrialExpired = tier === 'free' && trialExpiresAt && trialExpiresAt < new Date();

    if (isTrialExpired) {
      return NextResponse.json({
        role: 'neo',
        content: "Your 7-day free trial of Neo Reflections has expired. You can still use your self-help tools, journaling, and daily check-in anytime. Subscribe to the Full Plan for longer support, more reflection time, and deeper access.",
        trialExpired: true
      }, { status: 403 });
    }

    // 2. Check Daily Limit
    const dailyChatTime = await getDailyChatTime(user.id);
    const limit = getTierLimit(tier); // 30 minutes for free, 60 minutes for paid

    if (dailyChatTime >= limit) {
      const messages = [
        "You've completed your reflection time for today. Your next window opens tomorrow.",
        "You can still use your self-help tools, journaling, and daily check-in anytime."
      ];
      
      if (tier === 'free') {
        messages.push("Need longer support? Subscribe for more reflection time and deeper access.");
      }

      return NextResponse.json({
        role: 'neo',
        content: messages.join('\n\n'),
        limitReached: true
      }, { status: 429 });
    }

    // 3. AI Memory Context
    const recentReflections = await getRecentReflections(user.id, 5);
    const historyContext = formatAIHistoryContext(recentReflections);

    // 4. Initialize Unified SYSTEM_INSTRUCTION (Layer 1 + Layer 2) + Memory
    const fullSystemInstruction = buildSystemInstruction(historyContext);

    // 5. Format current session history with Interruption detection & Context Recovery
    const rawHistory: ChatMessage[] = history || [];

    // Check last Neo response to see if it was an interruption
    const lastNeoMsg = [...rawHistory].reverse().find(m => m.role === 'neo');
    const wasLastNeoInterrupted = lastNeoMsg && isInterruptionMessage(lastNeoMsg.content);

    // Check if the current user message is a resume keyword trigger
    const lowerMsg = (message || "").trim().toLowerCase();
    const isResumeKeyword = ['resume', 'continue', 'please continue', 'go ahead', 'keep going'].includes(lowerMsg) ||
                            lowerMsg.startsWith('resume') ||
                            lowerMsg.startsWith('continue');

    // Check if the user is resending their last message
    const lastUserMsg = [...rawHistory].reverse().find(m => m.role === 'user');
    const isResentMessage = lastUserMsg && lastUserMsg.content.trim() === (message || "").trim();

    const isResuming = wasLastNeoInterrupted || isResumeKeyword || isResentMessage;

    let promptToSend = message;
    let finalHistoryForGemini = rawHistory;

    if (isResuming) {
      // Find the index of the last meaningful user message (i.e. not a resume keyword)
      let lastMeaningfulUserIndex = -1;
      for (let i = rawHistory.length - 1; i >= 0; i--) {
        const msg = rawHistory[i];
        if (msg.role === 'user') {
          const content = msg.content || "";
          const lower = content.trim().toLowerCase();
          const isKeyword = ['resume', 'continue', 'please continue', 'go ahead', 'keep going'].includes(lower) ||
                            lower.startsWith('resume') ||
                            lower.startsWith('continue');
          if (!isKeyword) {
            lastMeaningfulUserIndex = i;
            break;
          }
        }
      }

      if (lastMeaningfulUserIndex === -1) {
        // Graceful memory failure recovery
        return NextResponse.json({
          role: 'neo',
          content: "I lost part of our previous thread. Could you briefly reconnect me to where your mind was going?",
          timestamp: new Date().toISOString()
        });
      }

      const recoveredUserMsgContent = rawHistory[lastMeaningfulUserIndex].content;

      // Slice the history strictly BEFORE the last meaningful user message
      // This strips the interruption message, retry keywords, and the resent user message from history.
      finalHistoryForGemini = rawHistory.slice(0, lastMeaningfulUserIndex);

      // Instruct Neo to process the recovered statement following the Resume Response Structure
      promptToSend = `
${recoveredUserMsgContent}

[SYSTEM NOTE: The conversation is resuming after a temporary connection interruption. The user's last statement was: "${recoveredUserMsgContent}".
Please respond by strictly adhering to these recovery steps:
1. Context Recall: Briefly reconnect to the previous topic.
2. Emotional/Insight Reflection: Summarize the last meaningful insight or emotional theme you noticed.
3. Natural Continuation Question: Continue the coaching flow naturally with an open-ended coaching question.
Do NOT mention connection drops, servers, API limitations, or technical terms. Keep the recovery response warm, relational, brief (1-3 sentences total), and deeply human.]
      `.trim();
    } else {
      // If not resuming, just filter out any leftover interruption messages from history
      finalHistoryForGemini = rawHistory.filter((msg: ChatMessage) => {
        if (msg.role === 'neo' && isInterruptionMessage(msg.content)) {
          return false;
        }
        return true;
      });
    }

    const firstUserIndex = finalHistoryForGemini.findIndex((msg: ChatMessage) => msg.role !== 'neo');

    const formattedHistory: ChatCompletionMessageParam[] = firstUserIndex === -1
      ? []
      : finalHistoryForGemini.slice(firstUserIndex).map((msg: ChatMessage) => ({
        role: msg.role === 'neo' ? 'assistant' : 'user',
        content: msg.content || "",
      }));

    // Construct the full messages array for standard chat completion
    const messages = [
      { role: 'system' as const, content: fullSystemInstruction },
      ...formattedHistory,
      { role: 'user' as const, content: promptToSend }
    ];

    // 6. Request response from OpenRouter
    const response = await runNeoConversation(messages);

    return NextResponse.json({
      role: 'neo',
      content: response,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("OpenRouter/Reflection Error:", err);
    try {
      fs.appendFileSync(
        path.join(process.cwd(), 'error.txt'),
        `[${new Date().toISOString()}] reflection API error: ${err.stack || err.message}\n`
      );
    } catch (e) {
      console.error("Failed to write error to log file:", e);
    }
    return NextResponse.json({
      role: 'neo',
      content: getInterruptionResponse(),
      error: 'An unexpected issue occurred while communicating with the AI service.'
    }, { status: 500 });
  }
}

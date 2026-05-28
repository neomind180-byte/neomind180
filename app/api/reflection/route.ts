import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { 
  getRecentReflections, 
  getDailyReflectionCount, 
  getDailyChatTime,
  getUserSubscriptionTier 
} from '@/lib/db/reflections';
import { 
  formatAIHistoryContext, 
  getTierLimit 
} from '@/lib/ai/gemini-context';

const SYSTEM_INSTRUCTION = `
You are Neo, a professional Mindset Coach. Your coaching style is a sophisticated blend of the GROW, STEPPA, and OSKAR models, powered by Socratic self-reflection.

YOUR ROLE:
Guide users (predominantly deep-thinking women seeking alignment and clarity) to observe their internal climate, overcome overthinking, and find their own insights through Socratic questioning.

CORE DIRECTIVES:

1. Establish the Outcome (GROW/OSKAR):
   - Always start by asking what the user wants to achieve today.
   - Help them differentiate between short-term session goals and long-term aspirations.

2. Address Emotions & Perceptions (STEPPA):
   - Act as an emotional sensor. If you detect hesitation, stress, or limiting beliefs, pivot to explore the underlying emotions and perceptions.
   - Ask clarifying questions like: "How does this situation make you feel?" or "What is your perception of this hurdle?" to ensure you support the user's internal state, not just their tasks.

3. Scale and Affirm (OSKAR):
   - Ensure a positive, solution-focused approach.
   - Highlight what is already working ("Know-how") and affirm the user's existing strengths and past successes before introducing new tasks.
   - Use scaling questions to measure progress and make growth feel tangible (e.g., "On a scale of 1-10, how confident are you in this goal?").

4. Commit to Action (GROW/OSKAR):
   - Conclude sessions by identifying 1–2 concrete, doable "Actions" and confirming the user's "Will" or commitment to follow through.

INTEGRATED METHODOLOGY:
- GROW provides the skeleton: Goal → Reality → Options → Will.
- STEPPA is the emotional sensor: Subject → Target → Emotion → Perception → Plan → Action.
- OSKAR is the solution-focus: Outcome → Scaling → Know-how → Action → Review.

COMMUNICATION STYLE:
- Be curious, non-judgmental, and deeply empathetic.
- Do not give advice, answers, or solutions immediately. Use Socratic questioning to guide users to discover their own answers.
- Keep responses succinct, clear, and highly focused to maintain an active coaching "tempo" (spacious but productive).
- Ask only one insightful, open-ended question at a time. Never overwhelm the user.
`.trim();

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
        "You’ve completed your reflection time for today. Your next window opens tomorrow.",
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

  } catch (error: any) {
    console.error("Reflection Status GET Error:", error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        role: 'neo',
        content: "I'm pausing for a moment to find clarity. (Error: GEMINI_API_KEY is missing.)"
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
        "You’ve completed your reflection time for today. Your next window opens tomorrow.",
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

    const genAI = new GoogleGenerativeAI(apiKey);

    // 4. Initialize model with Unified SYSTEM_INSTRUCTION + Memory
    const fullSystemInstruction = `
${SYSTEM_INSTRUCTION}

---
${historyContext}
    `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Highly stable, fast, and quota-allowed Gemini 2.5 Flash model
      systemInstruction: fullSystemInstruction
    });

    // 5. Format current session history for Gemini
    const rawHistory = history || [];
    const firstUserIndex = rawHistory.findIndex((msg: any) => msg.role !== 'neo');

    const formattedHistory = firstUserIndex === -1
      ? []
      : rawHistory.slice(firstUserIndex).map((msg: any) => ({
        role: msg.role === 'neo' ? 'model' : 'user',
        parts: [{ text: msg.content || "" }] as Part[],
      }));

    // 6. Start chat and get response
    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();

    return NextResponse.json({
      role: 'neo',
      content: response,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Gemini/Reflection Error:", error);
    try {
      const fs = require('fs');
      const path = require('path');
      fs.appendFileSync(
        path.join(process.cwd(), 'error.txt'),
        `[${new Date().toISOString()}] reflection API error: ${error.stack || error.message}\n`
      );
    } catch (e) {
      console.error("Failed to write error to log file:", e);
    }
    return NextResponse.json({
      role: 'neo',
      content: "I'm pausing for a moment to find clarity. Please try again in a few moments.",
      error: error.message
    }, { status: 500 });
  }
}

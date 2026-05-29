interface ReflectionMessage {
  role: string;
  content: string;
}

interface ReflectionSession {
  created_at: string;
  messages: ReflectionMessage[];
  last_message: string;
}

/**
 * Formats recent reflection summaries into a context string for Gemini.
 */
export function formatAIHistoryContext(reflections: ReflectionSession[]) {
  if (!reflections || reflections.length === 0) {
    return "This is the user's first reflection session. Start with a warm, welcoming presence.";
  }

  // Summarize historical reflections (reverse order: newest to oldest)
  const summaries = reflections.map((ref) => {
    const date = new Date(ref.created_at).toLocaleDateString();
    
    // Extract up to the last 3 user statements to capture the core topics of the session
    const userMsgs = (ref.messages || [])
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .slice(-3);
      
    const userContext = userMsgs.length > 0 
      ? `User expressed: "${userMsgs.join('; ')}"`
      : `No user messages.`;

    return `[Session on ${date}]:
- User thoughts/focus: ${userContext}
- Your (Neo's) last response: "${ref.last_message}"`;
  });

  return `
HISTORICAL AI MEMORY:
You have interacted with this user in previous distinct sessions. Here are key highlights of their past reflections to help you remember them:
${summaries.join('\n\n')}

INSTRUCTIONS BASED ON MEMORY:
- Acknowledge their past reflections naturally and seamlessly if they bring up related topics.
- Notice pattern/mindset evolution across these sessions (e.g. if they often mention anxiety, feeling overwhelmed, or struggling with self-compassion).
- Use this context to form a deep, personalized relationship, asking Socratic questions that connect their present thoughts to their past breakthroughs or recurring blocks.
- Never directly print the JSON or raw memory, but talk like an insightful companion who actually remembers their previous conversations.
  `.trim();
}

/**
 * Normalizes user tiers to daily reflection limits in minutes.
 * Free Trial: 30 minutes/day
 * Paid (Full Plan / Starter / Builder / Catalyst): 60 minutes/day
 */
export function getTierLimit(tier: string): number {
  if (tier === 'free') {
    return 30; // 30 minutes/day for 7-day free trial
  }
  return 60; // 60 minutes/day for full plan (and other paid tiers)
}

/**
 * Model definitions for the NeoMind180 platform.
 * Gemini 2.5 Flash is used for the main conversational coach (Neo reflections) where high emotional intelligence is required.
 * Gemini 2.5 Flash-lite is used for lightweight structured backend tasks like summaries, prompts, and post-chat analysis.
 */
export const NEO_CONVERSATION_MODEL = "gemini-2.5-flash";
export const NEO_BACKGROUND_MODEL = "gemini-2.5-flash-lite";

/**
 * Constructs the system instruction for generating a session completion summary and check-in questions.
 */
export function getCompletionSystemInstruction(): string {
  return `
You are an expert mindset coach assistant. Your task is to analyze the reflection session chat history and generate a structured JSON object containing a warm, relational, and non-clinical summary alongside 3 tailored check-in questions for their next session.

You must return a JSON object with the following exact keys:
1. "summary": An array of 5 concise, warm, non-clinical bullet strings exactly matching these headers:
   - "Concern: [Short summary of what they are working through]"
   - "Emotion: [The primary feelings or somatic states noticed]"
   - "Pattern: [The recurring cognitive loop or behavior block]"
   - "Recent Insight: [The positive realization or shift in perception]"
   - "Next Step: [The collaborative action, boundary, or experiment agreed upon]"
2. "checkInQuestions": An array of exactly 3 gentle coaching questions tailored to reopen the conversation in their next session:
   - Question 1 (Body-Based): Connects to somatic sensations, energy, or bodily state.
   - Question 2 (Insight-Based): Explores their cognitive reframes, patterns, or deeper awareness.
   - Question 3 (Action-Based): Prompts an experiment, action, habit, or boundaries.

Keep the tone calm, encouraging, deeply human, and supportive. Avoid any clinical, diagnosing, or overly robotic terms.
`.trim();
}

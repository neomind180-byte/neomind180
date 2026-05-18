/**
 * Formats recent reflection summaries into a context string for Gemini.
 */
export function formatAIHistoryContext(reflections: any[]) {
  if (!reflections || reflections.length === 0) {
    return "This is the user's first reflection session. Start with a warm, welcoming presence.";
  }

  // Summarize historical reflections (reverse order: newest to oldest)
  const summaries = reflections.map((ref) => {
    const date = new Date(ref.created_at).toLocaleDateString();
    
    // Extract up to the last 3 user statements to capture the core topics of the session
    const userMsgs = (ref.messages as any[] || [])
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

/**
 * Formats recent reflection summaries into a context string for Gemini.
 */
export function formatAIHistoryContext(reflections: any[]) {
  if (!reflections || reflections.length === 0) {
    return "This is the user's first reflection session. Start with a warm, welcoming presence.";
  }

  // Summarize historical reflections (reverse order: newest to oldest)
  const summaries = reflections.map((ref, idx) => {
    const date = new Date(ref.created_at).toLocaleDateString();
    return `[Session on ${date}]: Last observation was "${ref.last_message}"`;
  });

  return `
HISTORICAL AI MEMORY:
You have interacted with this user before. Here are brief summaries of their previous reflections:
${summaries.join('\n')}

INSTRUCTIONS BASED ON MEMORY:
- Reference their growth if you notice recurring themes.
- If they mentioned a specific block or "Mind/Body/Energy" state before, gently check in on how that has shifted.
- Do not repeat specifically what was said, but hold the "atmosphere" of their past progress.
  `.trim();
}

/**
 * Normalizes user tiers to limits.
 */
export function getTierLimit(tier: string) {
  const limits: Record<string, number> = {
    free: 10,
    starter: 30,
    builder: 1000, // Unlimited-Ish
    catalyst: 1000,
    tier2: 30, // Backward compatibility
    tier3: 1000,
  };

  return limits[tier] || 10;
}

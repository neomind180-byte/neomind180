import { NEO_PERSONA_COACHING_LAYER } from './neo-persona';
import { NEO_SAFETY_APPLICATION_LAYER } from './neo-safety-app';

export { NEO_PERSONA_COACHING_LAYER } from './neo-persona';
export { NEO_SAFETY_APPLICATION_LAYER } from './neo-safety-app';

/**
 * Unifies Layer 1 (Persona & Coaching Behaviour), Layer 2 (Safety & App Rules),
 * and dynamic session memory into the complete system instruction for Neo.
 */
export function buildSystemInstruction(historyContext: string): string {
  return `
${NEO_PERSONA_COACHING_LAYER}

---
${NEO_SAFETY_APPLICATION_LAYER}

---
${historyContext}
  `.trim();
}

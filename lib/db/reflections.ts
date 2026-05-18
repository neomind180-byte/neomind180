import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Calculates the active chat duration in minutes from an array of messages.
 * Uses a gap-based clustering algorithm to determine distinct blocks of active chatting.
 */
export function calculateActiveChatTime(messages: any[]): number {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return 0;
  
  // Sort messages by timestamp or estimated timestamp
  const sorted = [...userMessages].map(m => ({
    ...m,
    timeMs: m.timestamp ? new Date(m.timestamp).getTime() : Date.now()
  })).sort((a, b) => a.timeMs - b.timeMs);
  
  let totalMs = 0;
  const GAP_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes max gap between messages in a block
  const DEFAULT_MESSAGE_MS = 1.5 * 60 * 1000; // 1.5 minutes default duration per message block/interaction
  
  let blockStart = sorted[0].timeMs;
  let blockLast = blockStart;
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i].timeMs;
    const gap = current - blockLast;
    
    if (gap <= GAP_THRESHOLD_MS) {
      blockLast = current;
    } else {
      // End current block and start a new one
      totalMs += Math.max(DEFAULT_MESSAGE_MS, blockLast - blockStart);
      blockStart = current;
      blockLast = current;
    }
  }
  
  // Add the last block
  totalMs += Math.max(DEFAULT_MESSAGE_MS, blockLast - blockStart);
  
  // Return duration in minutes (rounded to 1 decimal place)
  return Math.round((totalMs / (1000 * 60)) * 10) / 10;
}

/**
 * Fetches recent reflections for a user to provide context to the AI.
 * @param userId User's UUID
 * @param limit Number of recent reflections to fetch
 */
export async function getRecentReflections(userId: string, limit = 5) {
  const { data, error } = await supabaseAdmin
    .from('reflections')
    .select('messages, created_at, last_message')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent reflections:', error);
    return [];
  }

  return data;
}

/**
 * Counts the number of user messages sent today across all reflection sessions.
 * @param userId User's UUID
 */
export async function getDailyReflectionCount(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from('reflections')
    .select('messages')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());

  if (error) {
    console.error('Error counting daily reflections:', error);
    return 0;
  }

  let totalCount = 0;
  data.forEach((ref: any) => {
    const userMessages = (ref.messages as any[] || []).filter(m => m.role === 'user').length;
    totalCount += userMessages;
  });

  return totalCount;
}

/**
 * Calculates the total active chat time (in minutes) spent by the user today.
 * @param userId User's UUID
 */
export async function getDailyChatTime(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Fetch all reflections updated today
  const { data, error } = await supabaseAdmin
    .from('reflections')
    .select('messages, created_at')
    .eq('user_id', userId)
    .gte('updated_at', startOfDay.toISOString());

  if (error) {
    console.error('Error fetching daily reflections for time calc:', error);
    return 0;
  }

  // Filter messages to only those with a timestamp from today
  const todayMsgs: any[] = [];
  const startMs = startOfDay.getTime();

  data?.forEach((ref: any) => {
    const msgs = ref.messages as any[] || [];
    msgs.forEach((m: any) => {
      if (m.role === 'user') {
        if (m.timestamp) {
          const t = new Date(m.timestamp).getTime();
          if (t >= startMs) {
            todayMsgs.push(m);
          }
        } else {
          // Fallback if no timestamp: if the session was created today, estimate based on creation time
          const creationTime = new Date(ref.created_at).getTime();
          if (creationTime >= startMs) {
            todayMsgs.push({
              role: 'user',
              timestamp: ref.created_at
            });
          }
        }
      }
    });
  });

  return calculateActiveChatTime(todayMsgs);
}

/**
 * Fetches the user's subscription tier.
 * @param userId User's UUID
 */
export async function getUserSubscriptionTier(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user tier:', error);
    return 'free';
  }

  return data.subscription_tier || 'free';
}


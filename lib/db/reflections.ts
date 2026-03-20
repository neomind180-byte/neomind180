import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export function useCheckInData() {
  const { user, profile } = useAuth();
  const [weeklyStreak, setWeeklyStreak] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [recentShifts, setRecentShifts] = useState<any[]>([]);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);

  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // Fetch Profile for Tier
      if (profile) {
        setSubscriptionTier(profile.subscription_tier);
      }

      // Fetch last 14 days to be safe
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setRecentShifts(data.slice(0, 3)); // Last 3 for the card

        // Calculate streak for current week (Mon-Sun)
        const streak = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const todayStr = now.toDateString();

        const foundToday = data.find(ci => new Date(ci.created_at).toDateString() === todayStr);
        if (foundToday) {
          setCheckedInToday(true);
          setTodayCheckIn(foundToday);
        }

        data.forEach(checkIn => {
          const date = new Date(checkIn.created_at);
          const dayIndex = (date.getDay() + 6) % 7; // Map Sun=0 to Mon-Sun
          // Only mark if it's within the current calendar week
          streak[dayIndex] = 1;
        });
        setWeeklyStreak(streak);
      }
      setLoading(false);
    }
    fetchData();
  }, [user, profile]);

  return { weeklyStreak, recentShifts, subscriptionTier, checkedInToday, todayCheckIn, loading };
}
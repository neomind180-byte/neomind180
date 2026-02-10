import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useCheckInData() {
  const [weeklyStreak, setWeeklyStreak] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [recentShifts, setRecentShifts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
        
        data.forEach(checkIn => {
          const date = new Date(checkIn.created_at);
          const dayIndex = (date.getDay() + 6) % 7; // Map Sun=0 to Mon-Sun
          // Only mark if it's within the current calendar week
          streak[dayIndex] = 1;
        });
        setWeeklyStreak(streak);
      }
    }
    fetchData();
  }, []);

  return { weeklyStreak, recentShifts };
}
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export interface DayPractice {
  dayName: string;
  fullDayName: string;
  date: Date;
  dateStr: string;
  checkIns: number;
  reflections: number;
  microResets: number;
  total: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  state: 'none' | 'active' | 'multiple';
  ariaLabel: string;
}

export interface WeeklyPracticeSummary {
  totalCheckIns: number;
  totalReflections: number;
  totalMicroResets: number;
  totalPractices: number;
  daysEngaged: number;
  days: DayPractice[];
  encouragement: string;
}

function getMondayOfCurrentWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

const defaultSummary: WeeklyPracticeSummary = {
  totalCheckIns: 0,
  totalReflections: 0,
  totalMicroResets: 0,
  totalPractices: 0,
  daysEngaged: 0,
  encouragement: "There's always room for one small reset.",
  days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((name, i) => ({
    dayName: name,
    fullDayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
    date: new Date(),
    dateStr: '',
    checkIns: 0,
    reflections: 0,
    microResets: 0,
    total: 0,
    isToday: i === (new Date().getDay() + 6) % 7,
    isPast: false,
    isFuture: false,
    state: 'none',
    ariaLabel: `${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}: No activity yet`
  }))
};

export function useCheckInData() {
  const { user, profile } = useAuth();
  const [weeklyStreak, setWeeklyStreak] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyPracticeSummary>(defaultSummary);
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

      if (profile) {
        setSubscriptionTier(profile.subscription_tier);
      }

      try {
        const startOfWeek = getMondayOfCurrentWeek(new Date());
        const startOfWeekISO = startOfWeek.toISOString();

        // 1. Fetch Check-ins for this week
        const { data: checkInsData } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startOfWeekISO)
          .order('created_at', { ascending: false });

        // 2. Fetch Reflections for this week
        const { data: reflectionsData } = await supabase
          .from('reflections')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startOfWeekISO);

        // 3. Fetch Shifts & Micro-Resets for this week
        const { data: shiftsData } = await supabase
          .from('shifts')
          .select('id, created_at, thought')
          .eq('user_id', user.id)
          .gte('created_at', startOfWeekISO);

        // Calculate today's check-in status
        const today = new Date();
        const todayDateStr = today.toDateString();
        const foundToday = (checkInsData || []).find(
          ci => new Date(ci.created_at).toDateString() === todayDateStr
        );
        if (foundToday) {
          setCheckedInToday(true);
          setTodayCheckIn(foundToday);
        } else {
          setCheckedInToday(false);
          setTodayCheckIn(null);
        }

        setRecentShifts((checkInsData || []).slice(0, 3));

        // Build 7-day practice matrix (Monday through Sunday)
        const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        let totalCheckIns = 0;
        let totalReflections = 0;
        let totalMicroResets = 0;
        let daysEngaged = 0;
        const streakArray = [0, 0, 0, 0, 0, 0, 0];

        const days: DayPractice[] = [];

        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(startOfWeek);
          dayDate.setDate(startOfWeek.getDate() + i);
          const dayDateStr = dayDate.toDateString();
          const isToday = dayDateStr === todayDateStr;
          const isPast = dayDate < today && !isToday;
          const isFuture = dayDate > today && !isToday;

          const dayCheckIns = (checkInsData || []).filter(
            item => new Date(item.created_at).toDateString() === dayDateStr
          ).length;

          const dayReflections = (reflectionsData || []).filter(
            item => new Date(item.created_at).toDateString() === dayDateStr
          ).length;

          const dayMicroResets = (shiftsData || []).filter(
            item => new Date(item.created_at).toDateString() === dayDateStr
          ).length;

          const dayTotal = dayCheckIns + dayReflections + dayMicroResets;

          totalCheckIns += dayCheckIns;
          totalReflections += dayReflections;
          totalMicroResets += dayMicroResets;

          if (dayTotal > 0) {
            daysEngaged++;
            streakArray[i] = 1;
          }

          const state: 'none' | 'active' | 'multiple' =
            dayTotal === 0 ? 'none' : dayTotal === 1 ? 'active' : 'multiple';

          const details: string[] = [];
          if (dayCheckIns > 0) details.push(`${dayCheckIns} check-in${dayCheckIns > 1 ? 's' : ''}`);
          if (dayReflections > 0) details.push(`${dayReflections} reflection${dayReflections > 1 ? 's' : ''}`);
          if (dayMicroResets > 0) details.push(`${dayMicroResets} micro-reset${dayMicroResets > 1 ? 's' : ''}`);

          const ariaLabel = `${fullDayNames[i]}: ${
            dayTotal === 0 ? 'No activity yet' : `${dayTotal} practice${dayTotal > 1 ? 's' : ''} (${details.join(', ')})`
          }${isToday ? ' (Today)' : ''}`;

          days.push({
            dayName: dayLabels[i],
            fullDayName: fullDayNames[i],
            date: dayDate,
            dateStr: dayDateStr,
            checkIns: dayCheckIns,
            reflections: dayReflections,
            microResets: dayMicroResets,
            total: dayTotal,
            isToday,
            isPast,
            isFuture,
            state,
            ariaLabel
          });
        }

        const totalPractices = totalCheckIns + totalReflections + totalMicroResets;

        // Mindful encouraging microcopy
        let encouragement = "There's always room for one small reset.";
        if (totalPractices >= 4 || daysEngaged >= 4) {
          encouragement = "You're building a mindful rhythm.";
        } else if (daysEngaged >= 2) {
          encouragement = "Momentum builds one mindful moment at a time.";
        } else if (daysEngaged === 1) {
          encouragement = "Every mindful pause creates space for clarity.";
        }

        setWeeklyStreak(streakArray);
        setWeeklySummary({
          totalCheckIns,
          totalReflections,
          totalMicroResets,
          totalPractices,
          daysEngaged,
          days,
          encouragement
        });
      } catch (err) {
        console.error('Error calculating weekly practice summary:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.id, profile?.subscription_tier]);

  return { weeklyStreak, weeklySummary, recentShifts, subscriptionTier, checkedInToday, todayCheckIn, loading };
}
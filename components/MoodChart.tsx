"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MoodChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function getMoods() {
      const { data: sessions } = await supabase
        .from('sessions')
        .select('created_at, mood')
        .order('created_at', { ascending: true })
        .limit(7);

      if (sessions) {
        const formatted = sessions.map(s => ({
          date: new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          mood: s.mood
        }));
        setData(formatted);
      }
    }
    getMoods();
  }, []);

  return (
    <div className="h-[200px] w-full mt-4">
      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Grounding Trend (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} fontSize={10} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          <Line type="monotone" dataKey="mood" stroke="#00538e" strokeWidth={3} dot={{ fill: '#00538e', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
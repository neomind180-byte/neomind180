"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HistoryList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setSessions(data);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  if (loading) return <div className="animate-pulse text-slate-400 text-xs">Loading history...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Recent 180° Shifts</h3>
      {sessions.length === 0 ? (
        <p className="text-slate-400 text-sm italic">No shifts recorded yet. Start a check-in!</p>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#00538e] bg-[#00538e]/5 px-2 py-0.5 rounded-full">
                Mood: {session.mood}/10
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">
                {new Date(session.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
              "{session.neo_shift}"
            </p>
            <div className="pt-2 border-t border-slate-50">
              <p className="text-[9px] text-slate-400 uppercase font-black">Intention</p>
              <p className="text-[11px] text-slate-500">{session.intention}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
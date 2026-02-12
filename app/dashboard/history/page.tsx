"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Activity, Heart, Calendar, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Check-ins
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id);

      // 2. Fetch beEnough Shifts
      const { data: shifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id);

      // 3. Fetch Neo Reflections
      const { data: reflections } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id);

      // 4. Normalize & Merge
      const formattedCheckIns = (checkIns || []).map(item => ({
        id: item.id,
        type: 'check-in',
        date: new Date(item.created_at),
        data: item
      }));

      const formattedShifts = (shifts || []).map(item => ({
        id: item.id,
        type: 'shift',
        date: new Date(item.created_at),
        data: item
      }));

      const formattedReflections = (reflections || []).map(item => ({
        id: item.id,
        type: 'reflection',
        date: new Date(item.created_at),
        data: item
      }));

      // 5. Sort Descending (Newest First)
      const combined = [...formattedCheckIns, ...formattedShifts, ...formattedReflections].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setHistoryItems(combined);
      setLoading(false);
    }

    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400">Loading History...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        <header className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Your Journey</h1>
        </header>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-slate-200">
          {historyItems.map((item) => (
            <div key={item.id} className="relative flex items-start gap-8 group">

              {/* Timeline Icon */}
              <div className={`mt-2 w-10 h-10 rounded-2xl border-4 border-slate-50 flex items-center justify-center shrink-0 z-10 shadow-sm ${item.type === 'shift' ? 'bg-[#993366] text-white' :
                  item.type === 'reflection' ? 'bg-[#0AA390] text-white' : 'bg-white text-[#0AA390]'
                }`}>
                {item.type === 'shift' ? <Heart className="w-4 h-4" /> :
                  item.type === 'reflection' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
              </div>

              {/* Card Content */}
              <div className="flex-grow bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.type === 'shift' ? 'text-[#993366]' : 'text-[#0AA390]'
                    }`}>
                    {item.type === 'shift' ? 'Mindset Shift' :
                      item.type === 'reflection' ? 'Reflection with Neo' : 'Daily Check-In'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                    {item.date.toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {item.type === 'check-in' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {['Mind', 'Body', 'Energy'].map(k => (
                      <div key={k} className="bg-slate-50 px-3 py-2 rounded-xl">
                        <p className="text-[9px] uppercase text-slate-400 font-bold">{k}</p>
                        <p className="text-xs font-bold text-slate-700">{item.data[k.toLowerCase()]}</p>
                      </div>
                    ))}
                  </div>
                ) : item.type === 'reflection' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2 italic">
                      {item.data.last_message ? `"${item.data.last_message}"` : "Session started"}
                    </p>
                    {expandedId === item.id && (
                      <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 max-h-60 overflow-y-auto pr-2">
                        {item.data.messages.map((msg: any, mIdx: number) => (
                          <div key={mIdx} className={`p-3 rounded-2xl text-[11px] leading-relaxed ${msg.role === 'neo' ? 'bg-slate-50 text-slate-600' : 'bg-[#00538e] text-white'
                            }`}>
                            <span className="font-bold uppercase text-[8px] block mb-1 opacity-50">
                              {msg.role === 'neo' ? 'Neo' : 'You'}
                            </span>
                            {msg.content}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#0AA390] hover:opacity-70 transition-opacity"
                    >
                      {expandedId === item.id ? (
                        <><ChevronUp className="w-3 h-3" /> Hide Conversation</>
                      ) : (
                        <><ChevronDown className="w-3 h-3" /> View Full Conversation</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 italic">"{item.data.thought}"</p>
                    <div className="pl-4 border-l-2 border-[#993366]/20">
                      <p className="text-xs font-bold text-[#993366] uppercase tracking-widest mb-1">Shift:</p>
                      <p className="text-sm font-medium text-slate-800">{item.data.new_perspective}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
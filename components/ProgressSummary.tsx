"use client";

import { CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

export default function ProgressSummary() {
  // Mock data for the last 7 days (1 = completed, 0 = missed)
  const weeklyStreak = [1, 1, 0, 1, 1, 1, 1];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const recentShifts = [
    { day: 'Yesterday', mind: 'Clear', body: 'Calm' },
    { day: 'Saturday', mind: 'Balanced', body: 'Neutral' },
    { day: 'Friday', mind: 'Noisy', body: 'Tense' },
  ];

  return (
    <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Momentum</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">7-Day Clarity Streak</p>
        </div>
        <div className="bg-[#0AA390]/10 px-4 py-2 rounded-full flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-[#0AA390]" />
          <span className="text-[10px] font-black text-[#0AA390] uppercase tracking-widest">Active Shift</span>
        </div>
      </div>

      {/* 7-Day Dot Matrix */}
      <div className="flex justify-between items-center px-2">
        {weeklyStreak.map((completed, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <span className="text-[9px] font-black text-slate-300 uppercase">{days[i]}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              completed ? "bg-[#0AA390] text-white shadow-md shadow-[#0AA390]/20" : "bg-slate-50 text-slate-200"
            }`}>
              {completed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
            </div>
          </div>
        ))}
      </div>

      {/* Recent States List */}
      <div className="space-y-4 pt-4 border-t border-slate-50">
        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Recent States</h4>
        <div className="grid grid-cols-1 gap-3">
          {recentShifts.map((shift, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{shift.day}</span>
              <div className="flex gap-3">
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-white rounded-lg text-[#00538e] border border-slate-100">
                  Mind: {shift.mind}
                </span>
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-white rounded-lg text-[#0AA390] border border-slate-100">
                  Body: {shift.body}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
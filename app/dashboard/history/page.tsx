"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Filter, 
  Activity, 
  Zap,
  Download,
  BookOpen,
  Search
} from 'lucide-react';

interface CheckIn {
  mind: string;
  body: string;
  energy: string;
}

interface HistoryItem {
  id: number;
  date: string;
  time: string;
  type: 'Daily Check-in' | 'Mindset Shift' | 'Reflection';
  title?: string;
  insight?: string;
  status?: CheckIn;
  note?: string;
}

// Simulated data for the history log
const historyData: HistoryItem[] = [
  {
    id: 1,
    date: 'Oct 25, 2023',
    time: '09:00 AM',
    type: 'Daily Check-in',
    status: {
      mind: 'Clear',
      body: 'Calm',
      energy: 'Steady'
    },
    note: 'Started the day with intention.'
  },
  {
    id: 2,
    date: 'Oct 24, 2023',
    time: '04:30 PM',
    type: 'Mindset Shift',
    title: 'Perspective Flip',
    insight: 'Realized that my value is inherent, not based on today\'s output.',
  },
  {
    id: 3,
    date: 'Oct 23, 2023',
    time: '08:15 AM',
    type: 'Daily Check-in',
    status: {
      mind: 'Noisy',
      body: 'Tense',
      energy: 'Low'
    },
    note: 'Felt some resistance starting the week, but acknowledged it.'
  }
];

export default function ShiftHistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Shift History</h1>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-12">Tracking your 180° progress</p>
          </div>
          
          <div className="flex items-center gap-2 ml-12 md:ml-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-3 h-3" /> Export Log
            </button>
          </div>
        </header>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 ml-12 md:ml-0 no-scrollbar">
          {['All', 'Daily Check-in', 'Mindset Shift', 'Reflection'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                activeFilter === filter 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
              }`}
            >
              {filter === 'All' ? 'Everything' : filter}
            </button>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-slate-200">
          {historyData
            .filter(item => activeFilter === 'All' || item.type === activeFilter)
            .map((item) => (
            <div key={item.id} className="relative flex items-start gap-8 group">
              {/* Timeline Indicator */}
              <div className="mt-2 w-10 h-10 rounded-2xl border-4 border-slate-50 bg-white flex items-center justify-center shrink-0 z-10 shadow-sm transition-transform group-hover:scale-110">
                {item.type === 'Daily Check-in' ? (
                  <Activity className="w-4 h-4 text-emerald-500" />
                ) : item.type === 'Mindset Shift' ? (
                  <Zap className="w-4 h-4 text-amber-500" />
                ) : (
                  <BookOpen className="w-4 h-4 text-blue-500" />
                )}
              </div>

              {/* Data Card */}
              <div className="flex-grow bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                      {item.type}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">
                      {item.title || `${item.date} Entry`}
                    </h3>
                  </div>
                  <div className="md:text-right flex md:flex-col gap-3 md:gap-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.time}</p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>

                {/* Conditional Rendering based on Type */}
                {item.type === 'Daily Check-in' && item.status ? (
                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50">
                    {Object.entries(item.status).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">{key}</p>
                        <p className="text-xs font-bold text-slate-700">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                      "{item.insight}"
                    </p>
                  </div>
                )}

                {item.note && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <p className="text-xs text-slate-400 font-medium italic">{item.note}</p>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                  <button className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">
                    Expand Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center py-16 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Rethink. Rewire. Renew.
          </p>
        </footer>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CheckIn() {
  const router = useRouter();
  const [mood, setMood] = useState(5);
  const [feeling, setFeeling] = useState('');
  const [intention, setIntention] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    }
    checkUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    // 1. Get User ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Send to our new API Route (The Brain)
    const response = await fetch('/api/generate-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        mood,
        feeling,
        intention
      })
    });

    const data = await response.json();

    if (data.success) {
      // 3. Show Success and Redirect
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 1500);
    } else {
      alert("Something went wrong with the AI coach.");
      setStatus('idle');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Daily Check-in</h1>
        
        {status === 'loading' ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-slate-600 font-medium">Analyzing your mindset...</p>
            <p className="text-sm text-slate-400">Consulting the AI Coach</p>
          </div>
        ) : status === 'success' ? (
          <div className="py-20 text-center">
             <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
             </div>
             <p className="text-lg text-slate-800 font-medium">Check-in Complete</p>
          </div>
        ) : (
          <>
            <p className="text-slate-500 mb-6">Take a breath. Be honest with yourself.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How grounded do you feel? (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm">Chaos</span>
                  <input 
                    type="range" min="1" max="10" value={mood} 
                    onChange={(e) => setMood(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-slate-400 text-sm">Clarity</span>
                </div>
                <div className="text-center font-bold text-indigo-600 mt-2">{mood}/10</div>
              </div>

              {/* Feeling */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What is occupying your mind?</label>
                <textarea 
                  required rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  placeholder="I am feeling overwhelmed because..."
                  value={feeling} onChange={(e) => setFeeling(e.target.value)}
                />
              </div>

              {/* Intention */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">One small intention for today?</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="I will focus on..."
                  value={intention} onChange={(e) => setIntention(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => router.back()} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition">Cancel</button>
                <button 
  type="submit" 
  disabled={status === 'loading'} 
  className={`flex-1 px-4 py-3 rounded-lg font-medium transition text-white ${
    status === 'loading' 
      ? 'bg-indigo-400 cursor-not-allowed' 
      : 'bg-indigo-600 hover:bg-indigo-700'
  }`}
>
  {status === 'loading' ? "Neo is thinking..." : "Get Coaching"}
</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
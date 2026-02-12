"use client";

import { useState, useEffect } from 'react';
import { Send, Zap, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// --- CONFIGURATION ---
const MAX_MESSAGES = {
  free: 0,
  tier2: 8,
  tier3: 16
};

export default function ReflectionPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    async function getTier() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (data) setUserTier(data.subscription_tier);
      }
    }
    getTier();
  }, []);

  // Calculate current usage (divide by 2 if you only count user messages, or strict count)
  // Here we count every USER message sent.
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const limit = MAX_MESSAGES[userTier as keyof typeof MAX_MESSAGES];
  const isLimitReached = userMessageCount >= limit;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLimitReached) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Backend API
    try {
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error("Reflection Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header with Limit Counter */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-t-[2.5rem]">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#0AA390]" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            {userTier === 'tier2' ? 'Coaching Access' : 'Deep Coaching'}
          </span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
          {userMessageCount}/{limit} messages today
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-[#00538e] text-white rounded-tr-none'
              : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-slate-300 animate-pulse pl-4">Neo is thinking...</div>}
      </div>

      {/* Input Area or Limit Reached Message */}
      <div className="p-6 border-t border-slate-50">
        {!isLimitReached ? (
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your reflection..."
              className="w-full pl-6 pr-14 py-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#00538e]/10 text-sm font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00538e] text-white rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 p-6 rounded-2xl text-center space-y-3 border border-slate-100">
            <Lock className="w-6 h-6 text-[#993366] mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Daily Limit Reached</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You've hit your {limit}-message limit for today.
              {userTier === 'tier2' && " Upgrade to Tier 3 for deeper exploration."}
            </p>
            {userTier === 'tier2' && (
              <button className="text-[10px] font-black uppercase tracking-widest text-[#00538e] hover:underline">
                Upgrade to Tier 3
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
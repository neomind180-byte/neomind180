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
  const [reflectionId, setReflectionId] = useState<string | null>(null);

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

  // Calculate current usage
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const limit = MAX_MESSAGES[userTier as keyof typeof MAX_MESSAGES];
  const isLimitReached = userMessageCount >= limit;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLimitReached) return;

    const userMsg = { role: 'user', content: input };
    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Call AI API
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();
      const finalMessages = [...updatedMessagesWithUser, data];
      setMessages(finalMessages);

      // 2. Persist to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (!reflectionId) {
          // New session: Insert
          const { data: newRef, error } = await supabase
            .from('reflections')
            .insert({
              user_id: user.id,
              messages: finalMessages,
              last_message: data.content
            })
            .select()
            .single();

          if (newRef) setReflectionId(newRef.id);
          if (error) console.error("Error saving new reflection:", error);
        } else {
          // Existing session: Update
          const { error } = await supabase
            .from('reflections')
            .update({
              messages: finalMessages,
              last_message: data.content
            })
            .eq('id', reflectionId);

          if (error) console.error("Error updating reflection:", error);
        }
      }
    } catch (error) {
      console.error("Reflection Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#1a1f2e]">
      {/* Header with Limit Counter */}
      <div className="flex items-center justify-between px-8 py-5 bg-[#232938] rounded-t-[2.5rem] border border-[#2d3548] border-b-0">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#0AA390]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#94a3b8]">
            {userTier === 'tier2' ? 'Coaching Access' : 'Deep Coaching'}
          </span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
          {userMessageCount}/{limit} messages today
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-8 space-y-6 border-x border-[#2d3548] bg-[#232938]/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-[#00538e] text-white rounded-tr-none shadow-lg shadow-[#00538e]/10'
              : 'bg-[#1a1f2e] text-[#cbd5e1] rounded-tl-none border border-[#2d3548]'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[10px] text-[#475569] font-black uppercase tracking-widest animate-pulse pl-4">Neo is observing...</div>}
      </div>

      {/* Input Area or Limit Reached Message */}
      <div className="p-8 bg-[#232938] rounded-b-[2.5rem] border border-[#2d3548] border-t-0">
        {!isLimitReached ? (
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your reflection..."
              className="w-full pl-8 pr-16 py-5 bg-[#1a1f2e] border border-[#2d3548] text-white rounded-2xl outline-none focus:border-[#00538e] transition-all text-sm font-medium placeholder:text-[#475569]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#00538e] text-white rounded-xl shadow-lg shadow-[#00538e]/20 disabled:opacity-50 transition-all hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="bg-[#1a1f2e] p-8 rounded-3xl text-center space-y-4 border border-[#2d3548]">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <Lock className="w-6 h-6 text-[#993366]" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Daily Limit Reached</h3>
            <p className="text-xs text-[#94a3b8] max-w-xs mx-auto leading-relaxed">
              You've hit your {limit}-message limit for today.
              {userTier === 'tier2' && " Practice your observations and return tomorrow for more."}
            </p>
            {userTier === 'tier2' && (
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00538e] hover:text-[#0AA390] transition-colors mt-2">
                Upgrade to Tier 3
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
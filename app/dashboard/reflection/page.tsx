"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Zap, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// --- CONFIGURATION ---
const MAX_MESSAGES = {
  free: 10,
  starter: 30,
  builder: 1000,
  catalyst: 1000
};

export default function ReflectionPage() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const [todayUsage, setTodayUsage] = useState(0);

  useEffect(() => {
    async function initData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Get Tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        if (profile) setUserTier(profile.subscription_tier);

        // 2. Get Today's Usage (excluding current session)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: dailyRefs } = await supabase
          .from('reflections')
          .select('messages')
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString());

        if (dailyRefs) {
          let count = 0;
          dailyRefs.forEach(ref => {
            const userMsgs = (ref.messages as any[] || []).filter(m => m.role === 'user').length;
            count += userMsgs;
          });
          setTodayUsage(count);
        }
      }
    }
    initData();
  }, []);

  // Calculate usage
  const sessionUserCount = messages.filter(m => m.role === 'user').length;
  const totalDailyCount = todayUsage + sessionUserCount;
  const limit = MAX_MESSAGES[userTier as keyof typeof MAX_MESSAGES] || 10;
  const isLimitReached = totalDailyCount >= limit;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || (isLimitReached && limit < 1000)) return;

    const userMsg = { role: 'user', content: input };
    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Get Auth Token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 2. Call AI API
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();

      if (res.status === 429 || data.limitReached) {
        alert(data.content);
        return;
      }

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

  const profilePlanName = (tier: string) => {
    switch (tier) {
      case 'starter': return 'Clarity Starter';
      case 'builder': return 'Confidence Builder';
      case 'catalyst': return 'Compassion Catalyst';
      default: return 'Clarity Foundation';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[var(--bg-primary)]">
      {/* Header with Limit Counter */}
      <div className="flex items-center justify-between px-8 py-5 bg-[var(--bg-card)] rounded-t-[2.5rem] border border-[var(--border)] border-b-0">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#0AA390]" />
          <span className="text-[14px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            {profilePlanName(userTier)}
          </span>
        </div>
        <div className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">
          {limit >= 1000 ? 'Deep Journey Sessions' : `Today: ${totalDailyCount}/${limit} sessions`}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-8 space-y-6 border-x border-[var(--border)] bg-[var(--bg-card)]/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-2xl text-base leading-relaxed ${msg.role === 'user'
              ? 'bg-[#00538e] text-white rounded-tr-none shadow-lg shadow-[#00538e]/10'
              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-tl-none border border-[var(--border)]'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[12px] text-[var(--text-dim)] font-black uppercase tracking-widest animate-pulse pl-4">Neo is observing...</div>}
      </div>

      {/* Input Area or Limit Reached Message */}
      <div className="p-8 bg-[var(--bg-card)] rounded-b-[2.5rem] border border-[var(--border)] border-t-0">
        {!isLimitReached || limit >= 1000 ? (
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your reflection..."
              className="w-full pl-8 pr-16 py-5 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-2xl outline-none focus:border-[#00538e] transition-all text-base font-medium placeholder:text-[var(--text-dim)]"
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
          <div className="bg-[var(--bg-primary)] p-8 rounded-3xl text-center space-y-4 border border-[var(--border)]">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <Lock className="w-6 h-6 text-[#993366]" />
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">Daily Limit Reached</h3>
            <p className="text-[14px] text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
              You've hit your {limit} reflections limit for today.
              {limit < 1000 && " Practice your observations and return tomorrow for more."}
            </p>
            {limit < 1000 && (
              <Link href="/pricing" className="inline-block text-[12px] font-black uppercase tracking-[0.2em] text-[#00538e] hover:text-[#0AA390] transition-colors mt-2">
                Upgrade for More Access →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
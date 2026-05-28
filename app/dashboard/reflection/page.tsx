"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Zap, Lock, Sparkles, Mic, MicOff, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export default function ReflectionPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const hasResumedRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [supportSpeech, setSupportSpeech] = useState(false);
  const baselineTextRef = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupportSpeech(true);
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        setRecognition(rec);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      baselineTextRef.current = input;
      
      recognition.onresult = (event: any) => {
        let fullSessionTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullSessionTranscript += event.results[i][0].transcript;
        }
        
        const space = baselineTextRef.current && !baselineTextRef.current.endsWith(' ') ? ' ' : '';
        setInput(baselineTextRef.current + space + fullSessionTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser settings to use speech input.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Time-Based Limits states
  const [dailyChatTime, setDailyChatTime] = useState(0);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('/api/reflection', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDailyChatTime(data.dailyChatTime);
        setTimeLimit(data.limit);
        setIsLimitReached(data.isLimitReached);
        setIsTrialExpired(data.isTrialExpired);
        setLimitMessage(data.limitMessage);
        if (data.tier) setUserTier(data.tier);
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const downloadCurrentSession = () => {
    if (messages.length <= 1) {
      alert("No conversation history in this session to download.");
      return;
    }

    let markdown = `# NeoMind180 Guided AI Reflection Session\n`;
    markdown += `Date: ${new Date().toLocaleDateString()}\n`;
    markdown += `Plan Tier: ${userTier === 'free' ? '7-Day Free Trial' : 'Full Plan'}\n\n`;
    markdown += `==================================================\n\n`;

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'USER' : 'NEO';
      markdown += `### [${role}] (${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'N/A'})\n${msg.content || msg.text || ''}\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NeoMind180_Session_${reflectionId || 'new'}_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    async function initData() {
      if (user) {
        // 1. Get Initial Tier
        if (profile) setUserTier(profile.subscription_tier);

        // 2. Fetch Time-Based limits status
        await fetchStatus();

        // Fetch past sessions for the history dropdown
        const { data: allRefs } = await supabase
          .from('reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (allRefs) {
          setPastSessions(allRefs);
        }

        // 3. Auto-resume the most recent reflection session ONCE on mount
        if (!hasResumedRef.current) {
          const latestRef = allRefs && allRefs.length > 0 ? allRefs[0] : null;

          if (latestRef) {
            setReflectionId(latestRef.id);
            if (latestRef.messages && latestRef.messages.length > 0) {
              setMessages(latestRef.messages);
            }
          } else {
            // Restore clean state if database has no history
            setReflectionId(null);
            setMessages([
              { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
            ]);
          }
          hasResumedRef.current = true;
        } else {
          // If already initialized once, but history was cleared/purged under Settings
          if (!allRefs || allRefs.length === 0) {
            setReflectionId(null);
            setMessages([
              { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
            ]);
          }
        }
      }
    }
    initData();
  }, [user, profile]);

  const startNewSession = () => {
    setMessages([
      { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
    ]);
    setReflectionId(null);
  };

  const handleSelectSession = (id: string) => {
    if (id === "") {
      startNewSession();
      return;
    }
    const selected = pastSessions.find(s => s.id === id);
    if (selected) {
      setReflectionId(selected.id);
      if (selected.messages && selected.messages.length > 0) {
        setMessages(selected.messages);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLimitReached || isTrialExpired) return;

    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    // Attach local client timestamp to help calculate active chat time correctly
    const userMsg = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    };
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
        setIsLimitReached(true);
        setLimitMessage(data.content);
        return;
      }

      if (res.status === 403 || data.trialExpired) {
        setIsTrialExpired(true);
        setLimitMessage(data.content);
        return;
      }

      const finalMessages = [...updatedMessagesWithUser, {
        ...data,
        timestamp: new Date().toISOString()
      }];
      setMessages(finalMessages);

      // 3. Persist to Supabase
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

          if (newRef) {
            setReflectionId(newRef.id);
            setPastSessions(prev => [newRef, ...prev]);
          }
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

          if (error) {
            console.error("Error updating reflection:", error);
          } else {
            // Update pastSessions array in state
            setPastSessions(prev =>
              prev.map(s =>
                s.id === reflectionId
                  ? { ...s, messages: finalMessages, last_message: data.content, updated_at: new Date().toISOString() }
                  : s
              )
            );
          }
        }
      }

      // 4. Refresh limits status from server
      await fetchStatus();

    } catch (error) {
      console.error("Reflection Error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const profilePlanName = (tier: string) => {
    return tier === 'free' ? '7-Day Free Trial' : 'Full Plan';
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
        <div className="flex items-center gap-4">
          <div className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] mr-2 hidden md:block">
            {dailyChatTime}m / {timeLimit}m Daily Limit
          </div>
          {/* History Dropdown */}
          <select
            value={reflectionId || ''}
            onChange={(e) => handleSelectSession(e.target.value)}
            className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest rounded-xl focus:border-[#0AA390] outline-none transition-all cursor-pointer max-w-[200px] truncate"
          >
            <option value="">
              {reflectionId ? "📜 Reflection History..." : "✨ Active Session"}
            </option>
            {pastSessions.map((session) => {
              const dateStr = new Date(session.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              });
              const summary = session.last_message || 'Empty session';
              const truncatedSummary = summary.length > 25 ? `${summary.substring(0, 25)}...` : summary;
              return (
                <option key={session.id} value={session.id}>
                  {dateStr} - {truncatedSummary}
                </option>
              );
            })}
          </select>
          <button
            onClick={downloadCurrentSession}
            disabled={messages.length <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-[#00538e]/10 hover:bg-[#00538e]/25 text-[#00538e] font-black uppercase text-[10px] tracking-widest rounded-xl border border-[#00538e]/20 transition-all cursor-pointer disabled:opacity-30"
            title="Download this conversation session"
          >
            <Download className="w-3.5 h-3.5" />
            Export Session
          </button>
          <button
            onClick={startNewSession}
            className="flex items-center gap-2 px-4 py-2 bg-[#0AA390]/10 hover:bg-[#0AA390]/25 text-[#0AA390] font-black uppercase text-[10px] tracking-widest rounded-xl border border-[#0AA390]/20 transition-all cursor-pointer"
            title="Start a fresh reflection session"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Session
          </button>
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
        <div ref={chatEndRef} />
      </div>

      {/* Input Area or Limit Reached Message */}
      <div className="p-8 bg-[var(--bg-card)] rounded-b-[2.5rem] border border-[var(--border)] border-t-0">
        {isTrialExpired ? (
          <div className="bg-[var(--bg-primary)] p-8 rounded-3xl text-center space-y-4 border border-[var(--border)]">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
              <Lock className="w-6 h-6 text-[#F39904]" />
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">Free Trial Expired</h3>
            <p className="text-[14px] text-[var(--text-muted)] max-w-md mx-auto leading-relaxed whitespace-pre-line">
              {limitMessage || "Your 7-day free trial of Neo Reflections has expired. You can still use your self-help tools, journaling, and daily check-in anytime."}
            </p>
            <div className="pt-2">
              <Link href="/pricing" className="inline-block px-8 py-4 bg-[#00538e] hover:bg-[#0AA390] text-white rounded-xl font-black uppercase text-[12px] tracking-[0.2em] transition-colors shadow-lg">
                Subscribe to Full Plan
              </Link>
            </div>
          </div>
        ) : isLimitReached ? (
          <div className="bg-[var(--bg-primary)] p-8 rounded-3xl text-center space-y-4 border border-[var(--border)]">
            <div className="w-12 h-12 bg-[#0AA390]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#0AA390]/20">
              <Sparkles className="w-6 h-6 text-[#0AA390]" />
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">Daily Reflection Completed</h3>
            <p className="text-[14px] text-[var(--text-muted)] max-w-md mx-auto leading-relaxed whitespace-pre-line">
              {limitMessage || "You’ve completed your reflection time for today. Your next window opens tomorrow.\n\nYou can still use your self-help tools, journaling, and daily check-in anytime."}
            </p>
            {userTier === 'free' && (
              <div className="pt-2">
                <Link href="/pricing" className="inline-block px-8 py-4 bg-[#00538e] hover:bg-[#0AA390] text-white rounded-xl font-black uppercase text-[12px] tracking-[0.2em] transition-colors shadow-lg">
                  Subscribe for More Time
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... speak clearly" : "Share your reflection..."}
              className={`w-full pl-8 ${supportSpeech ? 'pr-[110px]' : 'pr-16'} py-5 bg-[var(--bg-primary)] border text-[var(--text-primary)] rounded-2xl outline-none transition-all text-base font-medium placeholder:text-[var(--text-dim)] ${
                isListening ? 'border-[#0AA390] ring-1 ring-[#0AA390]/30 shadow-md shadow-[#0AA390]/10' : 'border-[var(--border)] focus:border-[#00538e]'
              }`}
            />
            {supportSpeech && (
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-[58px] top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-transparent text-[var(--text-muted)] hover:text-[#0AA390] hover:bg-[#0AA390]/10'
                }`}
                title={isListening ? "Stop listening" : "Use voice input"}
              >
                {isListening && (
                  <span className="absolute -inset-1 rounded-xl bg-rose-500/30 animate-ping pointer-events-none" />
                )}
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#00538e] text-white rounded-xl shadow-lg shadow-[#00538e]/20 disabled:opacity-50 transition-all hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
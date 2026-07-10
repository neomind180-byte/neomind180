"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, Zap, Lock, Sparkles, Mic, MicOff, Download, CheckCircle, RefreshCw, X, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { appLogger } from '@/lib/logger';

interface ChatMessage {
  role: string;
  content: string;
  summary?: string[];
  checkInQuestions?: string[];
}

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

  // Growth Completion & Tailored Check-In states
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<string[]>([]);
  const [lastSessionCheckIns, setLastSessionCheckIns] = useState<string[]>([]);
  const [hasCompletion, setHasCompletion] = useState(false);

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        appLogger.warn('reflection_no_token', 'No auth token available for status fetch');
        return;
      }

      const res = await fetch('/api/reflection', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal,
      });

      if (res.status === 401) {
        appLogger.warn('reflection_auth_expired', 'Auth token expired during status fetch');
        // Try to refresh the session silently
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          appLogger.error('reflection_refresh_failed', 'Session refresh failed after 401');
        }
        return;
      }

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
      if ((err as Error).name === 'AbortError') {
        appLogger.warn('reflection_status_timeout', 'Status fetch timed out after 10s');
      } else {
        console.error("Error fetching status:", err);
      }
    } finally {
      clearTimeout(timeout);
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
          // Extract last completed session check-ins to show quick-start pills
          const foundQuestions = findLastSessionCheckIns(allRefs);
          setLastSessionCheckIns(foundQuestions);
        }

        // 3. Auto-resume the most recent reflection session ONCE on mount
        if (!hasResumedRef.current) {
          const latestRef = allRefs && allRefs.length > 0 ? allRefs[0] : null;

          if (latestRef) {
            setReflectionId(latestRef.id);
            if (latestRef.messages && latestRef.messages.length > 0) {
              setMessages(latestRef.messages);
              checkCompletionStatus(latestRef.messages);
            }
          } else {
            // Restore clean state if database has no history
            setReflectionId(null);
            setMessages([
              { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
            ]);
            setHasCompletion(false);
          }
          hasResumedRef.current = true;
        } else {
          // If already initialized once, but history was cleared/purged under Settings
          if (!allRefs || allRefs.length === 0) {
            setReflectionId(null);
            setMessages([
              { role: 'neo', content: "Hello. I’ve been observing your shifts. Ready to reflect?" }
            ]);
            setHasCompletion(false);
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
    setShowCompletionCard(false);
    setHasCompletion(false);
    fetchStatus();
  };

  const checkCompletionStatus = (msgs: ChatMessage[]) => {
    const completionMsg = msgs.find((m: ChatMessage) => m.role === 'session_completion');
    if (completionMsg) {
      setCompletionSummary(completionMsg.summary || []);
      setHasCompletion(true);
    } else {
      setCompletionSummary([]);
      setHasCompletion(false);
    }
  };

  const findLastSessionCheckIns = (sessionsList: { messages: ChatMessage[] }[]) => {
    for (const session of sessionsList) {
      if (session.messages && Array.isArray(session.messages)) {
        const completionMsg = session.messages.find((m: ChatMessage) => m.role === 'session_completion');
        if (completionMsg && completionMsg.checkInQuestions && Array.isArray(completionMsg.checkInQuestions)) {
          return completionMsg.checkInQuestions;
        }
      }
    }
    return [];
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
        checkCompletionStatus(selected.messages);
      } else {
        setHasCompletion(false);
      }
    }
  };

  const handleSelectCheckInPrompt = (promptText: string) => {
    handleSend(undefined, promptText);
  };

  const completeCurrentSession = async () => {
    if (!reflectionId || isCompleting) return;
    setIsCompleting(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 seconds

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/reflection/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reflectionId: reflectionId,
          history: messages
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setCompletionSummary(data.summary || []);
        setLastSessionCheckIns(data.checkInQuestions || []);
        setShowCompletionCard(true);
        setHasCompletion(true);
        
        const completionMsg = {
          role: 'session_completion',
          content: 'Session Completed',
          summary: data.summary,
          checkInQuestions: data.checkInQuestions,
          timestamp: data.timestamp || new Date().toISOString()
        };
        
        setMessages(prev => {
          const filtered = prev.filter(m => m.role !== 'session_completion');
          return [...filtered, completionMsg];
        });

        setPastSessions(prev =>
          prev.map(s =>
            s.id === reflectionId
              ? {
                  ...s,
                  messages: [...s.messages.filter((m: ChatMessage) => m.role !== 'session_completion'), completionMsg],
                  last_message: "Session Completed",
                  updated_at: new Date().toISOString()
                }
              : s
          )
        );
      } else {
        const err = await res.json();
        alert(`Could not complete session: ${err.message || 'Error occurred'}`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Error completing session:", err);
      alert("A connection error occurred while trying to complete the session.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSend = async (e?: React.FormEvent, directInput?: string) => {
    if (e) e.preventDefault();
    const messageText = directInput !== undefined ? directInput : input;
    if (!messageText.trim() || isLimitReached || isTrialExpired) return;

    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }

    // Attach local client timestamp to help calculate active chat time correctly
    const userMsg = { 
      role: 'user', 
      content: messageText,
      timestamp: new Date().toISOString()
    };
    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    setInput('');
    setIsTyping(true);

    const interruptionOptions = [
      "Looks like I lost the thread for a moment. I’m still here — please continue.",
      "I hit a temporary interruption while following your thought. Try sending that again.",
      "I lost connection to the flow of our conversation for a moment. Please resend your last message.",
      "Something interrupted my response mid-thought. Go ahead and send that again.",
      "I momentarily lost the conversational thread. I’m ready to continue.",
      "Looks like our conversation got briefly interrupted. Please continue from your last thought."
    ];

    let activeReflectionId = reflectionId;

    // 1. Immediately save the user message to Supabase
    if (user) {
      try {
        if (!activeReflectionId) {
          // New session: Insert user message (must await to get the new reflection ID)
          const { data: newRef, error } = await supabase
            .from('reflections')
            .insert({
              user_id: user.id,
              messages: updatedMessagesWithUser,
              last_message: messageText
            })
            .select()
            .single();

          if (newRef) {
            activeReflectionId = newRef.id;
            setReflectionId(newRef.id);
            setPastSessions(prev => [newRef, ...prev]);
          }
          if (error) console.error("Error saving new reflection user message:", error);
        } else {
          // Existing session: Update user message in the background (non-blocking)
          (async () => {
            try {
              const { error } = await supabase
                .from('reflections')
                .update({
                  messages: updatedMessagesWithUser,
                  last_message: messageText
                })
                .eq('id', activeReflectionId);

              if (error) {
                console.error("Error updating reflection user message:", error);
              } else {
                setPastSessions(prev =>
                  prev.map(s =>
                    s.id === activeReflectionId
                      ? { ...s, messages: updatedMessagesWithUser, last_message: messageText, updated_at: new Date().toISOString() }
                      : s
                  )
                );
              }
            } catch (dbErr) {
              console.error("Failed to save user message to database:", dbErr);
            }
          })();
        }
      } catch (dbErr) {
        console.error("Failed to save user message to database:", dbErr);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 seconds client timeout

    try {
      // 2. Get Auth Token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 3. Call AI API
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText, history: messages }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.status === 401) {
        appLogger.error('reflection_send_auth_expired', 'Auth expired during reflection send');
        const { data: refreshData } = await supabase.auth.refreshSession();
        const errorContent = "My connection refreshed. Please try sending your message again.";
        const errorMsg = {
          role: 'neo',
          content: errorContent,
          timestamp: new Date().toISOString()
        };
        const finalMessages = [...updatedMessagesWithUser, errorMsg];
        setMessages(finalMessages);
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { content: 'I encountered an unexpected response. Please try again.' };
      }

      if (!res.ok) {
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

        // For other server errors (like 500 API errors), append the returned or a local fallback interruption message
        const errorContent = data?.content || interruptionOptions[Math.floor(Math.random() * interruptionOptions.length)];
        const errorMsg = {
          role: 'neo',
          content: errorContent,
          timestamp: new Date().toISOString()
        };
        const finalMessages = [...updatedMessagesWithUser, errorMsg];
        setMessages(finalMessages);

        if (user && activeReflectionId) {
          (async () => {
            try {
              const { error } = await supabase
                .from('reflections')
                .update({
                  messages: finalMessages,
                  last_message: errorContent
                })
                .eq('id', activeReflectionId);

              if (error) {
                console.error("Error saving fallback message to DB:", error);
              } else {
                setPastSessions(prev =>
                  prev.map(s =>
                    s.id === activeReflectionId
                      ? { ...s, messages: finalMessages, last_message: errorContent, updated_at: new Date().toISOString() }
                      : s
                  )
                );
              }
            } catch (dbErr) {
              console.error("Failed to save fallback message to DB:", dbErr);
            }
          })();
        }
        return;
      }

      const finalMessages = [...updatedMessagesWithUser, {
        ...data,
        timestamp: new Date().toISOString()
      }];
      setMessages(finalMessages);

      // 4. Update the DB with the received AI response in the background (non-blocking)
      if (user && activeReflectionId) {
        (async () => {
          try {
            const { error } = await supabase
              .from('reflections')
              .update({
                messages: finalMessages,
                last_message: data.content
              })
              .eq('id', activeReflectionId);

            if (error) {
              console.error("Error updating reflection with AI response:", error);
            } else {
              setPastSessions(prev =>
                prev.map(s =>
                  s.id === activeReflectionId
                    ? { ...s, messages: finalMessages, last_message: data.content, updated_at: new Date().toISOString() }
                    : s
                )
              );
            }
          } catch (dbErr) {
            console.error("Failed to save AI response to database:", dbErr);
          }
        })();
      }

      // 5. Refresh limits status from server
      try {
        await fetchStatus();
      } catch (statusErr) {
        console.error("Non-critical status refresh failed:", statusErr);
      }

    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Reflection Error", error);
      // Hard network failure (offline / timeouts): append local fallback interruption message
      const fallbackMessage = interruptionOptions[Math.floor(Math.random() * interruptionOptions.length)];
      const errorMsg = {
        role: 'neo',
        content: fallbackMessage,
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...updatedMessagesWithUser, errorMsg];
      setMessages(finalMessages);

      if (user && activeReflectionId) {
        (async () => {
          try {
            const { error } = await supabase
              .from('reflections')
              .update({
                messages: finalMessages,
                last_message: fallbackMessage
              })
              .eq('id', activeReflectionId);

            if (error) {
              console.error("Error saving offline interruption message to DB:", error);
            } else {
              setPastSessions(prev =>
                prev.map(s =>
                  s.id === activeReflectionId
                    ? { ...s, messages: finalMessages, last_message: fallbackMessage, updated_at: new Date().toISOString() }
                    : s
                )
              );
            }
          } catch (dbErr) {
            console.error("Failed to save offline interruption message to DB:", dbErr);
          }
        })();
      }
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

          {/* Complete Session Action Button */}
          {reflectionId && !hasCompletion && (
            <button
              onClick={completeCurrentSession}
              disabled={messages.filter(m => m.role === 'user').length === 0 || isCompleting}
              className="flex items-center gap-2 px-4 py-2 bg-[#8E44AD]/10 hover:bg-[#8E44AD]/25 text-[#8E44AD] font-black uppercase text-[10px] tracking-widest rounded-xl border border-[#8E44AD]/20 transition-all cursor-pointer disabled:opacity-30"
              title="Complete this session and generate a background summary and check-in prompts"
            >
              {isCompleting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              Complete Session
            </button>
          )}

          {/* View Summary Action Button */}
          {hasCompletion && (
            <button
              onClick={() => setShowCompletionCard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#8E44AD]/10 hover:bg-[#8E44AD]/25 text-[#8E44AD] font-black uppercase text-[10px] tracking-widest rounded-xl border border-[#8E44AD]/20 transition-all cursor-pointer"
              title="View the growth summary for this session"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Summary
            </button>
          )}

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
        {messages
          .filter((msg: ChatMessage) => msg.role === 'user' || msg.role === 'neo')
          .map((msg: ChatMessage, idx: number) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-2xl text-base leading-relaxed ${msg.role === 'user'
                ? 'bg-[#00538e] text-white rounded-tr-none shadow-lg shadow-[#00538e]/10'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-tl-none border border-[var(--border)]'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}

        {/* Somatic / Mind / Action tailored Socratic check-in pills */}
        {!messages.some((msg: ChatMessage) => msg.role === 'user') && lastSessionCheckIns.length > 0 && (
          <div className="flex flex-col gap-3 pl-4 max-w-[85%] animate-fade-in pb-4">
            <span className="text-[12px] font-black uppercase tracking-widest text-[#0AA390] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tailored Socratic Check-Ins
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lastSessionCheckIns.map((q, qIdx) => {
                const colors = [
                  { bg: 'bg-[#0AA390]/5 hover:bg-[#0AA390]/15', border: 'border-[#0AA390]/25 focus:border-[#0AA390]', text: 'text-[#0AA390]', label: 'Somatic (Body)' },
                  { bg: 'bg-[#8E44AD]/5 hover:bg-[#8E44AD]/15', border: 'border-[#8E44AD]/25 focus:border-[#8E44AD]', text: 'text-[#8E44AD]', label: 'Insight (Mind)' },
                  { bg: 'bg-[#00538e]/5 hover:bg-[#00538e]/15', border: 'border-[#00538e]/25 focus:border-[#00538e]', text: 'text-[#00538e]', label: 'Action (Movement)' }
                ];
                const col = colors[qIdx % 3];
                return (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => handleSelectCheckInPrompt(q)}
                    className={`flex flex-col text-left p-4 rounded-xl border ${col.bg} ${col.border} transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-wider ${col.text} mb-1`}>
                      {col.label}
                    </span>
                    <span className="text-[13px] text-[var(--text-secondary)] font-medium leading-normal">
                      &quot;{q}&quot;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

      {/* Session Completed Growth Summary Overlay Modal */}
      {showCompletionCard && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] max-w-lg w-full rounded-3xl p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowCompletionCard(false)}
              className="absolute right-6 top-6 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--bg-primary)] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#8E44AD]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#8E44AD]/25 text-[#8E44AD] shadow-lg shadow-[#8E44AD]/5">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter pt-2">
                Session Complete
              </h2>
              <p className="text-[12px] font-black uppercase tracking-widest text-[#0AA390]">
                Your Growth Insights
              </p>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border)] p-6 rounded-2xl space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                SUMMARY & INSIGHTS
              </span>
              <ul className="space-y-3">
                {completionSummary.length > 0 ? (
                  completionSummary.map((bullet, bIdx) => {
                    const parts = bullet.split(':');
                    const title = parts[0];
                    const desc = parts.slice(1).join(':');
                    return (
                      <li key={bIdx} className="text-[14px] leading-relaxed text-[var(--text-secondary)] font-medium flex items-start gap-2 text-left">
                        <span className="text-[#8E44AD] mt-1.5 font-bold">•</span>
                        <span>
                          <strong className="text-[var(--text-primary)]">{title}:</strong>{desc}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm text-[var(--text-muted)] italic">No summary generated. Start typing to reflect.</li>
                )}
              </ul>
            </div>

            <div className="bg-[#8E44AD]/5 border border-[#8E44AD]/10 p-5 rounded-2xl space-y-2 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8E44AD] block">
                What&apos;s Next
              </span>
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed font-medium">
                Neo has generated 3 tailored Socratic check-ins to reopen this thread. They will be waiting as quick-start suggestions in your next session.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCompletionCard(false)}
                className="flex-1 py-4 bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] rounded-xl font-black uppercase text-[11px] tracking-widest transition-colors cursor-pointer"
              >
                Review Current Chat
              </button>
              <button
                onClick={() => {
                  setShowCompletionCard(false);
                  startNewSession();
                }}
                className="flex-1 py-4 bg-[#8E44AD] hover:bg-[#7D3C98] text-white rounded-xl font-black uppercase text-[11px] tracking-widest transition-colors cursor-pointer shadow-lg shadow-[#8E44AD]/20 flex items-center justify-center gap-2"
              >
                Start New Session
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
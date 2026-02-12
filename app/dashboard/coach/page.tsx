"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Clock,
  User,
  ShieldCheck,
  Info,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function AskTheCoachPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile({ ...profile, email: user.email });

        // Load Message History
        const { data: history } = await supabase
          .from('coach_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setMessages(history || []);
        setLoadingHistory(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to send a message");

      const { data: newMessage, error: insertError } = await supabase
        .from('coach_messages')
        .insert({
          user_id: user.id,
          user_name: userProfile?.full_name || 'Anonymous',
          user_email: user.email,
          subject: subject.trim(),
          message: message.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // SUCCESS! Update UI immediately
      setMessages([newMessage, ...messages]);
      setSuccess(true);
      setMessage('');
      setSubject('');

      // Get the session to pass the JWT to our API for verification
      const { data: { session } } = await supabase.auth.getSession();

      // Notify the coach via our internal API (runs in the background)
      fetch('/api/notify-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          user_name: userProfile?.full_name || 'Anonymous',
          subject: subject.trim(),
          message: message.trim()
        })
      }).catch(err => console.error("Background notification error:", err));

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Header [cite: 27-38] */}
      <header className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-[#00538e]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00538e]/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#00538e]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#00538e] uppercase tracking-tighter">Ask-the-Coach</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Support Channel</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#0AA390]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#0AA390]">
          <ShieldCheck className="w-3 h-3" /> Tier 2/3 Secure
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-12 space-y-12">
        {/* Guidance Note */}
        <div className="bg-slate-50 p-8 rounded-[2.5rem] flex gap-6 items-start">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Info className="w-5 h-5 text-[#00538e]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-[#00538e] uppercase text-xs tracking-widest">How it works</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              This is your direct line to me. Unlike the AI, I respond asynchronously.
              I review messages once a day to provide thoughtful, grounded guidance on your 180° shifts.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Message History (7/12 area) */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Your Conversations</h2>
            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-200" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 opacity-30 py-12 bg-white border border-slate-50 rounded-[2.5rem]">
                <Clock className="w-8 h-8 text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Messages will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                        <h4 className="font-bold text-slate-900">{msg.subject}</h4>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${msg.status === 'replied' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
                        }`}>
                        {msg.status}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 bg-slate-50 p-6 rounded-2xl italic leading-relaxed">
                      "{msg.message}"
                    </p>

                    {msg.coach_reply && (
                      <div className="pt-4 border-t border-slate-50 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#0AA390]/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0AA390]" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#0AA390]">Coach Emmeline's Guidance</span>
                        </div>
                        <div className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                          {msg.coach_reply}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Action Area (5/12 area) */}
          <div className="lg:col-span-5 sticky top-32">
            <div className="bg-white border-2 border-[#00538e]/5 p-8 rounded-[3rem] shadow-sm">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">Start a conversation</h2>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Sent! Coach will respond soon.
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What is on your mind?"
                    className="w-full min-h-[180px] p-6 bg-slate-50 rounded-[2rem] outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!message.trim() || !subject.trim() || loading}
                    className="w-full px-12 py-4 bg-[#00538e] text-white rounded-full font-bold uppercase text-xs tracking-widest hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[8px] text-slate-400 font-medium text-center mt-4 uppercase tracking-widest">
                    Response time: ~24 hours
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding [cite: 73-74] */}
      <footer className="p-12 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300">
          Clarity. Confidence. Compassion.
        </p>
      </footer>
    </div>
  );
}
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  ShieldCheck,
  Info
} from 'lucide-react';

export default function AskTheCoachPage() {
  const [message, setMessage] = useState('');
  const [hasAccess, setHasAccess] = useState(true); // Logic would check user tier 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Stub for sending message to coach
    console.log("Message sent to coach:", message);
    setMessage('');
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

      <main className="flex-grow max-w-4xl mx-auto w-full p-6 md:p-12 space-y-12">
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

        {/* Message History Stub */}
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4 opacity-30 py-12">
            <Clock className="w-8 h-8 text-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Previous Messages will appear here</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white border-2 border-[#00538e]/5 p-8 rounded-[3rem] shadow-sm">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">Start a conversation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What is on your mind today? Share your thoughts, feelings, or a specific pattern you've noticed..."
              className="w-full min-h-[200px] p-8 bg-slate-50 rounded-[2rem] outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm leading-relaxed"
            />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
              <p className="text-[10px] text-slate-400 font-medium">
                I typically respond within 24 hours during business days.
              </p>
              <button 
                type="submit"
                disabled={!message.trim()}
                className="w-full md:w-auto px-12 py-4 bg-[#00538e] text-white rounded-full font-bold uppercase text-xs tracking-widest hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
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
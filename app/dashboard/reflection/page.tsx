"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Zap, 
  Send, 
  Sparkles, 
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Message {
  role: 'neo' | 'user';
  content: string;
}

export default function ReflectionPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'neo', 
      content: "Hello. I’ve been observing your shifts this week. Are you ready to dive into your Weekly Clarity Reflection?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Stubbed Backend Call [cite: 21, 161]
    setTimeout(() => {
      const neoMsg: Message = { 
        role: 'neo', 
        content: "I hear you. Looking at that pattern, it seems your 'observer' is noticing a disconnect between your intentions and your energy. How does that resonate with your 180° goal for this week?" 
      };
      setMessages(prev => [...prev, neoMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Header with Updated Title [cite: 27-38, 146] */}
      <header className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-[#00538e]">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0AA390]/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#0AA390]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#00538e] uppercase tracking-tighter">
                Reflection with Neo (Your AI coach)
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Tier 2/3 Session</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#0AA390]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#0AA390]">
          <CheckCircle2 className="w-3 h-3" /> System Ready
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-grow overflow-y-auto p-6 md:p-12 space-y-8 max-w-4xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-[#00538e] text-white border-transparent rounded-tr-none' 
                : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 px-6 py-4 rounded-full flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </main>

      {/* Input Band */}
      <footer className="p-6 md:p-10 bg-white border-t border-slate-50 sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your reflection..."
            className="w-full pl-8 pr-20 py-5 bg-slate-50 rounded-[2rem] outline-none border-2 border-transparent focus:border-[#00538e]/10 focus:bg-white transition-all text-sm font-medium"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-[#00538e] text-white rounded-full hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">
          Rethink. Rewire. Renew.
        </p>
      </footer>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Send, CheckCircle } from 'lucide-react';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const sendTest = async () => {
    setLoading(true);
    setStatus('Preparing your 180° Welcome...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) throw new Error("No user email found.");

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          subject: 'Welcome to NeoMind180 | Your first 180° starts here',
          // This is a preview of your Draft 1
          html: `
            <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px;">
              <h1 style="color: #00538e; text-transform: uppercase; letter-spacing: -0.05em;">NeoMind180</h1>
              <p style="font-size: 18px; line-height: 1.6;">Hello,</p>
              <p style="font-size: 18px; line-height: 1.6;">I am so glad you’ve decided to move from overthinking to clarity. Neo is ready for you.</p>
              <p style="font-size: 18px; line-height: 1.6;">Your journey here is built on a simple premise: <strong>you are not your thoughts; you are the one observing them.</strong></p>
              <div style="margin-top: 40px;">
                <a href="https://neomind180.vercel.app/dashboard" style="background: #00538e; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Enter Your Dashboard</a>
              </div>
              <p style="margin-top: 60px; font-size: 14px; color: #94a3b8; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Rethink. Rewire. Renew.</p>
              <p style="font-size: 16px;">— [Your Name]</p>
            </div>
          `
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Send failed");

      setStatus('Success! Check your inbox.');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-[#00538e]/10 rounded-2xl flex items-center justify-center text-[#00538e] mx-auto">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Email System Test</h1>
        <p className="text-slate-500 text-sm italic">Push this to send a test of 'Draft 1' to your own email address.</p>
        
        <button 
          onClick={sendTest}
          disabled={loading}
          className="w-full py-5 bg-[#00538e] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
        >
          {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Trigger Test Email</>}
        </button>

        {status && (
          <div className="pt-4 flex items-center justify-center gap-2 text-xs font-black uppercase text-[#0AA390] tracking-widest animate-pulse">
            <CheckCircle className="w-4 h-4" />
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
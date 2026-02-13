"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
  ArrowLeft,
  Users,
  Mail,
  Sparkles,
  Calendar,
  CheckCircle2,
  Bell,
  Video,
  Clock
} from 'lucide-react';

export default function DeepDiveCirclesPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  useEffect(() => {
    async function fetchInvites() {
      const { data, error } = await supabase
        .from('circle_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setInvites(data);
      setLoadingInvites(false);
    }
    fetchInvites();
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1f2e] font-sans text-[#cbd5e1]">
      <div className="max-w-5xl mx-auto p-8 md:p-12 space-y-16">

        {/* Navigation & Header */}
        <header className="space-y-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#475569] hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-[#0AA390]/10 rounded-[2rem] border border-[#0AA390]/20 shadow-lg shadow-[#0AA390]/5">
                <Users className="w-10 h-10 text-[#0AA390]" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                  Deep-Dive Circles
                </h1>
                <p className="text-[#94a3b8] text-[10px] font-black uppercase tracking-[0.3em] mt-3">
                  Live Collective Resets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0AA390]/10 border border-[#0AA390]/20 rounded-full text-[9px] font-black uppercase tracking-widest text-[#0AA390] w-fit shadow-lg shadow-[#0AA390]/5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tier 2/3 Access
            </div>
          </div>
        </header>

        {/* Feature Overview  */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight border-l-4 border-[#0AA390] pl-6 py-1">
              A Space for Collective Clarity
            </h2>
            <p className="text-[#94a3b8] leading-relaxed text-lg font-medium italic">
              "I meet when the collective energy is right. These are not rigid, scheduled lectures;
              they are live, responsive sessions designed to help you rethink your current
              patterns and rewire your mindset alongside a community of like-minded women."
            </p>
            <div className="bg-[#232938] p-8 rounded-[2.5rem] border border-[#2d3548] flex gap-5 items-start shadow-xl">
              <div className="p-3 bg-[#1a1f2e] rounded-xl border border-[#2d3548]">
                <Bell className="w-5 h-5 text-[#00538e] shrink-0" />
              </div>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                <strong className="text-white font-black uppercase text-[10px] tracking-widest block mb-2">Announcement Logic</strong>
                I announce each session exactly one week before we gather.
                Invitations including the date, time, and access link will appear below when the next circle is ready to form.
              </p>
            </div>
          </div>

          <div className="bg-[#00538e] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <Sparkles className="absolute -top-6 -right-6 w-40 h-40 opacity-10" />
            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">What to expect</h3>
            <ul className="space-y-6">
              {[
                "Live 180° shift exercises guided by me",
                "Community Q&A and shared reflections",
                "Immediate grounding tools for your week",
                "A recording available for 7 days post-session"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold tracking-tight">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0AA390]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Invitations Section */}
        {!loadingInvites && invites.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#94a3b8] ml-4">
              Active Invitations
            </h2>
            <div className="space-y-6">
              {invites.map((invite) => (
                <div key={invite.id} className="bg-[#232938] border border-[#0AA390]/20 p-10 rounded-[3rem] shadow-xl space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0AA390]/10 rounded-2xl flex items-center justify-center border border-[#0AA390]/20">
                          <Calendar className="w-6 h-6 text-[#0AA390]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">{invite.title}</h3>
                          {invite.session_date && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3.5 h-3.5 text-[#475569]" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
                                {new Date(invite.session_date).toLocaleString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {invite.description && (
                        <p className="text-sm text-[#cbd5e1] leading-relaxed italic pl-15">{invite.description}</p>
                      )}
                    </div>
                    <div className="px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#0AA390]/10 text-[#0AA390] border border-[#0AA390]/20 shrink-0">
                      Live Soon
                    </div>
                  </div>
                  {invite.access_link && (
                    <a
                      href={invite.access_link.startsWith('http') ? invite.access_link : `https://${invite.access_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-5 bg-[#0AA390] text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-2xl shadow-[#0AA390]/20 transition-all hover:-translate-y-1"
                    >
                      <Video className="w-4 h-4" />
                      Join Google Meet
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Branding */}
        <footer className="pt-16 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2d3548]">
            NeoMind180 — Clarity, not therapy
          </p>
          <p className="text-[10px] text-[#2d3548] font-bold uppercase tracking-widest">© 2024 NeoMind180</p>
        </footer>
      </div>
    </div >
  );
}
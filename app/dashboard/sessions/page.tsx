"use client";

import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Video,
  Clock,
  Star,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function SessionsPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ "namespace": "60min" });
      cal("ui", { "cssVarsPerTheme": { "light": { "cal-brand": "#0AA390" }, "dark": { "cal-brand": "#0AA390" } }, "hideEventTypeDetails": false, "layout": "month_view" });
    })();
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
                <Star className="w-10 h-10 text-[#0AA390]" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                  1:1 Sessions
                </h1>
                <p className="text-[#94a3b8] text-[10px] font-black uppercase tracking-[0.3em] mt-3">
                  Exclusive Deep Coaching
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0AA390]/10 border border-[#0AA390]/20 rounded-full text-[9px] font-black uppercase tracking-widest text-[#0AA390] w-fit shadow-lg shadow-[#0AA390]/5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tier 3 Active
            </div>
          </div>
        </header>

        {/* Benefits Overview */}
        <section className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Clock, title: "Monthly Time", desc: "2 × 60-minute deep-dive online sessions per month." },
            { icon: Video, title: "Virtual Room", desc: "Private, secure video space for our transformative work." },
            { icon: Calendar, title: "Flexible Booking", desc: "Book your sessions up to 30 days in advance." }
          ].map((item, i) => (
            <div key={i} className="bg-[#232938] p-8 rounded-[2.5rem] border border-[#2d3548] space-y-4 shadow-xl">
              <item.icon className="w-8 h-8 text-[#0AA390]" />
              <h3 className="font-black uppercase text-[10px] tracking-widest text-white">{item.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed italic">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Scheduling Section */}
        <section className="bg-[#232938] border border-[#2d3548] p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-16 items-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#0AA390] to-transparent opacity-30" />

          <div className="flex-grow space-y-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter border-l-4 border-[#0AA390] pl-6 py-1 lg:ml-0">
              Ready for your next shift?
            </h2>
            <p className="text-[#94a3b8] leading-relaxed text-lg font-medium italic max-w-xl">
              "Select a time that allows you to be fully present. We will use this hour to rewire
              complex patterns and move toward aligned action."
            </p>
            <button
              data-cal-namespace="60min"
              data-cal-link="neomind180coach/60min"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
              className="px-14 py-5 bg-[#0AA390] text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-2xl shadow-[#0AA390]/20 transition-all flex items-center justify-center gap-3 mx-auto lg:mx-0 hover:-translate-y-1"
            >
              Open Schedule <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full lg:w-96 bg-[#1a1f2e] border border-[#2d3548] rounded-[3rem] p-10 space-y-8 shadow-inner text-center">
            <h4 className="text-[10px] font-black uppercase text-[#475569] tracking-[0.3em]">Remaining This Month</h4>
            <div className="flex justify-center items-baseline gap-3">
              <span className="text-7xl font-black text-[#0AA390] drop-shadow-[0_0_15px_rgba(10,163,144,0.3)]">2</span>
              <span className="text-[#475569] font-black uppercase text-[10px] tracking-widest">Sessions</span>
            </div>
            <div className="pt-6 border-t border-[#2d3548]">
              <p className="text-[10px] text-[#0AA390] font-black uppercase tracking-[0.4em]">Plan: Deep Coaching</p>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="space-y-8">
          <h3 className="text-[10px] font-black text-[#475569] uppercase tracking-[0.4em] ml-4">Session History</h3>
          <div className="bg-[#232938]/30 border border-dashed border-[#2d3548] rounded-[3rem] p-16 text-center">
            <p className="text-sm text-[#475569] italic font-medium uppercase tracking-widest">
              Upcoming and past session details will materialize here.
            </p>
          </div>
        </section>

        {/* Footer Branding */}
        <footer className="pt-16 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2d3548]">
            NeoMind180 — Clarity, not therapy
          </p>
          <p className="text-[10px] text-[#2d3548] font-bold uppercase tracking-widest">© 2024 NeoMind180</p>
        </footer>
      </div>
    </div>
  );
}
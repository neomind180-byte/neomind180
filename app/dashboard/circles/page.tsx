"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
  ArrowLeft,
  Users,
  Sparkles,
  CheckCircle2,
  ClipboardList,
  Calendar,
  Clock,
  Mail,
  Video,
  ChevronRight,
  UserCheck,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CircleStatus = 'forming' | 'scheduled' | 'live' | 'completed';

interface Circle {
  id: string;
  title: string;
  scheduled_date: string | null;
  max_participants: number;
  min_participants: number;
  status: CircleStatus;
  zoom_link: string | null;
  recording_url: string | null;
  schedule_poll_url: string | null;
  created_at: string;
}

interface WaitlistEntry {
  id: string;
  user_id: string;
  joined_at: string;
  status: string;
  position: number | null;
  circle_id: string | null;
}

type UserState = 'loading' | 'not_joined' | 'on_waitlist' | 'scheduling' | 'scheduled' | 'completed';

// ─── Past Circles (static for now) ───────────────────────────────────────────

const PAST_CIRCLES = [
  { date: 'Feb 2026', theme: 'Releasing Shame', participants: 9 },
  { date: 'Jan 2026', theme: 'Identity Shifts', participants: 7 },
];

const TESTIMONIALS = [
  { quote: "The Circle was transformative. I finally felt seen and understood.", name: "Sarah M." },
  { quote: "Emmeline creates such a safe space. The exercises hit different in a group.", name: "Thandi K." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="relative w-full h-3 rounded-full bg-white/10 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0AA390] to-[#00538e] transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
      {/* shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
}

// ─── Status Card ─────────────────────────────────────────────────────────────

function StatusCard({
  circle,
  waitlistEntry,
  waitlistCount,
  userState,
  onJoin,
  onLeave,
  joining,
  leaving,
}: {
  circle: Circle | null;
  waitlistEntry: WaitlistEntry | null;
  waitlistCount: number;
  userState: UserState;
  onJoin: () => void;
  onLeave: () => void;
  joining: boolean;
  leaving: boolean;
}) {
  const min = circle?.min_participants ?? 6;
  const needed = Math.max(0, min - waitlistCount);
  const pct = Math.min(100, Math.round((waitlistCount / min) * 100));

  // ── Not joined ──────────────────────────────────────────────────────────────
  if (userState === 'not_joined') {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0AA390]/10 rounded-xl border border-[#0AA390]/20">
            <ClipboardList className="w-5 h-5 text-[#0AA390]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0AA390]">
            Next Circle Status
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[var(--text-primary)] font-black text-xl">
              {waitlistCount} <span className="text-[var(--text-muted)] font-medium text-base">of {min} needed</span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-dim)]">{pct}%</span>
          </div>
          <ProgressBar value={waitlistCount} max={min} />
        </div>

        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          {needed === 0
            ? "We've reached the threshold — scheduling will begin soon!"
            : `Almost there! We need ${needed} more ${needed === 1 ? 'person' : 'people'} to schedule the next session.`}
        </p>

        <button
          onClick={onJoin}
          disabled={joining}
          className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#0AA390] text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.25em] hover:shadow-xl hover:shadow-[#0AA390]/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
          {joining ? 'Joining…' : 'Join Waitlist'}
        </button>
        <p className="text-center text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest">
          We'll email you when we're ready to schedule
        </p>
      </div>
    );
  }

  // ── On waitlist ─────────────────────────────────────────────────────────────
  if (userState === 'on_waitlist') {
    return (
      <div className="bg-[var(--bg-card)] border border-[#0AA390]/30 rounded-[2.5rem] p-8 shadow-xl shadow-[#0AA390]/5 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0AA390]/10 rounded-xl border border-[#0AA390]/20">
            <UserCheck className="w-5 h-5 text-[#0AA390]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0AA390]">
            You're on the Waitlist ✓
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[var(--text-primary)] font-black text-xl">
              {waitlistCount} <span className="text-[var(--text-muted)] font-medium text-base">of {min} needed</span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-dim)]">{pct}%</span>
          </div>
          <ProgressBar value={waitlistCount} max={min} />
        </div>

        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-4 space-y-2">
          {waitlistEntry?.joined_at && (
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-[var(--text-dim)]">Joined</span>
              <span className="text-[var(--text-secondary)]">
                {new Date(waitlistEntry.joined_at).toLocaleDateString('en-ZA', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          )}
          {waitlistEntry?.position && (
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-[var(--text-dim)]">Position</span>
              <span className="text-[var(--text-secondary)]">#{waitlistEntry.position}</span>
            </div>
          )}
        </div>

        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          {needed === 0
            ? "We've reached the threshold — watch your email for the scheduling poll!"
            : `Just ${needed} more ${needed === 1 ? 'person' : 'people'} needed. We'll email you when we're ready to schedule.`}
        </p>

        <button
          onClick={onLeave}
          disabled={leaving}
          className="flex items-center justify-center gap-2 w-full py-3 border border-[var(--border)] text-[var(--text-dim)] rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.25em] hover:border-red-500/40 hover:text-red-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {leaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          {leaving ? 'Leaving…' : 'Leave Waitlist'}
        </button>
      </div>
    );
  }

  // ── Scheduling in progress ───────────────────────────────────────────────────
  if (userState === 'scheduling') {
    return (
      <div className="bg-[var(--bg-card)] border border-[#00538e]/30 rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00538e]/10 rounded-xl border border-[#00538e]/20">
            <Calendar className="w-5 h-5 text-[#00538e]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00538e]">
            Scheduling in Progress
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-[var(--text-primary)] font-black text-lg leading-snug">
            We have enough interest!
          </p>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Check your email for the scheduling poll. We'll confirm the date that works for most participants.
          </p>
        </div>

        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] p-4 space-y-2">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
            <span className="text-[var(--text-dim)]">Participants</span>
            <span className="text-[var(--text-secondary)]">{waitlistCount}</span>
          </div>
          {circle?.scheduled_date && (
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-[var(--text-dim)]">Expected</span>
              <span className="text-[var(--text-secondary)]">
                {new Date(circle.scheduled_date).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {circle?.schedule_poll_url && (
          <a
            href={circle.schedule_poll_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#00538e] text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.25em] hover:shadow-xl transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View Schedule Poll
          </a>
        )}
      </div>
    );
  }

  // ── Scheduled / Live ────────────────────────────────────────────────────────
  if (userState === 'scheduled') {
    return (
      <div className="bg-[var(--bg-card)] border border-[#0AA390]/30 rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0AA390]/10 rounded-xl border border-[#0AA390]/20">
            <Video className="w-5 h-5 text-[#0AA390]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0AA390]">
            Circle Confirmed
          </span>
        </div>

        {circle?.scheduled_date && (
          <div className="bg-[#0AA390]/10 border border-[#0AA390]/20 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#0AA390] mb-1">Date & Time</p>
            <p className="text-[var(--text-primary)] font-black text-lg">
              {new Date(circle.scheduled_date).toLocaleString('en-ZA', {
                weekday: 'long', day: 'numeric', month: 'long',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        )}

        {circle?.zoom_link && (
          <a
            href={circle.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#0AA390] text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.25em] hover:shadow-xl hover:shadow-[#0AA390]/25 hover:-translate-y-0.5 transition-all"
          >
            <Video className="w-4 h-4" />
            Join Google Meet
          </a>
        )}
      </div>
    );
  }

  // ── Completed ───────────────────────────────────────────────────────────────
  if (userState === 'completed') {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0AA390]/10 rounded-xl border border-[#0AA390]/20">
            <CheckCircle2 className="w-5 h-5 text-[#0AA390]" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0AA390]">
            Circle Completed
          </span>
        </div>

        {circle?.recording_url && (
          <a
            href={circle.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#0AA390]/10 border border-[#0AA390]/20 text-[#0AA390] rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.25em] hover:bg-[#0AA390]/20 transition-all"
          >
            <Video className="w-4 h-4" />
            Watch Recording
          </a>
        )}

        <button
          onClick={onJoin}
          disabled={joining}
          className="flex items-center justify-center gap-2.5 w-full py-4 bg-[#0AA390] text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.25em] hover:shadow-xl hover:shadow-[#0AA390]/25 hover:-translate-y-0.5 transition-all disabled:opacity-60"
        >
          {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
          Join Waitlist for Next Circle
        </button>
      </div>
    );
  }

  // Loading state
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 text-[#0AA390] animate-spin" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeepDiveCirclesPage() {
  const [circle, setCircle] = useState<Circle | null>(null);
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [userState, setUserState] = useState<UserState>('loading');
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  /* ── Toast helper ─────────────────────────────────────────────────────────── */
  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  /* ── Fetch data ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);

      // 2. Fetch the most recent (active) circle
      const { data: circleData } = await supabase
        .from('circles')
        .select('*')
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const activeCircle: Circle | null = circleData ?? null;
      setCircle(activeCircle);

      // 3. Count waitlist entries for this circle (or global if no circle yet)
      const countQuery = supabase
        .from('circle_waitlist')
        .select('id', { count: 'exact', head: true });

      if (activeCircle) {
        countQuery.eq('circle_id', activeCircle.id);
      } else {
        countQuery.is('circle_id', null);
      }

      const { count } = await countQuery;
      setWaitlistCount(count ?? 0);

      // 4. Check if user is on the waitlist
      if (uid) {
        const entryQuery = supabase
          .from('circle_waitlist')
          .select('*')
          .eq('user_id', uid);

        if (activeCircle) {
          entryQuery.eq('circle_id', activeCircle.id);
        } else {
          entryQuery.is('circle_id', null);
        }

        const { data: entryData } = await entryQuery.maybeSingle();
        setWaitlistEntry(entryData ?? null);

        // 5. Derive user state
        if (activeCircle) {
          if (activeCircle.status === 'completed') {
            setUserState('completed');
          } else if (activeCircle.status === 'scheduled' || activeCircle.status === 'live') {
            setUserState('scheduled');
          } else if (activeCircle.status === 'forming' && entryData) {
            // Check if scheduling has started (count >= min)
            const min = activeCircle.min_participants ?? 6;
            setUserState((count ?? 0) >= min ? 'scheduling' : 'on_waitlist');
          } else {
            setUserState(entryData ? 'on_waitlist' : 'not_joined');
          }
        } else {
          setUserState(entryData ? 'on_waitlist' : 'not_joined');
        }
      } else {
        setUserState('not_joined');
      }
    }

    load();
  }, []);

  /* ── Join ─────────────────────────────────────────────────────────────────── */
  async function handleJoin() {
    if (!userId) {
      showToast('error', 'Please log in to join the waitlist.');
      return;
    }
    setJoining(true);
    try {
      const newEntry: Record<string, unknown> = {
        user_id: userId,
        status: 'waiting',
      };
      if (circle) newEntry.circle_id = circle.id;

      const { error } = await supabase.from('circle_waitlist').insert([newEntry]);
      if (error) throw error;

      const newCount = waitlistCount + 1;
      setWaitlistCount(newCount);

      // Re-fetch the entry to get position
      const entryQuery = supabase
        .from('circle_waitlist')
        .select('*')
        .eq('user_id', userId);
      if (circle) entryQuery.eq('circle_id', circle.id);
      else entryQuery.is('circle_id', null);

      const { data: entryData } = await entryQuery.maybeSingle();
      setWaitlistEntry(entryData ?? null);

      const min = circle?.min_participants ?? 6;
      setUserState(newCount >= min ? 'scheduling' : 'on_waitlist');
      showToast('success', "You're on the waitlist! We'll email you when we're ready to schedule.");
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to join the waitlist.');
    } finally {
      setJoining(false);
    }
  }

  /* ── Leave ────────────────────────────────────────────────────────────────── */
  async function handleLeave() {
    if (!userId || !waitlistEntry) return;
    setLeaving(true);
    try {
      const { error } = await supabase
        .from('circle_waitlist')
        .delete()
        .eq('id', waitlistEntry.id);
      if (error) throw error;

      setWaitlistCount(Math.max(0, waitlistCount - 1));
      setWaitlistEntry(null);
      setUserState('not_joined');
      showToast('success', "You've been removed from the waitlist.");
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to leave the waitlist.');
    } finally {
      setLeaving(false);
    }
  }

  /* ── Render ───────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer { animation: shimmer 2.5s infinite linear; }
      `}</style>

      <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-secondary)]">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold max-w-sm transition-all
              ${toast.type === 'success'
                ? 'bg-[#0AA390] text-white'
                : 'bg-red-600 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
            {toast.message}
          </div>
        )}

        <div className="max-w-5xl mx-auto p-8 md:p-12 space-y-16">

          {/* ── Header ────────────────────────────────────────────────────────── */}
          <header className="space-y-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors font-black uppercase text-[12px] tracking-widest group"
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
                  <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
                    Deep-Dive Circles
                  </h1>
                  <p className="text-[var(--text-muted)] text-[12px] font-black uppercase tracking-[0.3em] mt-3">
                    A Space for Collective Clarity
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0AA390]/10 border border-[#0AA390]/20 rounded-full text-[11px] font-black uppercase tracking-widest text-[#0AA390] w-fit shadow-lg shadow-[#0AA390]/5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tier 2/3 Access
              </div>
            </div>
          </header>

          {/* ── Quote ─────────────────────────────────────────────────────────── */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-10 md:p-14 text-center shadow-xl relative overflow-hidden">
            <Sparkles className="absolute -top-4 -right-4 w-32 h-32 text-[#0AA390] opacity-5" />
            <p className="text-[var(--text-secondary)] leading-relaxed text-lg md:text-xl font-medium italic max-w-2xl mx-auto">
              "These sessions happen when there's collective energy and readiness. Join the waitlist to
              show your interest, and when enough women are ready, we'll find a time that works for the group."
            </p>
          </div>

          {/* ── Two-column body ───────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-5 gap-12">

            {/* LEFT — 60% */}
            <div className="lg:col-span-3 space-y-14">

              {/* What to Expect */}
              <section className="space-y-6">
                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] border-l-4 border-[#0AA390] pl-4">
                  What to Expect
                </h2>
                <ul className="space-y-4">
                  {[
                    'Live 180° shift exercises guided by me',
                    'Community Q&A and shared reflections',
                    'Immediate support from like-minded women',
                    'Intimate group size (max 8–12 participants)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-[#0AA390]/10 border border-[#0AA390]/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0AA390]" />
                      </div>
                      <span className="text-[var(--text-secondary)] font-medium leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Divider */}
              <div className="h-px bg-[var(--border)]" />

              {/* How it Works */}
              <section className="space-y-6">
                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] border-l-4 border-[#0AA390] pl-4">
                  How it Works
                </h2>
                <ol className="space-y-6">
                  {[
                    { n: '1', title: 'Join the Waitlist', desc: 'Express your interest for the next Circle session.' },
                    { n: '2', title: "We'll Gauge Interest", desc: `When 6+ women join the waitlist, I'll reach out.` },
                    { n: '3', title: 'Schedule Together', desc: "We'll find a time that works for most participants." },
                    { n: '4', title: 'Meet & Transform', desc: 'Live 90-minute session via Google Meet.' },
                  ].map(({ n, title, desc }) => (
                    <li key={n} className="flex gap-5 items-start">
                      <div className="shrink-0 w-9 h-9 rounded-2xl bg-[#0AA390] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-[#0AA390]/20">
                        {n}
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)] font-black uppercase text-[13px] tracking-widest">{title}</p>
                        <p className="text-[var(--text-muted)] text-sm mt-1 leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Divider */}
              <div className="h-px bg-[var(--border)]" />

              {/* Topics */}
              <section className="space-y-5">
                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] border-l-4 border-[#0AA390] pl-4">
                  Topics Vary Based on Group Needs
                </h2>
                <p className="text-[11px] text-[var(--text-dim)] font-bold uppercase tracking-widest">Recent themes:</p>
                <div className="flex flex-wrap gap-2">
                  {['Releasing perfectionism', 'Navigating transitions', 'Building self-compassion', 'Breaking overthinking loops'].map(t => (
                    <span
                      key={t}
                      className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT — 40% */}
            <div className="lg:col-span-2 space-y-6">

              {/* Waitlist Status Card */}
              <StatusCard
                circle={circle}
                waitlistEntry={waitlistEntry}
                waitlistCount={waitlistCount}
                userState={userState}
                onJoin={handleJoin}
                onLeave={handleLeave}
                joining={joining}
                leaving={leaving}
              />

              {/* Past Circles */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    Past Circles
                  </span>
                  <Calendar className="w-4 h-4 text-[var(--text-dim)]" />
                </div>
                <div className="space-y-4">
                  {PAST_CIRCLES.map((c, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)]">
                      <div className="w-1 self-stretch rounded-full bg-[#0AA390]/40 shrink-0" />
                      <div>
                        <p className="text-[var(--text-primary)] font-black text-sm">{c.theme}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mt-0.5">
                          {c.date} · {c.participants} participants
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    What Women Say
                  </span>
                  <Mail className="w-4 h-4 text-[var(--text-dim)]" />
                </div>
                <div className="space-y-4">
                  {TESTIMONIALS.map((t, i) => (
                    <div key={i} className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] space-y-2">
                      <p className="text-[var(--text-secondary)] text-sm italic leading-relaxed">"{t.quote}"</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0AA390]">— {t.name}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── Footer ────────────────────────────────────────────────────────── */}
          <footer className="pt-16 text-center space-y-4">
            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)]">
              NeoMind180 — Clarity, not therapy
            </p>
            <p className="text-[12px] text-[var(--text-dim)] font-bold uppercase tracking-widest">© 2026 NeoMind180</p>
          </footer>

        </div>
      </div>
    </>
  );
}
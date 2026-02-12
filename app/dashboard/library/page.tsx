"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  BookOpen,
  Headphones,
  Play,
  Pause,
  Clock,
  FileText,
  Download,
  Lock,
  Video,
  ExternalLink,
  Volume2
} from 'lucide-react';

// --- TYPES ---
type LibraryItem = {
  id: string;
  title: string;
  type: 'Guide' | 'Article' | 'Worksheet' | 'Audio' | 'Video';
  category: string;
  duration?: string;
  read_time?: string;
  locked: boolean;
  min_tier: 'free' | 'tier2' | 'tier3';
  content_url?: string;
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'read' | 'listen' | 'watch'>('read');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>('free');

  // Audio Playback State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchData() {
      // 1. Get User Tier
      const { data: { user } } = await supabase.auth.getUser();
      let currentTier = 'free';

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        if (profile) currentTier = profile.subscription_tier;
      }
      setUserTier(currentTier);

      // 2. Get Library Items
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .order('title');

      if (data) {
        setItems(data as LibraryItem[]);
      }
      setLoading(false);
    }
    fetchData();

    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Helper to check if item is locked for current user
  const isLocked = (minTier: string) => {
    if (minTier === 'free') return false;
    if (minTier === 'tier2' && (userTier === 'free')) return true;
    if (minTier === 'tier3' && (userTier === 'free' || userTier === 'tier2')) return true;
    return false;
  };

  const togglePlay = (item: LibraryItem) => {
    const isCurrentlyPlaying = playingTrackId === item.id;

    if (isCurrentlyPlaying) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      // If another track is playing, stop it
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create new audio instance if needed or update src
      if (!item.content_url) {
        console.error("No content URL for this audio track");
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio(item.content_url);
      } else {
        audioRef.current.src = item.content_url;
      }

      audioRef.current.play().catch(err => {
        console.error("Audio playback failed", err);
      });
      setPlayingTrackId(item.id);

      // Reset state when audio ends
      audioRef.current.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  // Filter items based on active tab
  const filteredItems = items.filter(item => {
    if (activeTab === 'read') return ['Guide', 'Article', 'Worksheet'].includes(item.type);
    if (activeTab === 'listen') return ['Audio'].includes(item.type);
    if (activeTab === 'watch') return ['Video'].includes(item.type);
    return false;
  });

  return (
    <div className="min-h-screen bg-[#1a1f2e] font-sans text-[#cbd5e1] p-6 md:p-12 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Self-Help Library
          </h1>
          <p className="text-[#94a3b8] font-medium mt-2 max-w-lg italic">
            Curated tools to help you rethink, rewire, and renew at your own pace.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-[#232938] p-1.5 rounded-[2rem] border border-[#2d3548] flex shadow-2xl shadow-black/20">
          <button
            onClick={() => setActiveTab('read')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'read'
              ? 'bg-[#00538e] text-white shadow-lg shadow-[#00538e]/20'
              : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
          >
            <BookOpen className="w-4 h-4" /> Read
          </button>
          <button
            onClick={() => setActiveTab('listen')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'listen'
              ? 'bg-[#0AA390] text-white shadow-lg shadow-[#0AA390]/20'
              : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
          >
            <Headphones className="w-4 h-4" /> Listen
          </button>
          <button
            onClick={() => setActiveTab('watch')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'watch'
              ? 'bg-[#993366] text-white shadow-lg shadow-[#993366]/20'
              : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
          >
            <Video className="w-4 h-4" /> Watch
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="text-center py-12 text-[#475569] font-black uppercase tracking-widest text-[10px] animate-pulse">Loading library resources...</div>
      ) : (
        <div className="grid gap-6">

          {/* --- READ TAB --- */}
          {activeTab === 'read' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredItems.map((item) => {
                const locked = isLocked(item.min_tier);
                return (
                  <div key={item.id} className="bg-[#232938] p-8 rounded-[2.5rem] border border-[#2d3548] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className="w-12 h-12 bg-[#00538e]/10 rounded-2xl flex items-center justify-center mb-6 text-[#00538e] group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] bg-[#1a1f2e] border border-[#2d3548] px-2 py-1 rounded-md">
                        {item.type}
                      </span>
                      {locked && <Lock className="w-4 h-4 text-[#F39904]" />}
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-[#475569] font-black uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {item.read_time}
                    </p>
                    <button
                      disabled={locked}
                      onClick={() => !locked && item.content_url && window.open(item.content_url, '_blank')}
                      className={`w-full mt-8 py-4 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${locked
                        ? 'border-[#1a1f2e] text-[#2d3548] cursor-not-allowed'
                        : 'border-[#2d3548] text-[#00538e] hover:border-[#00538e] hover:bg-[#00538e] hover:text-white'
                        }`}
                    >
                      {item.type === 'Worksheet' ? <Download className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      {locked ? 'Locked' : (item.type === 'Worksheet' ? 'Download' : 'Read Now')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- LISTEN TAB --- */}
          {activeTab === 'listen' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredItems.map((track) => {
                const locked = isLocked(track.min_tier);
                const isPlaying = playingTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-8 bg-[#232938] rounded-[2.5rem] border transition-all ${isPlaying
                      ? 'border-[#0AA390] shadow-xl shadow-[#0AA390]/10 ring-1 ring-[#0AA390]/20'
                      : 'border-[#2d3548] shadow-sm hover:border-[#475569]'
                      }`}
                  >
                    <div className="flex items-center gap-8">
                      <button
                        onClick={() => !locked && togglePlay(track)}
                        disabled={locked}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${locked
                          ? 'bg-[#1a1f2e] text-[#2d3548] cursor-not-allowed'
                          : isPlaying
                            ? 'bg-[#0AA390] text-white shadow-xl shadow-[#0AA390]/20 scale-110'
                            : 'bg-[#1a1f2e] border border-[#2d3548] text-[#0AA390] hover:bg-[#0AA390] hover:text-white'
                          }`}
                      >
                        {locked ? <Lock className="w-7 h-7" /> : isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`text-xl font-bold ${isPlaying ? 'text-[#0AA390]' : 'text-white'}`}>
                            {track.title}
                          </h3>
                          {isPlaying && <Volume2 className="w-4 h-4 text-[#0AA390] animate-bounce" />}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
                            {track.category}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2d3548]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {track.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visualizer Stub (Only shows when playing) */}
                    {isPlaying && (
                      <div className="hidden md:flex gap-1.5 items-end h-10">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-1.5 bg-[#0AA390] animate-pulse rounded-full" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* --- WATCH TAB --- */}
          {activeTab === 'watch' && (
            <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredItems.length === 0 && <div className="col-span-2 text-center text-[#475569] py-12 font-black uppercase text-[10px] tracking-widest">No video content available yet.</div>}
              {filteredItems.map((video) => {
                const locked = isLocked(video.min_tier);
                return (
                  <div key={video.id} className="bg-[#232938] p-8 rounded-[2.5rem] border border-[#2d3548] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    {/* Thumbnail Placeholder */}
                    <div className="aspect-video bg-[#1a1f2e] border border-[#2d3548] rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity cursor-pointer shadow-inner">
                      {locked ? (
                        <Lock className="w-10 h-10 text-[#2d3548]" />
                      ) : (
                        <Play className="w-12 h-12 text-[#993366] fill-current drop-shadow-lg" />
                      )}
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#993366] px-3 py-1.5 rounded-lg shadow-lg shadow-[#993366]/20">
                        {video.category || 'Video'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#475569] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {video.duration}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-tight mb-6">
                      {video.title}
                    </h3>

                    <button
                      disabled={locked}
                      onClick={() => !locked && video.content_url && window.open(video.content_url, '_blank')}
                      className={`w-full py-4 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${locked
                        ? 'border-[#1a1f2e] text-[#2d3548] cursor-not-allowed'
                        : 'border-[#2d3548] text-[#993366] hover:border-[#993366] hover:bg-[#993366] hover:text-white'
                        }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {locked ? 'Locked' : 'Watch Now'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 md:p-12 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter">
            Self-Help Library
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-lg">
            Curated tools to help you rethink, rewire, and renew at your own pace.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-white p-1 rounded-full border border-slate-200 flex shadow-sm">
          <button
            onClick={() => setActiveTab('read')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'read'
              ? 'bg-[#00538e] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <BookOpen className="w-4 h-4" /> Read
          </button>
          <button
            onClick={() => setActiveTab('listen')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'listen'
              ? 'bg-[#0AA390] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Headphones className="w-4 h-4" /> Listen
          </button>
          <button
            onClick={() => setActiveTab('watch')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'watch'
              ? 'bg-[#993366] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Video className="w-4 h-4" /> Watch
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading library resources...</div>
      ) : (
        <div className="grid gap-6">

          {/* --- READ TAB --- */}
          {activeTab === 'read' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredItems.map((item) => {
                const locked = isLocked(item.min_tier);
                return (
                  <div key={item.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-[#00538e]/10 rounded-2xl flex items-center justify-center mb-6 text-[#00538e] group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {item.type}
                      </span>
                      {locked && <Lock className="w-4 h-4 text-[#F39904]" />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {item.read_time}
                    </p>
                    <button
                      disabled={locked}
                      onClick={() => !locked && item.content_url && window.open(item.content_url, '_blank')}
                      className={`w-full mt-8 py-3 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${locked
                        ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                        : 'border-slate-100 text-[#00538e] hover:border-[#00538e] hover:bg-[#00538e] hover:text-white'
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
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredItems.map((track) => {
                const locked = isLocked(track.min_tier);
                const isPlaying = playingTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-6 bg-white rounded-[2rem] border transition-all ${isPlaying
                      ? 'border-[#0AA390] shadow-lg ring-1 ring-[#0AA390]/20'
                      : 'border-slate-100 shadow-sm hover:border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => !locked && togglePlay(track)}
                        disabled={locked}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${locked
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : isPlaying
                            ? 'bg-[#0AA390] text-white shadow-lg scale-110'
                            : 'bg-[#0AA390]/10 text-[#0AA390] hover:bg-[#0AA390] hover:text-white'
                          }`}
                      >
                        {locked ? <Lock className="w-6 h-6" /> : isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-lg font-bold ${isPlaying ? 'text-[#0AA390]' : 'text-slate-800'}`}>
                            {track.title}
                          </h3>
                          {isPlaying && <Volume2 className="w-4 h-4 text-[#0AA390] animate-bounce" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {track.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {track.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visualizer Stub (Only shows when playing) */}
                    {isPlaying && (
                      <div className="hidden md:flex gap-1 items-end h-8">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-1 bg-[#0AA390] animate-pulse rounded-full" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }} />
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
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredItems.length === 0 && <div className="col-span-2 text-center text-slate-400 py-12">No video content available yet.</div>}
              {filteredItems.map((video) => {
                const locked = isLocked(video.min_tier);
                return (
                  <div key={video.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    {/* Thumbnail Placeholder */}
                    <div className="aspect-video bg-slate-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity cursor-pointer">
                      {locked ? (
                        <Lock className="w-8 h-8 text-slate-300" />
                      ) : (
                        <Play className="w-10 h-10 text-[#993366] fill-current" />
                      )}
                      {/* If we had a real YouTube embed/thumbnail, it would go here */}
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#993366] px-2 py-1 rounded-md">
                        {video.category || 'Video'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {video.duration}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 leading-tight mb-4">
                      {video.title}
                    </h3>

                    <button
                      disabled={locked}
                      onClick={() => !locked && video.content_url && window.open(video.content_url, '_blank')}
                      className={`w-full py-3 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${locked
                        ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                        : 'border-slate-100 text-[#993366] hover:border-[#993366] hover:bg-[#993366] hover:text-white'
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
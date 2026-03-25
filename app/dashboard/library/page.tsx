"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  BookOpen, Headphones, Play, Pause, Clock, FileText,
  Download, Lock, Video, Volume2, Upload, Loader2,
  KeyRound, AlertCircle, X, Plus, Save, Trash2, Edit3, Link2
} from 'lucide-react';

const ADMIN_PASSWORD = 'NeoAdmin2025';

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
  thumbnail_url?: string;
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'read' | 'listen' | 'watch'>('read');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>('free');

  // Audio Playback State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Video Modal State
  const [selectedVideo, setSelectedVideo] = useState<LibraryItem | null>(null);

  // Doc Modal State
  const [selectedDoc, setSelectedDoc] = useState<LibraryItem | null>(null);

  // Admin / Password state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState(false);

  // Audio upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Article upload
  const [isUploadingArticle, setIsUploadingArticle] = useState(false);
  const [articleUploadMessage, setArticleUploadMessage] = useState<string | null>(null);

  // New library item form (shared for Read & Watch)
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormTab, setAddFormTab] = useState<'read' | 'watch'>('read');
  const [formData, setFormData] = useState({
    title: '', category: '', type: 'Article',
    read_time: '', duration: '', content_url: '',
    thumbnail_url: '', min_tier: 'free', locked: false
  });
  const [formSaving, setFormSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const handleAdminToggle = () => {
    if (isAdmin) return;
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdminPasswordModal(true);
        return 0;
      }
      return next;
    });
  };

  const handleAdminPasswordSubmit = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminPasswordModal(false);
      setAdminPassword('');
      setAdminPasswordError(false);
    } else {
      setAdminPasswordError(true);
      setAdminPassword('');
      setAdminClickCount(0);
      setTimeout(() => setAdminPasswordError(false), 3000);
    }
  };

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase
      .from('library_items')
      .select('*')
      .order('title');

    if (data) {
      setItems(data as LibraryItem[]);
    }
    setLoading(false);
  }

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadMessage("Uploading to Vercel Blob...");
    try {
      const response = await fetch(`/api/upload/audio?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST', body: file,
      });
      if (!response.ok) throw new Error('Upload failed');
      const blob = await response.json();
      setUploadMessage("Upload complete!");
      await navigator.clipboard.writeText(blob.url);
      alert(`Audio uploaded! URL copied to clipboard:\n\n${blob.url}\n\nPaste this in Supabase content_url.`);
    } catch (error) {
      console.error(error);
      setUploadMessage("Upload failed.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  const handleArticleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingArticle(true);
    setArticleUploadMessage("Uploading article to Vercel Blob (READ/)...");
    try {
      const response = await fetch(`/api/upload/article?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST', body: file,
      });
      if (!response.ok) throw new Error('Upload failed');
      const blob = await response.json();
      setFormData(prev => ({ ...prev, content_url: blob.url }));
      setArticleUploadMessage("Uploaded! URL filled in below.");
    } catch (error) {
      console.error(error);
      setArticleUploadMessage("Upload failed.");
    } finally {
      setIsUploadingArticle(false);
      setTimeout(() => setArticleUploadMessage(null), 4000);
    }
  };

  const handleAddLibraryItem = async () => {
    if (!formData.title || !formData.content_url) {
      setFormMessage("Title and Content URL are required.");
      return;
    }
    setFormSaving(true);
    setFormMessage(null);
    try {
      const insertData: any = {
        title: formData.title,
        category: formData.category,
        type: formData.type,
        content_url: formData.content_url,
        thumbnail_url: formData.thumbnail_url || null,
        min_tier: formData.min_tier,
        locked: formData.locked,
      };
      if (addFormTab === 'read') insertData.read_time = formData.read_time;
      if (addFormTab === 'watch') {
        insertData.duration = formData.duration;
        insertData.type = 'Video';
      }

      // Hit our new admin backend route to bypass RLS entirely
      const res = await fetch('/api/admin/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insertData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add item');

      setFormMessage("✓ Item added successfully!");
      setFormData({ title: '', category: '', type: addFormTab === 'watch' ? 'Video' : 'Article', read_time: '', duration: '', content_url: '', thumbnail_url: '', min_tier: 'free', locked: false });
      await fetchItems();
    } catch (err: any) {
      setFormMessage(`Error: ${err.message}`);
    } finally {
      setFormSaving(false);
    }
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

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';

    // Handle youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    // Handle youtu.be/ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // Handle youtube.com/embed/ID
    else if (url.includes('youtube.com/embed/')) {
      return url;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    if (!url) return '';
    if (!url.includes('drive.google.com')) return url;

    // Replace /view, /edit with /preview for embedding
    let cleanUrl = url.split('?')[0]; // Remove query params
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

    if (cleanUrl.endsWith('/view') || cleanUrl.endsWith('/edit')) {
      return cleanUrl.replace(/\/view$|\/edit$/, '/preview');
    }

    // Handle sharing links that don't end in /view
    if (cleanUrl.includes('/d/')) {
      const parts = cleanUrl.split('/d/');
      const fileId = parts[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return url;
  };

  // Filter items based on active tab
  const filteredItems = items.filter(item => {
    if (activeTab === 'read') return ['Guide', 'Article', 'Worksheet'].includes(item.type);
    if (activeTab === 'listen') return ['Audio'].includes(item.type);
    if (activeTab === 'watch') return ['Video'].includes(item.type);
    return false;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-secondary)] p-6 md:p-12 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div onClick={handleAdminToggle} className="cursor-default select-none">
          <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
            Self-Help Library
            {isAdmin && <span className="text-[10px] ml-2 text-red-500 font-black">ADMIN MODE</span>}
          </h1>
          <p className="text-base text-[var(--text-muted)] font-medium mt-2 max-w-lg italic">
            Curated tools to help you rethink, rewire, and renew at your own pace.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-[var(--bg-card)] p-1.5 rounded-[2rem] border border-[var(--border)] flex shadow-2xl shadow-[var(--shadow-color)]">
          <button
            onClick={() => setActiveTab('read')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'read'
              ? 'bg-[#00538e] text-white shadow-lg shadow-[#00538e]/20'
              : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'
              }`}
          >
            <BookOpen className="w-4 h-4" /> Read
          </button>
          <button
            onClick={() => setActiveTab('listen')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'listen'
              ? 'bg-[#0AA390] text-white shadow-lg shadow-[#0AA390]/20'
              : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'
              }`}
          >
            <Headphones className="w-4 h-4" /> Listen
          </button>
          <button
            onClick={() => setActiveTab('watch')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'watch'
              ? 'bg-[#993366] text-white shadow-lg shadow-[#993366]/20'
              : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'
              }`}
          >
            <Video className="w-4 h-4" /> Watch
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="text-center py-12 text-[var(--text-dim)] font-black uppercase tracking-widest text-[12px] animate-pulse">Loading library resources...</div>
      ) : (
        <div className="grid gap-6">

          {/* --- READ TAB --- */}
          {activeTab === 'read' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* READ ADMIN PANEL */}
              {isAdmin && (
                <div className="bg-[#00538e]/5 border-2 border-dashed border-[#00538e]/30 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00538e]/10 rounded-full flex items-center justify-center text-[#00538e]"><Edit3 className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-black uppercase text-[12px] tracking-widest text-[var(--text-primary)]">Add Read Content</h4>
                        <p className="text-[11px] text-[var(--text-muted)] italic">Upload a file to Vercel Blob or paste a Google Drive / external URL.</p>
                      </div>
                    </div>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="p-2 rounded-xl border border-[#00538e]/30 text-[#00538e] hover:bg-[#00538e] hover:text-white transition-all">
                      {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="space-y-4 pt-4 border-t border-[#00538e]/20">
                      {/* Article file upload */}
                      <div className="flex items-center gap-4">
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { setAddFormTab('read'); handleArticleUpload(e); }} className="hidden" id="article-upload" disabled={isUploadingArticle} />
                        <label htmlFor="article-upload" className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-pointer transition-all ${isUploadingArticle ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#00538e] text-white hover:bg-[#004272] shadow-lg shadow-[#00538e]/20'}`}>
                          {isUploadingArticle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {isUploadingArticle ? 'Uploading...' : 'Upload PDF/Doc to Blob'}
                        </label>
                        {articleUploadMessage && <span className="text-[11px] font-black text-[#0AA390] uppercase tracking-widest">{articleUploadMessage}</span>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} placeholder="Title *" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#00538e] transition-all" />
                        <input value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} placeholder="Category" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#00538e] transition-all" />
                        <select value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value}))} className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#00538e] transition-all">
                          <option value="Article">Article</option>
                          <option value="Guide">Guide</option>
                          <option value="Worksheet">Worksheet</option>
                        </select>
                        <input value={formData.read_time} onChange={e => setFormData(p => ({...p, read_time: e.target.value}))} placeholder="Read time (e.g. 5 min)" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#00538e] transition-all" />
                        <input value={formData.content_url} onChange={e => setFormData(p => ({...p, content_url: e.target.value}))} placeholder="Content URL * (blob or Google Drive)" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#00538e] transition-all col-span-2" />
                        <input value={formData.thumbnail_url} onChange={e => setFormData(p => ({...p, thumbnail_url: e.target.value}))} placeholder="Thumbnail URL (optional)" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#00538e] transition-all" />
                        <select value={formData.min_tier} onChange={e => setFormData(p => ({...p, min_tier: e.target.value}))} className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#00538e] transition-all">
                          <option value="free">Free</option>
                          <option value="tier2">Tier 2</option>
                          <option value="tier3">Tier 3</option>
                        </select>
                      </div>

                      {formMessage && <p className={`text-[11px] font-black uppercase tracking-widest ${formMessage.startsWith('✓') ? 'text-[#0AA390]' : 'text-red-400'}`}>{formMessage}</p>}
                      <button onClick={() => { setAddFormTab('read'); handleAddLibraryItem(); }} disabled={formSaving} className="flex items-center gap-2 px-8 py-3 bg-[#00538e] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#004272] shadow-lg shadow-[#00538e]/20 transition-all disabled:opacity-60">
                        {formSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save to Library
                      </button>
                    </div>
                  )}
                </div>
              )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => {
                const locked = isLocked(item.min_tier);
                return (
                  <div key={item.id} className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className="flex items-center gap-6 mb-6">
                      {item.thumbnail_url ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
                          <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-[#00538e]/10 rounded-2xl flex items-center justify-center text-[#00538e] group-hover:scale-110 transition-transform shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1 rounded-md">
                        {item.type}
                      </span>
                      {locked && <Lock className="w-4 h-4 text-[#F39904]" />}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[12px] text-[var(--text-dim)] font-black uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {item.read_time}
                    </p>
                    <button
                      disabled={locked}
                      onClick={() => !locked && item.content_url && setSelectedDoc(item)}
                      className={`w-full mt-8 py-4 rounded-2xl border font-black uppercase text-[12px] tracking-widest transition-all flex items-center justify-center gap-2 ${locked
                        ? 'border-[var(--border)] text-[var(--text-dim)] cursor-not-allowed'
                        : 'border-[var(--border)] text-[#00538e] hover:border-[#00538e] hover:bg-[#00538e] hover:text-white'
                        }`}
                    >
                      {item.type === 'Worksheet' ? <Download className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      {locked ? 'Locked' : (item.type === 'Worksheet' ? 'Open Worksheet' : 'Read Now')}
                    </button>
                  </div>
                );
              })}
            </div>
            </div>
          )}

          {/* --- LISTEN TAB --- */}
          {activeTab === 'listen' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* ADMIN UPLOAD SECTION */}
              {isAdmin && (
                <div className="bg-white/50 border-2 border-dashed border-[#0AA390]/30 rounded-[2.5rem] p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-[#0AA390]/10 rounded-full flex items-center justify-center mx-auto text-[#0AA390]">
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Upload Audio to Vercel Blob</h4>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-widest">
                      {uploadMessage || "Select an MP3 to get a permanent URL for Supabase"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="audio-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="audio-upload"
                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer ${isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#0AA390] text-white hover:bg-[#0AA390]/90 shadow-lg shadow-[#0AA390]/20'
                      }`}
                  >
                    {isUploading ? "Uploading..." : "Select Audio File"}
                  </label>
                </div>
              )}

              {filteredItems.map((track) => {
                const locked = isLocked(track.min_tier);
                const isPlaying = playingTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-8 bg-[var(--bg-card)] rounded-[2.5rem] border transition-all ${isPlaying
                      ? 'border-[#0AA390] shadow-xl shadow-[#0AA390]/10 ring-1 ring-[#0AA390]/20'
                      : 'border-[var(--border)] shadow-sm hover:border-[#475569]'
                      }`}
                  >
                    <div className="flex items-center gap-8">
                      <button
                        onClick={() => !locked && togglePlay(track)}
                        disabled={locked}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${locked
                          ? 'bg-[var(--bg-primary)] text-[var(--text-dim)] cursor-not-allowed'
                          : isPlaying
                            ? 'bg-[#0AA390] text-white shadow-xl shadow-[#0AA390]/20 scale-110'
                            : 'bg-[var(--bg-primary)] border border-[var(--border)] text-[#0AA390] hover:bg-[#0AA390] hover:text-white'
                          }`}
                      >
                        {locked ? <Lock className="w-7 h-7" /> : isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`text-2xl font-bold ${isPlaying ? 'text-[#0AA390]' : 'text-[var(--text-primary)]'}`}>
                            {track.title}
                          </h3>
                          {isPlaying && <Volume2 className="w-4 h-4 text-[#0AA390] animate-bounce" />}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                            {track.category}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                          <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* WATCH ADMIN PANEL */}
              {isAdmin && (
                <div className="bg-[#993366]/5 border-2 border-dashed border-[#993366]/30 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#993366]/10 rounded-full flex items-center justify-center text-[#993366]"><Link2 className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-black uppercase text-[12px] tracking-widest text-[var(--text-primary)]">Add YouTube Video</h4>
                        <p className="text-[11px] text-[var(--text-muted)] italic">Paste a YouTube URL and fill in the details — no Supabase console needed.</p>
                      </div>
                    </div>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="p-2 rounded-xl border border-[#993366]/30 text-[#993366] hover:bg-[#993366] hover:text-white transition-all">
                      {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="space-y-4 pt-4 border-t border-[#993366]/20">
                      <div className="grid md:grid-cols-2 gap-4">
                        <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} placeholder="Video Title *" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#993366] transition-all" />
                        <input value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))} placeholder="Category (e.g. Mindfulness)" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#993366] transition-all" />
                        <input 
                          value={formData.content_url} 
                          onChange={e => {
                            const url = e.target.value;
                            let newThumb = formData.thumbnail_url;
                            
                            // Auto-extract YouTube thumbnail
                            if (url.includes('youtube.com/watch?v=')) {
                              const vid = url.split('v=')[1].split('&')[0];
                              newThumb = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
                            } else if (url.includes('youtu.be/')) {
                              const vid = url.split('youtu.be/')[1].split('?')[0];
                              newThumb = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
                            }
                            
                            setFormData(p => ({...p, content_url: url, thumbnail_url: newThumb}));
                          }} 
                          placeholder="YouTube URL * (youtube.com/watch?v=...)" 
                          className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#993366] transition-all col-span-2" 
                        />
                        <input value={formData.thumbnail_url} onChange={e => setFormData(p => ({...p, thumbnail_url: e.target.value}))} placeholder="Thumbnail URL (optional)" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#993366] transition-all" />
                        <input value={formData.duration} onChange={e => setFormData(p => ({...p, duration: e.target.value}))} placeholder="Duration (e.g. 12 min)" className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#993366] transition-all" />
                        <select value={formData.min_tier} onChange={e => setFormData(p => ({...p, min_tier: e.target.value}))} className="px-5 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] text-sm outline-none focus:border-[#993366] transition-all">
                          <option value="free">Free</option>
                          <option value="tier2">Tier 2</option>
                          <option value="tier3">Tier 3</option>
                        </select>
                      </div>

                      {formMessage && <p className={`text-[11px] font-black uppercase tracking-widest ${formMessage.startsWith('✓') ? 'text-[#0AA390]' : 'text-red-400'}`}>{formMessage}</p>}
                      <button onClick={() => { setAddFormTab('watch'); handleAddLibraryItem(); }} disabled={formSaving} className="flex items-center gap-2 px-8 py-3 bg-[#993366] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#7a2952] shadow-lg shadow-[#993366]/20 transition-all disabled:opacity-60">
                        {formSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Add Video to Library
                      </button>
                    </div>
                  )}
                </div>
              )}

            <div className="grid md:grid-cols-2 gap-8">
              {filteredItems.length === 0 && <div className="col-span-2 text-center text-[var(--text-dim)] py-12 font-black uppercase text-[12px] tracking-widest">No video content available yet.</div>}
              {filteredItems.map((video) => {
                const locked = isLocked(video.min_tier);
                return (
                  <div key={video.id} className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                    {/* Thumbnail */}
                    <div
                      onClick={() => !locked && setSelectedVideo(video)}
                      className={`aspect-video bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity cursor-pointer shadow-inner ${locked ? 'cursor-not-allowed' : ''}`}
                    >
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : null}

                      {/* Overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center ${video.thumbnail_url ? 'bg-black/20 group-hover:bg-black/40 transition-colors' : ''}`}>
                        {locked ? (
                          <Lock className="w-10 h-10 text-white drop-shadow-lg" />
                        ) : (
                          <Play className="w-12 h-12 text-white fill-current drop-shadow-xl scale-100 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] bg-[#993366] px-3 py-1.5 rounded-lg shadow-lg shadow-[#993366]/20">
                        {video.category || 'Video'}
                      </span>
                      <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {video.duration}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight mb-6">
                      {video.title}
                    </h3>

                    <button
                      disabled={locked}
                      onClick={() => !locked && setSelectedVideo(video)}
                      className={`w-full py-4 rounded-2xl border font-black uppercase text-[12px] tracking-widest transition-all flex items-center justify-center gap-2 ${locked
                        ? 'border-[var(--border)] text-[var(--text-dim)] cursor-not-allowed'
                        : 'border-[var(--border)] text-[#993366] hover:border-[#993366] hover:bg-[#993366] hover:text-white'
                        }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {locked ? 'Locked' : 'Watch Now'}
                    </button>
                  </div>
                );
              })}
            </div>
            </div>
          )}

        </div>
      )
      }

      {/* VIDEO MODAL */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-6 md:p-16 animate-in fade-in duration-300"
          onClick={() => setSelectedVideo(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all font-bold"
            >
              ✕
            </button>
            <iframe
              src={getYouTubeEmbedUrl(selectedVideo.content_url || '')}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* DOCUMENT MODAL */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-6 md:p-16 animate-in fade-in duration-300"
          onClick={() => setSelectedDoc(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedDoc.title}</h3>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#00538e] mt-1">{selectedDoc.type}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center hover:bg-[#00538e] hover:text-white transition-all font-bold"
              >
                ✕
              </button>
            </div>
            <iframe
              src={getGoogleDriveEmbedUrl(selectedDoc.content_url || '')}
              className="w-full flex-1 border-0"
              allow="autoplay"
            />
          </div>
        </div>
      )}
      {/* ADMIN PASSWORD MODAL */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-md p-10 rounded-[3rem] border border-[#0AA390]/30 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-[#0AA390]/10 rounded-full flex items-center justify-center border border-[#0AA390]/30">
                <KeyRound className="w-8 h-8 text-[#0AA390]" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Library Admin Access</h2>
                <p className="text-[12px] text-[var(--text-muted)] italic mt-2">Enter the admin passphrase to manage library content.</p>
              </div>
            </div>
            {adminPasswordError && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-black uppercase tracking-widest">
                <AlertCircle className="w-4 h-4 shrink-0" /> Incorrect passphrase. Access denied.
              </div>
            )}
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter passphrase..."
                value={adminPassword}
                autoFocus
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminPasswordSubmit()}
                className="w-full px-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#0AA390] font-black text-center text-[var(--text-primary)] tracking-widest transition-all"
              />
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setShowAdminPasswordModal(false); setAdminPassword(''); setAdminClickCount(0); setAdminPasswordError(false); }} className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleAdminPasswordSubmit} className="py-4 rounded-2xl bg-[#0AA390] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#088f7d] shadow-xl shadow-[#0AA390]/20 transition-all flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" /> Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
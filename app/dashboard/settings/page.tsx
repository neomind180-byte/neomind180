"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, Save, Loader2, AlertCircle,
  ShieldAlert, Trash2, AlertTriangle, CheckSquare, Square,
  RefreshCcw, Sun, Moon, Lock, Settings, ChevronDown, KeyRound, X
} from 'lucide-react';

const DEV_MODE_PASSWORD = 'NeoAdmin2025';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/components/ThemeProvider';

const coachModes = [
  {
    id: 'Gentle Observer',
    name: 'The Gentle Observer',
    desc: 'Soft, validating, and slow-paced.',
    tier: 'Clarity Foundation'
  },
  {
    id: 'Insightful Mirror',
    name: 'The Insightful Mirror',
    desc: 'Reflective; helps see patterns.',
    tier: 'Clarity Starter'
  },
  {
    id: 'Grounded Guide',
    name: 'The Grounded Guide',
    desc: 'Practical, concrete, and action-oriented.',
    tier: 'Clarity Starter'
  }
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    subscription_tier: 'free',
    preferred_coach_mode: 'Gentle Observer'
  });

  // Chat History Management
  const [history, setHistory] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<'selected' | 'all' | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState<number>(0); // 0: closed, 1: warning, 2: final confirmation
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Secret Dev Mode lock
  const [devModeClicks, setDevModeClicks] = useState(0);
  const [isDevModeUnlocked, setIsDevModeUnlocked] = useState(false);
  const [showDevPasswordModal, setShowDevPasswordModal] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devPasswordError, setDevPasswordError] = useState(false);

  const handleDevPasswordSubmit = () => {
    if (devPassword === DEV_MODE_PASSWORD) {
      setIsDevModeUnlocked(true);
      setShowDevPasswordModal(false);
      setDevPassword('');
      setDevPasswordError(false);
    } else {
      setDevPasswordError(true);
      setDevPassword('');
      setDevModeClicks(0);
      setTimeout(() => setDevPasswordError(false), 3000);
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || '',
            email: user.email || '',
            phone: data.phone || '',
            subscription_tier: data.subscription_tier || 'free',
            preferred_coach_mode: data.preferred_coach_mode || 'Gentle Observer'
          });
        }
      }
      setLoading(false);
    }
    loadData();
    loadHistory();
  }, []);

  async function loadHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: reflections } = await supabase
      .from('reflections')
      .select('id, last_message, created_at')
      .eq('user_id', user.id);

    const { data: coachMsgs } = await supabase
      .from('coach_messages')
      .select('id, subject, created_at')
      .eq('user_id', user.id);

    const combined = [
      ...(reflections || []).map(r => ({ id: r.id, title: r.last_message || 'Neo Reflection', date: r.created_at, table: 'reflections' })),
      ...(coachMsgs || []).map(c => ({ id: c.id, title: c.subject || 'Untitled Discussion', date: c.created_at, table: 'coach_messages' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setHistory(combined);
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === history.length) setSelectedIds([]);
    else setSelectedIds(history.map(h => h.id));
  };

  const handleDelete = async (mode: 'selected' | 'all') => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const idsToDelete = mode === 'all' ? history.map(h => h.id) : selectedIds;

      // Delete from reflections
      const reflectionIds = history.filter(h => h.table === 'reflections' && idsToDelete.includes(h.id)).map(h => h.id);
      if (reflectionIds.length > 0) {
        await supabase.from('reflections').delete().in('id', reflectionIds);
      }

      // Delete from coach_messages
      const coachIds = history.filter(h => h.table === 'coach_messages' && idsToDelete.includes(h.id)).map(h => h.id);
      if (coachIds.length > 0) {
        await supabase.from('coach_messages').delete().in('id', coachIds);
      }

      setMessage({ text: "History purged successfully.", type: 'success' });
      setSelectedIds([]);
      setShowDeleteModal(null);
      await loadHistory();
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to delete history.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (updates: Partial<typeof profile>) => {
    setSaving(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Just mock the update locally if there is no user session (super helpful for local UI testing)
        setProfile(prev => ({ ...prev, ...updates }));
        setMessage({ text: "Simulated save (No active user session detected in local dev).", type: 'success' });
        
        if (updates.subscription_tier) {
            setTimeout(() => window.location.reload(), 1500);
        }
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setProfile(prev => ({ ...prev, ...updates }));
      setMessage({ text: "Changes saved successfully.", type: 'success' });

      // If subscription_tier changed, reload to update sidebar etc.
      if (updates.subscription_tier) {
        window.location.reload();
      }

    } catch (error: any) {
      console.error("Profile Save Exception:", error);
      setMessage({ text: error.message || "Failed to save changes.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDowngrade = async () => {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/payfast/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planName: userPlan })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to downgrade");

      setProfile(prev => ({ ...prev, subscription_tier: 'free' }));
      setMessage({ text: "You've been downgraded to the free plan. We have received your cancellation request.", type: 'success' });
      setShowDowngradeModal(false);
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to downgrade.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.toUpperCase() !== 'DELETE') return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete account");

      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to delete account.", type: 'error' });
      setShowAccountDeleteModal(0);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-[var(--text-dim)] font-black uppercase tracking-widest text-[12px] animate-pulse">Loading Settings...</div>;

  const userPlan = profile.subscription_tier === 'free' ? 'Clarity Foundation' : profile.subscription_tier === 'starter' ? 'Clarity Starter' : profile.subscription_tier === 'builder' ? 'Confidence Builder' : 'Compassion Catalyst';

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-700">

      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors font-black uppercase text-[12px] tracking-widest group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Settings</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium italic">Manage your profile, coach style, and application preferences.</p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[#0AA390] bg-[#0AA390]/10 px-4 py-2 rounded-full border border-[#0AA390]/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </div>
        )}
      </div>

      {message && (
        <div className={`p-5 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-[#0AA390]/10 text-[#0AA390] border border-[#0AA390]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* --- PROFILE SECTION --- */}
      <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-[3.5rem] border border-[var(--border)] shadow-2xl shadow-[var(--shadow-color)] space-y-10">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#00538e]" />
          <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Profile & Identity</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Full Name</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                onBlur={() => handleSave({ full_name: profile.full_name })}
                className="w-full pl-14 pr-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#00538e] font-medium text-[var(--text-primary)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                onBlur={() => handleSave({ phone: profile.phone })}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-14 pr-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#00538e] font-medium text-[var(--text-primary)] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <input
                type="text"
                disabled
                value={profile.email}
                className="w-full pl-14 pr-6 py-4 bg-[var(--bg-input)]/50 border border-[var(--border)] rounded-2xl font-medium text-[var(--text-dim)] cursor-not-allowed italic"
              />
            </div>
          </div>
          <div className="px-4">
            <Link
              href="/forgot-password"
              className="text-[11px] font-black underline uppercase tracking-widest text-[#00538e] hover:text-[#0AA390] transition-colors"
            >
              Update Email or Password →
            </Link>
            <p className="text-[10px] text-[var(--text-muted)] italic mt-2">
              For security, email updates require a verification link sent to your current inbox.
            </p>
          </div>
        </div>

        <div className="flex justify-start px-4">
          <button
            onClick={() => handleSave(profile)}
            disabled={saving}
            className="flex items-center gap-3 px-8 py-4 bg-[#00538e] text-white rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-[#004272] shadow-xl shadow-[#00538e]/20 transition-all disabled:opacity-70 group"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            Save Profile Changes
          </button>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Appearance Mode</h3>
            <p className="text-[12px] text-[var(--text-muted)] italic">Switch between light and dark themes.</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all ${theme === 'dark'
              ? 'bg-[#00538e] text-white border-transparent'
              : 'bg-[#F39904] text-white border-transparent'}`}
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-[12px] font-black uppercase tracking-widest">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </section>

      {/* --- COACH MODE SECTION --- */}
      <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-[3.5rem] border border-[var(--border)] shadow-2xl shadow-[var(--shadow-color)] space-y-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-[#0AA390]" />
          <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Coach Preferences</h2>
        </div>

        <div className="space-y-4">
          {coachModes.map((mode) => {
            const isLocked = mode.tier !== 'Clarity Foundation' && userPlan === 'Clarity Foundation';
            const isActive = profile.preferred_coach_mode === mode.id;

            return (
              <div
                key={mode.id}
                className={`p-8 rounded-3xl border transition-all relative overflow-visible ${isLocked ? 'bg-[var(--bg-input)]/50 border-[var(--border)] opacity-60 cursor-not-allowed' :
                  isActive ? 'border-[#00538e] bg-[var(--bg-input)] shadow-xl' : 'border-[var(--border)] bg-[var(--bg-input)]/30 hover:border-[var(--text-dim)] cursor-pointer'
                  }`}
                onClick={() => !isLocked && handleSave({ preferred_coach_mode: mode.id })}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-black uppercase text-sm tracking-tight mb-1 ${isActive ? 'text-[#0AA390]' : 'text-[var(--text-primary)]'}`}>{mode.name}</h3>
                    <p className="text-[13px] text-[var(--text-muted)] italic">"{mode.desc}"</p>
                  </div>
                  {isLocked ? (
                    <div className="group relative">
                      <Lock className="w-5 h-5 text-[var(--text-dim)]" />
                      <div className="absolute right-0 bottom-full mb-4 hidden group-hover:block w-72 p-6 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[12px] rounded-2xl shadow-2xl z-50">
                        <p className="mb-4 font-black uppercase tracking-widest">Expansion Required</p>
                        <p className="mb-6 text-[var(--text-muted)] italic">Upgrade to {mode.tier} to unlock deeper guidance.</p>
                        <Link href="/pricing" className="block w-full py-3 bg-[#00538e] text-white text-center rounded-xl font-bold uppercase tracking-widest hover:shadow-lg transition-all text-[12px]">Explore Plans</Link>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-[#0AA390] bg-[#0AA390]/10' : 'border-[var(--border)]'}`}>
                      {isActive && <div className="w-2 h-2 bg-[#0AA390] rounded-full shadow-[0_0_10px_#0AA390]" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- SUBSCRIPTION & DEV SECTION --- */}
      <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-[3.5rem] border border-[var(--border)] shadow-2xl shadow-[var(--shadow-color)] space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <h2 
              className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] cursor-default select-none transition-colors"
              onClick={() => {
                if (isDevModeUnlocked) return;
                const newClicks = devModeClicks + 1;
                setDevModeClicks(newClicks);
                if (newClicks >= 5) {
                  setDevModeClicks(0);
                  setShowDevPasswordModal(true);
                }
              }}
            >
              Subscription Management
            </h2>
            <div className="flex items-center gap-4">
              <div className="px-6 py-2 bg-[#00538e]/10 text-[#00538e] rounded-full text-xs font-black uppercase tracking-[0.2em]">
                Current Tier: {userPlan}
              </div>
              <Link
                href="/pricing"
                className="px-6 py-2 bg-[#0AA390] text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:shadow-lg shadow-[#0AA390]/20 transition-all hover:-translate-y-0.5"
              >
                Change Plan
              </Link>
            </div>
          </div>
        </div>

        {/* DEVELOPER MODE: Tier Switcher (Secret Unlock) */}
        {isDevModeUnlocked && (
          <div className="pt-8 border-t border-[var(--border)] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-5 h-5 text-[#F39904]" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Developer Mode (Unlocked)</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['free', 'starter', 'builder', 'catalyst'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleSave({ subscription_tier: tier })}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${profile.subscription_tier === tier
                    ? 'border-[#00538e] bg-[#00538e] text-white shadow-lg shadow-[#00538e]/20'
                    : 'border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-dim)] hover:border-[var(--text-dim)] hover:text-[var(--text-muted)]'
                    }`}
                >
                  {tier === 'free' ? 'Foundation' : tier === 'starter' ? 'Starter' : tier === 'builder' ? 'Builder' : 'Catalyst'}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* --- DOWNGRADE SECTION (Visible only if paid) --- */}
      {profile.subscription_tier !== 'free' && (
        <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-[3.5rem] border border-[var(--border)] shadow-2xl shadow-[var(--shadow-color)] space-y-4">
          <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Cancel / Downgrade Subscription</h2>
          <p className="text-[12px] text-[var(--text-muted)] italic">Switch back to the free Clarity Foundation plan and cancel future billing. You'll lose access to premium coaching, AI reflections, and community circles.</p>
          <button
            onClick={() => setShowDowngradeModal(true)}
            className="px-8 py-3 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-dim)] font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 mt-4"
          >
            Cancel Subscription & Downgrade <ChevronDown className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* --- CHAT HISTORY SECTION --- */}
      <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-[3.5rem] border border-red-500/10 shadow-2xl shadow-[var(--shadow-color)] space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-red-400">Manage Chat History</h2>
            <p className="text-[12px] text-[var(--text-dim)] font-black uppercase tracking-widest">Wipe your conversations with Neo & Coaches</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadHistory()}
              className="p-3 bg-[var(--bg-input)] text-[var(--text-dim)] hover:text-[#0AA390] rounded-xl border border-[var(--border)] transition-colors"
              title="Refresh History"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal('all')}
              disabled={history.length === 0}
              className="px-6 py-3 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest border border-red-400/20 transition-all disabled:opacity-20"
            >
              Purge All
            </button>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--text-muted)]"
              >
                {selectedIds.length === history.length ? <CheckSquare className="w-4 h-4 text-[#0AA390]" /> : <Square className="w-4 h-4" />}
                {selectedIds.length === history.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setShowDeleteModal('selected')}
                  className="text-[11px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${selectedIds.includes(item.id)
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-[var(--bg-input)] border-[var(--border)] hover:border-[var(--text-dim)]'
                    }`}
                >
                  <div className="shrink-0">
                    {selectedIds.includes(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-red-500" />
                    ) : (
                      <Square className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-tight truncate">{item.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${item.table === 'reflections' ? 'bg-[#0AA390]/10 text-[#0AA390]' : 'bg-[#00538e]/10 text-[#00538e]'
                        }`}>
                        {item.table === 'reflections' ? 'Neo AI' : 'Coach'}
                      </span>
                      <span className="text-[10px] text-[var(--text-dim)] font-black uppercase">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center bg-[var(--bg-input)] rounded-3xl border border-dashed border-[var(--border)]">
            <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">No conversation history found</p>
          </div>
        )}
      </section>

      {/* --- DANGER ZONE SECTION --- */}
      <section className="p-8 md:p-12 rounded-[3.5rem] border border-red-500/30 bg-red-500/5 shadow-2xl shadow-red-500/5 space-y-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-red-500">Danger Zone</h2>
        </div>
        <p className="text-[12px] text-[var(--text-muted)] italic font-medium">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button
          onClick={() => setShowAccountDeleteModal(1)}
          className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete My Account
        </button>
      </section>

      {/* --- DOWNGRADE CONFIRMATION MODAL --- */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-lg p-10 rounded-[3rem] border border-[var(--border)] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Downgrade to Free Plan?</h2>
              <div className="text-sm text-[var(--text-secondary)] text-left space-y-4 leading-relaxed font-medium bg-[var(--bg-input)]/30 p-6 rounded-2xl italic border border-[var(--border)]">
                <p>You're about to downgrade from <span className="text-[#00538e] font-black">{profile.subscription_tier === 'tier3' ? 'Deep Coach' : 'Coaching Access'}</span> to the free Basic Self-Help plan.</p>
                <div className="space-y-2">
                  <p className="font-bold text-red-400 not-italic uppercase tracking-widest text-[10px]">What you'll lose:</p>
                  <ul className="list-disc list-inside text-[12px] space-y-1 ml-2">
                    <li>Access to Ask-the-Coach (async text coaching)</li>
                    <li>Weekly AI Reflection sessions</li>
                    <li>Deep-Dive Circles (live group sessions)</li>
                    {profile.subscription_tier === 'tier3' && <li>1:1 coaching sessions</li>}
                    <li>Advanced insights and trends</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-[#0AA390] not-italic uppercase tracking-widest text-[10px]">What you'll keep:</p>
                  <ul className="list-disc list-inside text-[12px] space-y-1 ml-2">
                    <li>All self-help content (journaling, mindfulness tools)</li>
                    <li>Basic daily check-ins and tracking</li>
                    <li>Your historical data and progress</li>
                  </ul>
                </div>
                <p className="mt-4 text-[11px]">Your current billing cycle will continue until the end of your current period, then you'll be moved to the free plan.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDowngrade}
                disabled={actionLoading}
                className="py-4 rounded-2xl bg-orange-500 text-white text-[12px] font-black uppercase tracking-widest hover:bg-orange-600 shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                Yes, Downgrade to Free
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ACCOUNT DELETE CONFIRMATION MODAL 1 --- */}
      {showAccountDeleteModal === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-lg p-10 rounded-[3rem] border border-red-500/30 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-400/10 rounded-full flex items-center justify-center mx-auto border border-red-400/20">
              <AlertTriangle className="w-10 h-10 text-red-400 animate-pulse" />
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Delete Your Account?</h2>
              <div className="text-sm text-[var(--text-secondary)] text-left space-y-4 leading-relaxed font-medium bg-red-500/5 p-6 rounded-2xl italic border border-red-500/10">
                <p className="font-black text-red-500 not-italic uppercase tracking-widest text-[10px]">⚠️ This action is permanent and cannot be undone.</p>
                <div className="space-y-2">
                  <ul className="list-disc list-inside text-[12px] space-y-1">
                    <li>All your data will be <span className="text-red-500 font-bold">permanently removed</span> (check-ins, sessions, reflections, chat history)</li>
                    <li>Your progress and insights will be lost</li>
                    {(profile.subscription_tier === 'tier2' || profile.subscription_tier === 'tier3') && <li>Your subscription will be cancelled immediately</li>}
                    <li>You will no longer have access to any part of the app</li>
                  </ul>
                </div>
                <p className="text-[11px] mt-4 text-[var(--text-muted)]">If you're experiencing issues or want to take a break, consider downgrading to the free plan instead.</p>
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Are you absolutely sure you want to delete your account?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowAccountDeleteModal(0)}
                className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAccountDeleteModal(2)}
                className="py-4 rounded-2xl bg-red-500 text-white text-[12px] font-black uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                Continue to Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ACCOUNT DELETE CONFIRMATION MODAL 2 (Final) --- */}
      {showAccountDeleteModal === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-md p-10 rounded-[3rem] border border-red-500/30 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Final Confirmation</h2>
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed font-bold uppercase tracking-widest">
                To confirm deletion, please type: <span className="text-red-500">DELETE</span>
              </p>
              <p className="text-[11px] text-[var(--text-muted)] italic">This will permanently erase all your data.</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-red-500 font-black text-center text-[var(--text-primary)] uppercase tracking-widest"
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowAccountDeleteModal(0);
                    setDeleteConfirmationText('');
                  }}
                  className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={actionLoading || deleteConfirmationText.toUpperCase() !== 'DELETE'}
                  className="py-4 rounded-2xl bg-red-600 text-white text-[12px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:grayscale"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- DEV MODE PASSWORD MODAL --- */}
      {showDevPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-md p-10 rounded-[3rem] border border-[#F39904]/30 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-[#F39904]/10 rounded-full flex items-center justify-center border border-[#F39904]/30">
                <KeyRound className="w-8 h-8 text-[#F39904]" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Developer Access</h2>
                <p className="text-[12px] text-[var(--text-muted)] italic mt-2">Enter the admin passphrase to unlock developer mode.</p>
              </div>
            </div>

            {devPasswordError && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-black uppercase tracking-widest animate-in shake-x duration-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Incorrect passphrase. Access denied.
              </div>
            )}

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter passphrase..."
                value={devPassword}
                autoFocus
                onChange={(e) => setDevPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDevPasswordSubmit()}
                className="w-full px-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#F39904] font-black text-center text-[var(--text-primary)] tracking-widest transition-all"
              />
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setShowDevPasswordModal(false); setDevPassword(''); setDevModeClicks(0); setDevPasswordError(false); }}
                  className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleDevPasswordSubmit}
                  className="py-4 rounded-2xl bg-[#F39904] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#d4840a] shadow-xl shadow-[#F39904]/20 transition-all flex items-center justify-center gap-2"
                >
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

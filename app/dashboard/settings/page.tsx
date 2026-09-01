"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, Save, Loader2, AlertCircle,
  ShieldAlert, Trash2, AlertTriangle, CheckSquare, Square,
  RefreshCcw, Sun, Moon, Lock, Settings, ChevronDown, KeyRound, X,
  Download, FileText, Eye, EyeOff
} from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile: authProfile, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    subscription_tier: 'free'
  });

  // Chat History Management
  const [history, setHistory] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<'selected' | 'all' | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState<number>(0); // 0: closed, 1: warning, 2: final confirmation
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Password Change Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      setPasswordSaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ text: "Password updated successfully!", type: 'success' });
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Secret Dev Mode lock
  const [devModeClicks, setDevModeClicks] = useState(0);
  const [isDevModeUnlocked, setIsDevModeUnlocked] = useState(false);
  const [showDevPasswordModal, setShowDevPasswordModal] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devPasswordError, setDevPasswordError] = useState(false);

  const handleDevPasswordSubmit = async () => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: devPassword }),
      });
      if (res.ok) {
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
    } catch {
      setDevPasswordError(true);
      setDevPassword('');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user && authProfile) {
        setProfile({
          full_name: authProfile.full_name || '',
          email: user.email || '',
          phone: authProfile.phone || '',
          subscription_tier: authProfile.subscription_tier || 'free'
        });
        loadHistory(user.id);
      }
      setLoading(false);
    }
  }, [user, authProfile, authLoading]);

  async function loadHistory(userId?: string) {
    const activeUserId = userId || user?.id;
    if (!activeUserId) return;

    const { data: reflections } = await supabase
      .from('reflections')
      .select('id, last_message, created_at')
      .eq('user_id', activeUserId);

    const { data: coachMsgs } = await supabase
      .from('coach_messages')
      .select('id, subject, created_at')
      .eq('user_id', activeUserId);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session found");

      const idsToDelete = mode === 'all' ? [] : selectedIds;

      const response = await fetch('/api/user/purge-history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode,
          ids: idsToDelete
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete history");
      }

      setMessage({ text: "History purged successfully.", type: 'success' });
      setSelectedIds([]);
      setShowDeleteModal(null);
      await loadHistory(user?.id);
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
      await refreshProfile();

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

  const downloadChatHistory = async () => {
    try {
      if (!user) {
        alert("Please log in to export your chat history.");
        return;
      }

      const { data: reflections } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!reflections || reflections.length === 0) {
        alert("No chat reflections found to download.");
        return;
      }

      let markdown = `# NeoMind180 Personal Chat History & Reflections\n`;
      markdown += `Generated on: ${new Date().toLocaleString()}\n`;
      markdown += `User: ${profile.full_name} (${profile.email})\n\n`;
      markdown += `==================================================\n\n`;

      reflections.forEach((ref, index) => {
        markdown += `## Session ${reflections.length - index}: ${ref.last_message || 'Neo Reflection'}\n`;
        markdown += `**Created on**: ${new Date(ref.created_at).toLocaleString()}\n`;
        markdown += `**Mindset Shift**: ${ref.shift_before || 'N/A'} ➔ ${ref.shift_after || 'N/A'}\n\n`;
        
        if (ref.messages && Array.isArray(ref.messages)) {
          ref.messages.forEach((msg: any) => {
            const role = msg.role === 'user' ? 'USER' : 'NEO';
            markdown += `### [${role}] (${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'N/A'})\n${msg.content || msg.text || ''}\n\n`;
          });
        }
        
        if (ref.observation) {
          markdown += `**Neo's Observations**:\n> ${ref.observation}\n\n`;
        }
        
        markdown += `--------------------------------------------------\n\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `NeoMind180_Chat_History_${new Date().toISOString().split('T')[0]}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Clean up object URL to prevent leaks
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Error downloading history:", err);
      alert("Failed to download chat history.");
    }
  };

  const downloadAllData = async () => {
    try {
      if (!user) {
        alert("Please log in to export your data.");
        return;
      }

      const [reflectionsRes, checkinsRes, coachRes] = await Promise.all([
        supabase.from('reflections').select('*').eq('user_id', user.id),
        supabase.from('check_ins').select('*').eq('user_id', user.id),
        supabase.from('coach_messages').select('*').eq('user_id', user.id)
      ]);

      const allData = {
        profile: {
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          subscription_tier: profile.subscription_tier
        },
        reflections: reflectionsRes.data || [],
        check_ins: checkinsRes.data || [],
        coach_messages: coachRes.data || [],
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `NeoMind180_Backup_Data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Clean up object URL to prevent leaks
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Error downloading backup data:", err);
      alert("Failed to download backup data.");
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
      setMessage({ text: "Your subscription has been cancelled. We have received your cancellation request.", type: 'success' });
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

  const userPlan = profile.subscription_tier === 'free' ? '7-Day Free Trial' : 'Full Plan';

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
          <div className="px-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordError(null);
                setNewPassword('');
                setConfirmNewPassword('');
              }}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#00538e] hover:text-[#0AA390] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" /> Change Password →
            </button>
            <p className="text-[10px] text-[var(--text-muted)] italic">
              Update your account password anytime directly from here.
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
              {profile.subscription_tier === 'free' && (
                <Link
                  href="/pricing"
                  className="px-6 py-2 bg-[#0AA390] text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:shadow-lg shadow-[#0AA390]/20 transition-all hover:-translate-y-0.5"
                >
                  Change Plan
                </Link>
              )}
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

            <div className="grid grid-cols-2 gap-4">
              {['free', 'starter'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleSave({ subscription_tier: tier })}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${profile.subscription_tier === tier
                    ? 'border-[#00538e] bg-[#00538e] text-white shadow-lg shadow-[#00538e]/20'
                    : 'border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-dim)] hover:border-[var(--text-dim)] hover:text-[var(--text-muted)]'
                    }`}
                >
                  {tier === 'free' ? 'Free Trial' : 'Full Plan'}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
       {/* --- DOWNGRADE SECTION (Visible only if paid) --- */}
      {profile.subscription_tier !== 'free' && (
        <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-[3.5rem] border border-[var(--border)] shadow-2xl shadow-[var(--shadow-color)] space-y-4">
          <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Cancel Subscription</h2>
          <p className="text-[12px] text-[var(--text-muted)] italic leading-relaxed">
            Warning: You&apos;ll lose all access to the application! If you are serious, you can download your data before proceeding.
          </p>
          <button
            onClick={() => setShowDowngradeModal(true)}
            className="px-8 py-3 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-dim)] font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 mt-4"
          >
            Cancel Subscription <ChevronDown className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* --- DATA EXPORT SECTION --- */}
      <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-[3.5rem] border border-[var(--border)] shadow-2xl shadow-[var(--shadow-color)] space-y-6">
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6 text-[#0AA390]" />
          <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Data Backup & Export</h2>
        </div>
        <p className="text-[12px] text-[var(--text-muted)] italic leading-relaxed">
          Your privacy and data ownership are our top priorities. Download a complete archive of your reflections, chats, check-ins, and analytics at any time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={downloadChatHistory}
            className="flex-1 px-8 py-4.5 rounded-2xl bg-[#00538e] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#004272] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#00538e]/10"
          >
            <FileText className="w-4 h-4" /> Export Chat History (.MD)
          </button>
          <button
            onClick={downloadAllData}
            className="flex-1 px-8 py-4.5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-dim)] font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Complete Archive (.JSON)
          </button>
        </div>
      </section>

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

      {/* --- CHAT HISTORY DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-md p-10 rounded-[3rem] border border-red-500/20 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                {showDeleteModal === 'all' ? 'Purge All History?' : 'Delete Selected History?'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium italic">
                {showDeleteModal === 'all'
                  ? 'This will permanently delete all your conversation history with Neo and Coaches. This action is irreversible.'
                  : `This will permanently delete the ${selectedIds.length} selected conversation items from your history. This action is irreversible.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={actionLoading}
                className="py-4 rounded-2xl bg-red-600 text-white text-[12px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
       {/* --- DOWNGRADE CONFIRMATION MODAL --- */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-lg p-10 rounded-[3rem] border border-[var(--border)] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Cancel Subscription?</h2>
              <div className="text-sm text-[var(--text-secondary)] text-left space-y-4 leading-relaxed font-medium bg-[var(--bg-input)]/30 p-6 rounded-2xl italic border border-[var(--border)] animate-in fade-in duration-500">
                <p className="text-red-400 font-bold not-italic">
                  ⚠️ WARNING: Canceling your subscription will immediately lock you out of all features on NeoMind180 at the end of your billing cycle.
                </p>
                <p>
                  You will lose all access to Guided Reflections with Neo AI, circles, community support, and asynchronous chat with Coach Emmeline. If you are serious about proceeding, please make sure you have exported your reflection history and backup data first.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleDowngrade}
                disabled={actionLoading}
                className="py-4 rounded-2xl bg-red-600 text-white text-[12px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Yes, Cancel Subscription
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

      {/* --- CHANGE PASSWORD MODAL --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] w-full max-w-md p-10 rounded-[3rem] border border-[var(--border)] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-[#00538e]/10 rounded-full flex items-center justify-center border border-[#00538e]/20 text-[#00538e]">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Change Password</h2>
                <p className="text-[12px] text-[var(--text-muted)] italic mt-1">Set a new strong password for your account.</p>
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-black uppercase tracking-widest animate-in shake-x duration-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">
                  New Password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#00538e] text-[var(--text-primary)] font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[#00538e] transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">
                  Confirm New Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#00538e] text-[var(--text-primary)] font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="py-4 rounded-2xl border border-[var(--border)] text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="py-4 rounded-2xl bg-[#00538e] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#004272] shadow-xl shadow-[#00538e]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

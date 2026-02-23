"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/components/ThemeProvider';
import { User, Mail, Phone, Save, Loader2, AlertCircle, ShieldAlert, Trash2, AlertTriangle, CheckSquare, Square, RefreshCcw, Sun, Moon } from 'lucide-react';

export default function ProfilePage() {
    const { theme, toggleTheme } = useTheme();
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

    useEffect(() => {
        async function loadProfile() {
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
                        subscription_tier: data.subscription_tier || 'free'
                    });
                }
            }
            setLoading(false);
        }
        loadProfile();
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

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    subscription_tier: profile.subscription_tier,
                    phone: profile.phone
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage({ text: "Profile updated successfully.", type: 'success' });

            window.location.reload();

        } catch (error: any) {
            console.error(error);
            setMessage({ text: error.message || "Failed to update profile.", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-[var(--text-dim)] font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Profile...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-secondary)] p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-10">

                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">My Profile</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-[var(--text-muted)] font-medium italic">Manage your identity and plan settings.</p>
                        <a
                            href="/pricing"
                            className="px-6 py-2.5 bg-[#0AA390] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:shadow-lg shadow-[#0AA390]/20 transition-all hover:-translate-y-0.5"
                        >
                            Upgrade Plan
                        </a>
                    </div>
                </div>

                {message && (
                    <div className={`p-5 rounded-2xl flex items-center gap-3 text-xs font-bold ${message.type === 'success' ? 'bg-[#0AA390]/10 text-[#0AA390] border border-[#0AA390]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.type === 'error' && <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}

                <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border)] shadow-2xl shadow-[var(--shadow-color)] space-y-8">

                    {/* Identity Section */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Contact Details</h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full pl-14 pr-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#00538e] font-medium text-[var(--text-primary)] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Email Address</label>
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-14 pr-6 py-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#00538e] font-medium text-[var(--text-primary)] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ===== APPEARANCE TOGGLE ===== */}
                    <div className="pt-10 mt-10 border-t border-[var(--border)]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] mb-6">Appearance</h3>
                        <div className="flex items-center justify-between p-5 bg-[var(--bg-input)] rounded-2xl border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? (
                                    <Moon className="w-5 h-5 text-[#00538e]" />
                                ) : (
                                    <Sun className="w-5 h-5 text-[#F39904]" />
                                )}
                                <span className="text-sm font-bold text-[var(--text-primary)]">
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${theme === 'dark'
                                    ? 'bg-[#00538e]'
                                    : 'bg-[#F39904]'
                                    }`}
                            >
                                <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${theme === 'dark' ? 'left-1' : 'left-7'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* DEVELOPER MODE: Tier Switcher */}
                    <div className="pt-10 mt-10 border-t border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-5 h-5 text-[#F39904]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Developer Mode: Test Tiers</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {['free', 'tier2', 'tier3'].map((tier) => (
                                <button
                                    key={tier}
                                    onClick={() => setProfile({ ...profile, subscription_tier: tier })}
                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${profile.subscription_tier === tier
                                        ? 'border-[#00538e] bg-[#00538e] text-white shadow-lg shadow-[#00538e]/20'
                                        : 'border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-dim)] hover:border-[var(--text-dim)] hover:text-[var(--text-muted)]'
                                        }`}
                                >
                                    {tier === 'tier2' ? 'Coaching' : tier === 'tier3' ? 'Deep Coach' : 'Basic Free'}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-[var(--text-dim)] mt-4 italic">
                            *This toggle simulates stripe subscription changes for development purposes.
                        </p>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-5 bg-[#00538e] text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-2xl shadow-[#00538e]/20 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Commit Changes
                        </button>
                    </div>

                </div>

                {/* --- CHAT HISTORY MANAGEMENT --- */}
                <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border border-red-500/10 shadow-2xl shadow-[var(--shadow-color)] space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Manage Chat History</h3>
                            <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">Delete conversations with Neo & Coach</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadHistory()}
                                className="p-3 bg-[var(--bg-input)] text-[var(--text-dim)] hover:text-[#0AA390] rounded-xl border border-[var(--border)] transition-colors"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowDeleteModal('all')}
                                disabled={history.length === 0}
                                className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20 transition-all disabled:opacity-20"
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
                                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--text-muted)]"
                                >
                                    {selectedIds.length === history.length ? <CheckSquare className="w-4 h-4 text-[#0AA390]" /> : <Square className="w-4 h-4" />}
                                    {selectedIds.length === history.length ? 'Deselect All' : 'Select All'}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={() => setShowDeleteModal('selected')}
                                        className="text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2"
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
                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.table === 'reflections' ? 'bg-[#0AA390]/10 text-[#0AA390]' : 'bg-[#00538e]/10 text-[#00538e]'
                                                    }`}>
                                                    {item.table === 'reflections' ? 'Neo AI' : 'Coach'}
                                                </span>
                                                <span className="text-[8px] text-[var(--text-dim)] font-black uppercase">
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
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">No conversation history found</p>
                        </div>
                    )}
                </div>

                {/* --- DELETE CONFIRMATION MODAL --- */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-[var(--bg-card)] w-full max-w-md p-10 rounded-[3rem] border border-red-500/30 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                            </div>

                            <div className="text-center space-y-4">
                                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Critical Warning</h2>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                    Are you sure about deleting your history? <span className="text-red-400 font-bold underline">This action cannot be reversed once it is done!</span>
                                </p>
                                {showDeleteModal === 'selected' && (
                                    <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest">
                                        Deleting {selectedIds.length} selected conversations
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(null)}
                                    className="py-4 rounded-2xl border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteModal)}
                                    disabled={actionLoading}
                                    className="py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
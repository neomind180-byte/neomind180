"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft,
    MessageSquare,
    Send,
    User,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Mail,
    Inbox,
    Users,
    Calendar,
    Plus,
    Trash2,
    X
} from 'lucide-react';

const COACH_ID = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9';

export default function CoachDashboard() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'replied' | 'circles'>('pending');

    // Circle Invites State
    const [circleInvites, setCircleInvites] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newInvite, setNewInvite] = useState({ title: '', description: '', session_date: '', access_link: '' });
    const [inviteSaving, setInviteSaving] = useState(false);

    useEffect(() => {
        checkCoachAccess();
        if (activeTab === 'circles') {
            loadCircleInvites();
        } else {
            loadMessages();
        }
    }, [activeTab]);

    async function checkCoachAccess() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== COACH_ID) {
            // Unauthorized access handled silently for now
        }
    }

    async function loadMessages() {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('coach_messages')
                .select('*')
                .eq('status', activeTab)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setMessages(data || []);
        } catch (err: any) {
            console.error("Error loading messages:", err);
            setError("Failed to load messages");
        } finally {
            setLoading(false);
        }
    }

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;

        setSending(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('coach_messages')
                .update({
                    coach_reply: replyText.trim(),
                })
                .eq('id', selectedMessage.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setReplyText('');

            await loadMessages();

            setTimeout(() => {
                setSuccess(false);
                setSelectedMessage(null);
            }, 2000);

        } catch (err: any) {
            console.error("Error sending reply:", err);
            setError(err.message || "Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    async function loadCircleInvites() {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('circle_invites')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setCircleInvites(data || []);
        } catch (err: any) {
            console.error("Error loading invites:", err);
            setError("Failed to load invites");
        } finally {
            setLoading(false);
        }
    }

    const handleCreateInvite = async () => {
        if (!newInvite.title.trim()) return;
        setInviteSaving(true);
        try {
            // Debug: Log current user ID
            const { data: { user } } = await supabase.auth.getUser();
            console.log("Current user ID:", user?.id);
            console.log("Expected COACH_ID:", COACH_ID);
            console.log("Match:", user?.id === COACH_ID);

            const { error: insertError } = await supabase
                .from('circle_invites')
                .insert({
                    title: newInvite.title,
                    description: newInvite.description || null,
                    session_date: newInvite.session_date || null,
                    access_link: newInvite.access_link
                        ? (newInvite.access_link.startsWith('http') ? newInvite.access_link : `https://${newInvite.access_link}`)
                        : null,
                    created_by: user?.id
                });

            if (insertError) throw insertError;
            setShowCreateModal(false);
            setNewInvite({ title: '', description: '', session_date: '', access_link: '' });
            await loadCircleInvites();
        } catch (err: any) {
            console.error("Error creating invite:", err);
            setError(err.message);
        } finally {
            setInviteSaving(false);
        }
    };

    const handleDeleteInvite = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('circle_invites')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            await loadCircleInvites();
        } catch (err: any) {
            console.error("Error deleting invite:", err);
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-secondary)] flex flex-col">
            {/* Header */}
            <header className="p-8 border-b border-[var(--border)] bg-[var(--bg-primary)] sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)] shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00538e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00538e]/20 border border-white/5">
                            <Inbox className="w-6 h-6 text-[var(--text-primary)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Coach Inbox</h1>
                            <p className="text-[12px] font-black uppercase tracking-widest text-[#0AA390]">Administration</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-[var(--bg-card)] rounded-full p-1 border border-[var(--border)] shadow-sm">
                    {(['pending', 'replied', 'circles'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSelectedMessage(null); }}
                            className={`px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab
                                ? "bg-[#00538e] text-white shadow-lg shadow-[#00538e]/20"
                                : "text-[var(--text-dim)] hover:text-[var(--text-muted)]"
                                }`}
                        >
                            {tab === 'circles' ? 'Circle Invites' : tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-grow flex overflow-hidden h-[calc(100vh-120px)]">
                {activeTab === 'circles' ? (
                    /* Circle Invites Management */
                    <div className="w-full p-12 overflow-y-auto space-y-8">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#0AA390]/10 rounded-2xl flex items-center justify-center border border-[#0AA390]/20">
                                    <Users className="w-6 h-6 text-[#0AA390]" />
                                </div>
                                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Manage Circle Invitations</h2>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#0AA390] text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:shadow-2xl shadow-[#0AA390]/20 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Create Invite
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-[#00538e]" />
                            </div>
                        ) : circleInvites.length === 0 ? (
                            <div className="text-center py-24 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border)]">
                                <Users className="w-16 h-16 text-[var(--text-dim)] mx-auto mb-4" />
                                <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">No active invitations</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {circleInvites.map((invite) => (
                                    <div key={invite.id} className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[3rem] space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">{invite.title}</h3>
                                                {invite.description && <p className="text-base text-[var(--text-muted)]">{invite.description}</p>}
                                                {invite.session_date && (
                                                    <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(invite.session_date).toLocaleString()}
                                                    </div>
                                                )}
                                                {invite.access_link && (
                                                    <a href={invite.access_link} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#0AA390] hover:underline">
                                                        {invite.access_link}
                                                    </a>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteInvite(invite.id)}
                                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-primary)] rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Existing Messages Interface */
                    <>
                        {/* Sidebar List */}
                        <div className="w-full md:w-1/3 border-r border-[var(--border)] bg-[var(--bg-primary)] overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#00538e]" />
                                    <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">Syncing conversations...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 p-12 text-center opacity-30">
                                    <Inbox className="w-12 h-12 text-[var(--text-dim)]" />
                                    <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)]">No {activeTab} messages</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--border)]">
                                    {messages.map((msg) => (
                                        <button
                                            key={msg.id}
                                            onClick={() => { setSelectedMessage(msg); setReplyText(''); setError(null); }}
                                            className={`w-full p-8 text-left transition-all hover:bg-[var(--bg-card)] relative group ${selectedMessage?.id === msg.id ? "bg-[var(--bg-card)] border-l-4 border-[#0AA390]" : "border-l-4 border-transparent"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[12px] font-black text-[#0AA390] uppercase tracking-widest">{msg.user_name}</span>
                                                <span className="text-[11px] text-[var(--text-dim)] font-bold">
                                                    {new Date(msg.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-bold text-[var(--text-primary)] line-clamp-1 mb-2 tracking-tight uppercase">{msg.subject}</h4>
                                            <p className="text-[14px] text-[var(--text-muted)] line-clamp-2 leading-relaxed italic">"{msg.message}"</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Content & Reply Area */}
                        <div className="hidden md:flex flex-1 flex-col bg-[var(--bg-primary)] overflow-y-auto">
                            {selectedMessage ? (
                                <div className="p-12 space-y-8 max-w-5xl mx-auto w-full">
                                    {/* Client Message */}
                                    <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] shadow-xl border border-[var(--border)] space-y-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center border border-[var(--border)]">
                                                    <User className="w-6 h-6 text-[var(--text-muted)]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-[var(--text-primary)] uppercase text-base tracking-tight">{selectedMessage.user_name}</h3>
                                                    <p className="text-[12px] text-[var(--text-dim)] font-bold">{selectedMessage.user_email}</p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border ${activeTab === 'pending' ? 'bg-[#993366]/10 text-[#993366] border-[#993366]/20' : 'bg-[#0AA390]/10 text-[#0AA390] border-[#0AA390]/20'
                                                }`}>
                                                {activeTab === 'pending' ? 'Awaiting Guidance' : 'Compassionate Close'}
                                            </div>
                                        </div>
                                        <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter border-l-4 border-[#00538e] pl-6 py-1">{selectedMessage.subject}</h2>
                                        <div className="text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap bg-[var(--bg-primary)] p-8 rounded-3xl border border-[var(--border)] italic">
                                            {selectedMessage.message}
                                        </div>
                                    </div>

                                    {/* Coach Reply Section */}
                                    {activeTab === 'pending' ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 ml-6">
                                                <MessageSquare className="w-5 h-5 text-[#0AA390]" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Synthesizing Guidance</span>
                                            </div>

                                            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-[3rem] shadow-2xl focus-within:border-[#0AA390] transition-all">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Lead with presence... Offer clarity and a new perspective."
                                                    className="w-full min-h-[300px] p-8 outline-none bg-transparent text-[var(--text-secondary)] text-base leading-relaxed resize-none placeholder:text-[var(--text-dim)]"
                                                />
                                                <div className="flex justify-between items-center p-6 border-t border-[var(--border)]">
                                                    <p className="text-[12px] text-[var(--text-dim)] font-black uppercase tracking-widest italic">
                                                        Sync to Client Email & Profile
                                                    </p>
                                                    <button
                                                        onClick={handleSendReply}
                                                        disabled={!replyText.trim() || sending}
                                                        className="px-14 py-5 bg-[#0AA390] text-white rounded-full font-black uppercase text-[12px] tracking-[0.2em] hover:shadow-2xl shadow-[#0AA390]/20 transition-all disabled:opacity-30 flex items-center justify-center gap-3 hover:-translate-y-1"
                                                    >
                                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Execute Shift</>}
                                                    </button>
                                                </div>
                                            </div>

                                            {success && (
                                                <div className="p-6 bg-[#0AA390]/10 border border-[#0AA390]/20 text-[#0AA390] text-[12px] font-black uppercase tracking-[0.2em] rounded-3xl flex items-center justify-center gap-3 animate-bounce">
                                                    <CheckCircle2 className="w-5 h-5" /> Transmission Complete. Profile Updated.
                                                </div>
                                            )}

                                            {error && (
                                                <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-black uppercase tracking-[0.2em] rounded-3xl flex items-center justify-center gap-3">
                                                    <AlertCircle className="w-5 h-5" /> Error: {error}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 ml-6">
                                                <CheckCircle2 className="w-5 h-5 text-[#0AA390]" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Historical Perspective</span>
                                            </div>
                                            <div className="bg-[var(--bg-card)]/50 border border-[var(--border)] p-10 rounded-[3rem] space-y-6">
                                                <div className="text-base text-[var(--text-muted)] italic leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-[#0AA390]/30">
                                                    {selectedMessage.coach_reply}
                                                </div>
                                                <div className="pt-6 border-t border-[var(--border)] flex justify-between items-center">
                                                    <span className="text-[12px] font-black uppercase text-[var(--text-dim)] tracking-[0.3em]">Lifecycle Complete</span>
                                                    <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                                        {new Date(selectedMessage.replied_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-8 opacity-20 p-12 text-center">
                                    <div className="w-24 h-24 bg-[var(--bg-card)] rounded-[2.5rem] flex items-center justify-center border border-[var(--border)]">
                                        <Mail className="w-10 h-10 text-[var(--text-dim)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-black uppercase tracking-[0.4em] mb-3 text-[var(--text-dim)]">Awaiting Selection</h3>
                                        <p className="text-[12px] text-[var(--text-dim)] max-w-[250px] mx-auto uppercase tracking-widest leading-loose">
                                            Choose a client signal to initiate dialogue.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Mobile view alert */}
            <div className="md:hidden p-8 text-center bg-[var(--bg-card)] m-6 rounded-[2.5rem] border border-[var(--border)] shadow-2xl">
                <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] leading-relaxed">
                    Administration requires expanded viewport resolution.
                </p>
            </div>

            {/* Create Invite Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[var(--bg-card)] w-full max-w-2xl p-10 rounded-[3rem] border border-[var(--border)] shadow-2xl space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Create Circle Invitation</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Title *</label>
                                <input
                                    type="text"
                                    value={newInvite.title}
                                    onChange={(e) => setNewInvite({ ...newInvite, title: e.target.value })}
                                    placeholder="e.g., February Collective Reset"
                                    className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#0AA390] text-[var(--text-primary)] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Description</label>
                                <textarea
                                    value={newInvite.description}
                                    onChange={(e) => setNewInvite({ ...newInvite, description: e.target.value })}
                                    placeholder="Session theme or focus..."
                                    className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#0AA390] text-[var(--text-primary)] transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Session Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={newInvite.session_date}
                                        onChange={(e) => setNewInvite({ ...newInvite, session_date: e.target.value })}
                                        className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#0AA390] text-[var(--text-primary)] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Access Link</label>
                                    <input
                                        type="url"
                                        value={newInvite.access_link}
                                        onChange={(e) => setNewInvite({ ...newInvite, access_link: e.target.value })}
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl outline-none focus:border-[#0AA390] text-[var(--text-primary)] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="py-4 rounded-2xl border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-primary)] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateInvite}
                                disabled={!newInvite.title.trim() || inviteSaving}
                                className="py-4 rounded-2xl bg-[#0AA390] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-2xl shadow-[#0AA390]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {inviteSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Create Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


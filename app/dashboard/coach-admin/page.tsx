"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
    ArrowLeft,
    MessageSquare,
    Send,
    Clock,
    User,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Mail,
    Filter,
    Inbox
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
    const [activeTab, setActiveTab] = useState<'pending' | 'replied'>('pending');

    useEffect(() => {
        checkCoachAccess();
        loadMessages();
    }, [activeTab]);

    async function checkCoachAccess() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== COACH_ID) {
            // For now, if not coach, we just handle loading state or redirect if we were in a production environment
            // console.log("Unauthorized access to coach dashboard");
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
                    // Metadata and status are handled by the DB trigger on_coach_reply_metadata
                })
                .eq('id', selectedMessage.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setReplyText('');

            // Refresh messages
            await loadMessages();

            // Close detail view if desired or keep to show success
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Header */}
            <header className="p-6 md:p-10 border-b border-white bg-white/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-[#00538e] shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00538e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00538e]/10">
                            <Inbox className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#00538e] uppercase tracking-tighter">Coach Inbox</h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0AA390]">Manage Client Relationships</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                    {(['pending', 'replied'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSelectedMessage(null); }}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? "bg-[#00538e] text-white shadow-md"
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-grow flex overflow-hidden h-[calc(100vh-120px)]">
                {/* Sidebar List */}
                <div className="w-full md:w-1/3 border-r border-slate-200 bg-white overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                            <Loader2 className="w-8 h-8 animate-spin text-[#00538e]" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Loading conversations...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-12 text-center opacity-30">
                            <Inbox className="w-12 h-12" />
                            <p className="text-xs font-bold uppercase tracking-widest">No {activeTab} messages</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {messages.map((msg) => (
                                <button
                                    key={msg.id}
                                    onClick={() => { setSelectedMessage(msg); setReplyText(''); setError(null); }}
                                    className={`w-full p-6 text-left transition-all hover:bg-slate-50 relative group ${selectedMessage?.id === msg.id ? "bg-slate-50 border-l-4 border-[#00538e]" : "border-l-4 border-transparent"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-[#00538e] uppercase tracking-widest">{msg.user_name}</span>
                                        <span className="text-[9px] text-slate-400 font-bold">
                                            {new Date(msg.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{msg.subject}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Content & Reply Area */}
                <div className="hidden md:flex flex-1 flex-col bg-slate-50/30 overflow-y-auto">
                    {selectedMessage ? (
                        <div className="p-10 space-y-8 max-w-4xl mx-auto w-full">
                            {/* Client Message */}
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-tight">{selectedMessage.user_name}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold">{selectedMessage.user_email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        {activeTab === 'pending' ? 'Needs Attention' : 'Resolved'}
                                    </div>
                                </div>
                                <h2 className="text-xl font-black text-[#00538e] uppercase tracking-tighter">{selectedMessage.subject}</h2>
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Coach Reply Section */}
                            {activeTab === 'pending' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 ml-4">
                                        <MessageSquare className="w-4 h-4 text-[#0AA390]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Craft your response</span>
                                    </div>

                                    <div className="bg-white border-2 border-[#00538e]/5 focus-within:border-[#00538e]/10 p-2 rounded-[2.5rem] shadow-lg transition-all">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Share your guidance, clarity, and compassion..."
                                            className="w-full min-h-[250px] p-6 outline-none bg-transparent text-sm leading-relaxed resize-none"
                                        />
                                        <div className="flex justify-between items-center p-4">
                                            <p className="text-[10px] text-slate-400 font-medium ml-4 italic">
                                                The user will receive an email notification once you send.
                                            </p>
                                            <button
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim() || sending}
                                                className="px-12 py-4 bg-[#0AA390] text-white rounded-full font-bold uppercase text-xs tracking-widest hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Reply</>}
                                            </button>
                                        </div>
                                    </div>

                                    {success && (
                                        <div className="p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 animate-bounce">
                                            <CheckCircle2 className="w-4 h-4" /> Reply sent! Moving to Resolved tab.
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> {error}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 ml-4">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Previous Response</span>
                                    </div>
                                    <div className="bg-white/50 border border-slate-100 p-8 rounded-[2.5rem] space-y-4">
                                        <div className="text-sm text-slate-500 italic leading-relaxed whitespace-pre-wrap">
                                            {selectedMessage.coach_reply}
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">Closed Conversation</span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Replied on {new Date(selectedMessage.replied_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-6 opacity-30 p-12 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                                <Mail className="w-8 h-8 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Select a conversation</h3>
                                <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                                    Click on a message from the list to view details and send a reply.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile view alert (optional but good for UX) */}
            <div className="md:hidden p-8 text-center bg-white/50 m-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Please use a tablet or desktop to manage your coach inbox.
                </p>
            </div>
        </div>
    );
}

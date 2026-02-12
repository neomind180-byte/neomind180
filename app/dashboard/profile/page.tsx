"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, Phone, Save, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        subscription_tier: 'free'
    });

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
    }, []);

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

    if (loading) return <div className="p-10 text-center text-[#475569] font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Profile...</div>;

    return (
        <div className="min-h-screen bg-[#1a1f2e] font-sans text-[#cbd5e1] p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-10">

                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">My Profile</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-[#94a3b8] font-medium italic">Manage your identity and plan settings.</p>
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

                <div className="bg-[#232938] p-10 rounded-[3rem] border border-[#2d3548] shadow-2xl shadow-black/20 space-y-8">

                    {/* Identity Section */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#475569]">Contact Details</h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-4">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full pl-14 pr-6 py-4 bg-[#1a1f2e] border border-[#2d3548] rounded-2xl outline-none focus:border-[#00538e] font-medium text-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-4">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                                <input
                                    type="text"
                                    disabled
                                    value={profile.email}
                                    className="w-full pl-14 pr-6 py-4 bg-[#1a1f2e]/50 border border-[#2d3548] rounded-2xl font-medium text-[#475569] cursor-not-allowed italic"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#475569] ml-4">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-14 pr-6 py-4 bg-[#1a1f2e] border border-[#2d3548] rounded-2xl outline-none focus:border-[#00538e] font-medium text-white transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DEVELOPER MODE: Tier Switcher */}
                    <div className="pt-10 mt-10 border-t border-[#2d3548]">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-5 h-5 text-[#F39904]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#475569]">Developer Mode: Test Tiers</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {['free', 'tier2', 'tier3'].map((tier) => (
                                <button
                                    key={tier}
                                    onClick={() => setProfile({ ...profile, subscription_tier: tier })}
                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${profile.subscription_tier === tier
                                        ? 'border-[#00538e] bg-[#00538e] text-white shadow-lg shadow-[#00538e]/20'
                                        : 'border-[#2d3548] bg-[#1a1f2e] text-[#475569] hover:border-[#475569] hover:text-[#94a3b8]'
                                        }`}
                                >
                                    {tier === 'tier2' ? 'Coaching' : tier === 'tier3' ? 'Deep Coach' : 'Basic Free'}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-[#475569] mt-4 italic">
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
            </div>
        </div>
    );
}
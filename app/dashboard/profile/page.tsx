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
        email: '', // Read-only usually
        phone: '',
        subscription_tier: 'free'
    });

    // Fetch Profile on Load
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
                        phone: data.phone || '', // Ensure you add 'phone' column to DB if needed
                        subscription_tier: data.subscription_tier || 'free'
                    });
                }
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    // Save Changes
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
                    subscription_tier: profile.subscription_tier, // Updates the tier!
                    phone: profile.phone
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage({ text: "Profile updated successfully.", type: 'success' });

            // Force reload to update Sidebar lock states
            window.location.reload();

        } catch (error: any) {
            console.error(error);
            setMessage({ text: error.message || "Failed to update profile.", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-8">

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-[#00538e] uppercase tracking-tighter">My Profile</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 font-medium">Manage your identity and plan settings.</p>
                        <a
                            href="/pricing"
                            className="px-4 py-2 bg-gradient-to-r from-[#00538e] to-[#0AA390] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                        >
                            Upgrade Plan
                        </a>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'error' && <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">

                    {/* Identity Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</h3>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 ml-3">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#00538e]/10 font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 ml-3">Email Address</label>
                            <div className="relative opacity-70">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    disabled
                                    value={profile.email}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-xl font-medium text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 ml-3">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#00538e]/10 font-medium text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DEVELOPER MODE: Tier Switcher */}
                    <div className="pt-8 mt-8 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-4 h-4 text-[#F39904]" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Developer Mode: Test Tiers</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {['free', 'tier2', 'tier3'].map((tier) => (
                                <button
                                    key={tier}
                                    onClick={() => setProfile({ ...profile, subscription_tier: tier })}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${profile.subscription_tier === tier
                                        ? 'border-[#00538e] bg-[#00538e] text-white'
                                        : 'border-slate-100 text-slate-400 hover:border-slate-300'
                                        }`}
                                >
                                    {tier === 'tier2' ? 'Coaching' : tier === 'tier3' ? 'Deep Coach' : 'Basic Free'}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">
                            *Switching this will instantly unlock/lock features in the Sidebar.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Profile Changes
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
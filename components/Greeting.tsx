"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Greeting() {
    const [greeting, setGreeting] = useState('');
    const [firstName, setFirstName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Determine local time-based greeting
        const hours = new Date().getHours();
        if (hours >= 5 && hours < 12) setGreeting('Good Morning');
        else if (hours >= 12 && hours < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // 2. Fetch user's first name from profiles
        async function fetchUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Start with name from metadata (available immediately)
                    const metadataName = user.user_metadata?.full_name;
                    if (metadataName) setFirstName(metadataName.trim().split(' ')[0]);

                    // Then try to fetch from profile for latest data
                    const { data } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();

                    if (data?.full_name) {
                        const name = data.full_name.trim().split(' ')[0];
                        setFirstName(name);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    return (
        <div className="flex flex-col">
            <h3 className="text-sm md:text-base font-medium text-[var(--text-muted)] tracking-tight">
                {greeting},
            </h3>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter -mt-1">
                {loading ? '...' : firstName || 'Member'}
            </h1>
        </div>
    );
}

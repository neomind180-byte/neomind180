"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function Greeting() {
    const { user, profile, loading: authLoading } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [firstName, setFirstName] = useState('');

    useEffect(() => {
        // 1. Determine local time-based greeting
        const hours = new Date().getHours();
        if (hours >= 5 && hours < 12) setGreeting('Good Morning');
        else if (hours >= 12 && hours < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    useEffect(() => {
        if (user) {
            // Start with name from metadata (available immediately)
            const metadataName = user.user_metadata?.full_name;
            if (metadataName) setFirstName(metadataName.trim().split(' ')[0]);

            // Then try to fetch from profile for latest data
            if (profile?.full_name) {
                const name = profile.full_name.trim().split(' ')[0];
                setFirstName(name);
            }
        }
    }, [user, profile]);

    return (
        <div className="flex flex-col">
            <h3 className="text-sm md:text-base font-medium text-[var(--text-muted)] tracking-tight">
                {greeting},
            </h3>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter -mt-1">
                {authLoading ? '...' : firstName || 'Member'}
            </h1>
        </div>
    );
}

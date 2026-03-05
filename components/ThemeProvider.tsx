"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const loadInitialTheme = async () => {
            try {
                // 1. Check localStorage first (fastest)
                const stored = localStorage.getItem('theme') as Theme | null;
                if (stored) setTheme(stored);

                // 2. Check Supabase if logged in
                const { data: { user } } = await supabase.auth.getUser();

                // Only attempt to fetch profile if we have a user AND the API seems configured
                const hasApiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key';

                if (user && hasApiKey) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('theme')
                        .eq('id', user.id)
                        .single();

                    if (!error && data?.theme) {
                        setTheme(data.theme as Theme);
                    }
                }
            } catch (err) {
                console.error('⚠️ Theme Provider Error:', err);
            } finally {
                setMounted(true);
            }
        };

        loadInitialTheme();
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme, mounted]);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Sync with Supabase if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('profiles')
                .update({ theme: newTheme })
                .eq('id', user.id);
        }
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Intercept benign Supabase refresh token errors in development to prevent Next.js dev overlay from hijacking localhost
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const errorStr = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    if (errorStr.includes('Invalid Refresh Token') || errorStr.includes('Refresh Token Not Found')) {
      console.warn('[Filtered Dev Error]:', ...args);
      return;
    }
    originalError(...args);
  };
}


export interface UserProfile {
  id: string;
  subscription_tier: string;
  theme?: string;
  micro_resets_today?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('nm_user');
        localStorage.removeItem('nm_profile');
        setLoading(false);
        return;
      }

      setUser(session.user);
      localStorage.setItem('nm_user', JSON.stringify(session.user));

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileError && profileData) {
        setProfile(profileData);
        localStorage.setItem('nm_profile', JSON.stringify(profileData));
      }
    } catch (err) {
      console.error('⚠️ Auth Provider Retrieval Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instantly restore last-known user and profile state from local cache on mount
    try {
      const cachedUser = localStorage.getItem('nm_user');
      const cachedProfile = localStorage.getItem('nm_profile');
      if (cachedUser && cachedProfile) {
        setUser(JSON.parse(cachedUser));
        setProfile(JSON.parse(cachedProfile));
        setLoading(false); // Instantly bypass the loading spinner
      }
    } catch (e) {
      console.warn('⚡ LocalStorage session hydration bypassed:', e);
    }

    fetchUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        localStorage.setItem('nm_user', JSON.stringify(session.user));
        // ONLY fetch/refresh the profile on SIGNED_IN, INITIAL_SESSION, or USER_UPDATED events.
        // Doing this on TOKEN_REFRESHED can trigger deadlocks or infinite loops.
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileData) {
            setProfile(profileData);
            localStorage.setItem('nm_profile', JSON.stringify(profileData));
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('nm_user');
        localStorage.removeItem('nm_profile');
      }
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const refreshProfile = async () => {
    if (!user) return;
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileData) {
      setProfile(profileData);
      localStorage.setItem('nm_profile', JSON.stringify(profileData));
    }
  };

  const handleSignOut = useCallback(async (isIdle: boolean = false) => {
    // 1. Immediately clean up client-side states so the UI resets instantly
    setUser(null);
    setProfile(null);

    // 2. Instantly clear cookies & localStorage
    try {
      localStorage.removeItem('nm_user');
      localStorage.removeItem('nm_profile');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      }
      
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.startsWith('sb-')) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname.split('.').slice(-2).join('.') + ';';
        }
      }
    } catch (e) {
      console.error('Error clearing local storage / cookies on signout:', e);
    }

    // 3. Immediately redirect to login
    if (isIdle) {
      router.push('/login?reason=idle');
    } else {
      router.push('/login');
    }

    // 4. Background fire-and-forget server signout (doesn't block execution if session is stale)
    try {
      supabase.auth.signOut().catch(() => {});
    } catch (err) {
      console.error('Error signing out of Supabase in background:', err);
    }
  }, [router]);

  // Inactivity timeout configuration (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleSignOut(true);
      }, INACTIVITY_TIMEOUT);
    };

    // Events that signify user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Initialize the timer
    resetTimer();

    // Attach listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, handleSignOut]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

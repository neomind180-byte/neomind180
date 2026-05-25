"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

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
        // Refresh profile on auth state changes
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
          localStorage.setItem('nm_profile', JSON.stringify(profileData));
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      // Force client clear to prevent stale tokens causing errors
      setUser(null);
      setProfile(null);
      
      // Clear localStorage & cookies starting with sb-
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
        console.error('Error clearing cookies on signout:', e);
      }

      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

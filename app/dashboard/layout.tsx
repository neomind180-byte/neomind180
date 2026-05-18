"use client";

import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Settings, LogOut, Menu, X } from 'lucide-react';
import Notifications from '@/components/Notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout
 * * Provides the structural foundation for the dashboard area.
 * It features a fixed-height sidebar and a scrollable main content area
 * with a consistent header.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0AA390]/30 border-t-[#0AA390] rounded-full animate-spin"></div>
          <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-dim)] animate-pulse">Aligning Sanctuary...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden font-sans relative">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation Component */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Global Dashboard Header */}
        <header className="h-28 bg-[var(--header-accent)]/10 backdrop-blur-md border-b border-[var(--header-accent)]/10 flex items-center justify-between px-8 md:px-12 shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button (Mobile Only) */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 bg-[var(--header-accent)]/5 border border-[var(--header-accent)]/10 text-[var(--header-accent)] rounded-full transition-all"
              aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <h3 className="text-base font-black text-[var(--header-accent)] uppercase tracking-[0.2em]">
              Dashboard
            </h3>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Notifications />
                <Link
                  href="/dashboard/settings"
                  className="p-3 bg-[var(--header-accent)]/5 border border-[var(--header-accent)]/10 text-[var(--header-accent)] hover:bg-[var(--header-accent)]/10 rounded-full transition-all group"
                  aria-label="Settings"
                >
                  <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                </Link>
              </div>

              <div className="h-8 w-[1px] bg-[var(--header-accent)]/20 hidden md:block" />

              <button
                onClick={signOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-[var(--header-accent)]/80 hover:text-[var(--header-accent)] font-black uppercase text-[12px] tracking-widest transition-colors group"
              >
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Sign Out</span>
              </button>
            </div>
            <p className="text-[10px] font-black text-[var(--header-accent)]/40 uppercase tracking-[0.4em] opacity-80 select-none hidden md:block">
              Rethink. Rewire. Renew.
            </p>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
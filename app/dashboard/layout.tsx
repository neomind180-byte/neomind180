import React from 'react';
import Sidebar from '@/components/Sidebar';

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
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation Component */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Global Dashboard Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-10">
          <h1 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Workspace / Overview
          </h1>
          <div className="flex items-center gap-4">
            {/* Global actions or user menu can be placed here */}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
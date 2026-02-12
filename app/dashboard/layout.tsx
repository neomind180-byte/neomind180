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
    <div className="flex h-screen bg-[#1a1f2e] overflow-hidden font-sans">
      {/* Sidebar Navigation Component */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Global Dashboard Header */}
        <header className="h-20 bg-[#1a1f2e] border-b border-[#2d3548] flex items-center justify-between px-8 shrink-0 z-10">
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94a3b8]">
            Workspace / Overview
          </h1>
          <div className="flex items-center gap-4">
            {/* Global actions or user menu can be placed here */}
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
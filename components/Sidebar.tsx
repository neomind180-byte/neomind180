"use client";

import { useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard, BookOpen, MessageSquare, Zap, Settings, LogOut, Heart, History, Lock, Inbox, TrendingUp, HelpCircle
} from "lucide-react";

const navSections = [
  {
    title: "TODAY",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", color: "#00538e" },
      { icon: Heart, label: "Daily Check-In", href: "/dashboard/check-in", color: "#993366" },
      { icon: Zap, label: "Micro-Resets", href: "/dashboard#micro-resets", color: "#0AA390" },
    ]
  },
  {
    title: "REFLECT",
    items: [
      { 
        icon: Zap, 
        label: "Reflect with Neo", 
        subtext: "Explore your thoughts with your AI reflection coach.", 
        href: "/dashboard/reflection", 
        color: "#8E44AD" 
      },
      { icon: History, label: "Shift History", href: "/dashboard/history", color: "#0AA390" },
      { icon: TrendingUp, label: "Insights", href: "/dashboard/insights", color: "#0AA390" },
    ]
  },
  {
    title: "LEARN",
    items: [
      { icon: BookOpen, label: "Self-Help Library", href: "/dashboard/library", color: "#F39904" },
      { icon: HelpCircle, label: "How-To", href: "/dashboard/how-to", color: "#0AA390" },
    ]
  },
  {
    title: "CONNECT",
    items: [
      { 
        icon: MessageSquare, 
        label: "Ask the Coach", 
        subtext: "Send a question to Emmeline when you'd like human coaching guidance.", 
        href: "/dashboard/coach", 
        color: "#4A90E2" 
      },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const COACH_ID = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9';
  const isCoach = user?.id === COACH_ID;

  // Close sidebar on navigation (mobile only)
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname]);

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-[1001] w-72 bg-[var(--bg-primary)] border-r border-[var(--border)] p-6 
      transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:h-screen lg:shrink-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      overflow-y-auto custom-scrollbar
    `}>

      {/* Brand Header */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-[48px] h-[48px] relative shrink-0 bg-white rounded-xl p-1.5 flex items-center justify-center border border-[var(--border)] shadow-sm">
          <Image src="/business-logo.png" alt="NeoMind180" width={36} height={36} className="object-contain" priority />
        </div>
        <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none">NeoMind180</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-6">
        {isCoach && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] ml-3">Administration</h3>
            <Link
              href="/dashboard/coach-admin"
              className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all ${pathname === '/dashboard/coach-admin'
                ? "bg-[#0AA390] text-white shadow-lg shadow-[#0AA390]/20"
                : "bg-[var(--text-primary)]/5 text-[#0AA390] hover:bg-[var(--text-primary)]/10"
                }`}
            >
              <Inbox className="w-4 h-4" />
              <span className="text-[12px] uppercase tracking-wider leading-none">Coach Inbox</span>
            </Link>
          </div>
        )}

        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00538e] ml-3 mb-1">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex flex-col p-3 rounded-2xl font-bold transition-all border group ${isActive
                      ? "bg-[var(--sidebar-hover)] border-[var(--border)] text-[var(--text-primary)] shadow-sm"
                      : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:border-[var(--border)]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
                        style={{ color: item.color }}
                      />
                      <span className="text-[12px] uppercase tracking-wider leading-tight">{item.label}</span>
                    </div>
                    {item.subtext && (
                      <span className="text-[10px] font-medium text-[var(--text-muted)] mt-1 ml-7 leading-snug">
                        {item.subtext}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-[var(--border)] space-y-1 mt-6">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 p-3 rounded-2xl font-bold transition-all group border ${pathname === '/dashboard/settings'
            ? "bg-[#00538e] text-white shadow-lg border-transparent"
            : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] border-transparent"}`}
        >
          <Settings className={`w-4 h-4 ${pathname === '/dashboard/settings' ? "text-white" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"}`} />
          <span className="text-[12px] uppercase tracking-wider leading-none">Settings</span>
        </Link>
        <Link href="/" className="flex items-center gap-3 p-3 rounded-2xl font-bold text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all group">
          <LogOut className="w-4 h-4 text-[var(--text-muted)] group-hover:text-red-400" />
          <span className="text-[12px] uppercase tracking-wider leading-none">Sign Out</span>
        </Link>
      </div>

    </aside>
  );
}

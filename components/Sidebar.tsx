"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { supabase } from '@/lib/supabaseClient';
import {
  LayoutDashboard, BookOpen, MessageSquare, Zap, Users, Star, Settings, LogOut, Heart, History, Lock, User, Inbox
} from "lucide-react";

// define tier levels for easy comparison
const TIER_LEVELS = {
  'free': 0,
  'tier2': 1,
  'tier3': 2
};

const navItems = [
  // Free Features (Level 0)
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", minTier: 0 },
  { icon: Heart, label: "BE-ENOUGH SHIFT", href: "/dashboard/be-enough", minTier: 0 },
  { icon: History, label: "Shift History", href: "/dashboard/history", minTier: 0 },
  { icon: BookOpen, label: "Self-Help Library", href: "/dashboard/library", minTier: 0 },

  // Tier 2 Features (Level 1)
  { icon: MessageSquare, label: "Ask-the-Coach", href: "/dashboard/coach", minTier: 1 },
  { icon: Zap, label: "Reflection with Neo", href: "/dashboard/reflection", minTier: 1 },
  { icon: Users, label: "Deep-Dive Circles", href: "/dashboard/circles", minTier: 1 },

  // Tier 3 Features (Level 2)
  { icon: Star, label: "1:1 Sessions", href: "/dashboard/sessions", minTier: 2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userTier, setUserTier] = useState<string>('free'); // Default to free while loading
  const [isCoach, setIsCoach] = useState(false);
  const COACH_ID = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9';

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsCoach(user.id === COACH_ID);
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (data) setUserTier(data.subscription_tier);
      }
    }
    getUserData();
  }, []);

  const currentLevel = TIER_LEVELS[userTier as keyof typeof TIER_LEVELS] || 0;

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 p-8 sticky top-0 h-screen shrink-0 overflow-y-auto">

      {/* Brand Header */}
      <div className="mb-12 px-4 flex items-center gap-4">
        <div className="w-[60px] h-[60px] relative shrink-0">
          <Image src="/business-logo.png" alt="NeoMind180" width={60} height={60} className="object-contain" priority />
        </div>
        <h2 className="text-xl font-black text-[#00538e] tracking-tighter uppercase leading-none">NeoMind180</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-2">
        {isCoach && (
          <div className="mb-6 space-y-2">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 ml-4 mb-3">Administration</h3>
            <Link
              href="/dashboard/coach-admin"
              className={`flex items-center gap-4 p-4 rounded-[1.5rem] font-bold transition-all ${pathname === '/dashboard/coach-admin'
                ? "bg-[#0AA390] text-white shadow-lg"
                : "bg-[#0AA390]/5 text-[#0AA390] hover:bg-[#0AA390]/10"
                }`}
            >
              <Inbox className="w-5 h-5" />
              <span className="text-[11px] uppercase tracking-widest leading-none">Coach Inbox</span>
            </Link>
          </div>
        )}

        {navItems.map((item) => {
          const isLocked = currentLevel < item.minTier;
          const destination = isLocked ? "/dashboard/upgrade" : item.href;
          const isActive = pathname === item.href;
          const isBeEnough = item.label === "BE-ENOUGH SHIFT";

          return (
            <Link
              key={item.label}
              href={destination}
              className={`flex items-center justify-between p-4 rounded-[1.5rem] font-bold transition-all group ${isActive
                ? (isBeEnough ? "bg-[#993366] text-white shadow-lg" : "bg-[#00538e] text-white shadow-lg")
                : "text-slate-400 hover:bg-slate-50 hover:text-[#00538e]"
                } ${isLocked ? "opacity-60 hover:opacity-100" : ""}`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#00538e]"}`} />
                <span className="text-[11px] uppercase tracking-widest leading-none">{item.label}</span>
              </div>

              {/* Lock Icon Indicator */}
              {isLocked && <Lock className="w-3 h-3 text-[#F39904]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-8 border-t border-slate-50 space-y-2">
        <Link href="/dashboard/settings" className="flex items-center gap-4 p-4 rounded-[1.5rem] font-bold text-slate-400 hover:bg-slate-50 hover:text-[#00538e] transition-all">
          <Settings className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-widest leading-none">Settings</span>
        </Link>
        <Link href="/dashboard/profile" className="flex items-center gap-4 p-4 rounded-[1.5rem] font-bold text-slate-400 hover:bg-slate-50 hover:text-[#00538e] transition-all">
          <User className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-widest leading-none">My Profile</span>
        </Link>
        <Link href="/" className="flex items-center gap-4 p-4 rounded-[1.5rem] font-bold text-slate-400 hover:bg-slate-50 hover:text-[#993366] transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-widest leading-none">Sign Out</span>
        </Link>
      </div>

    </aside>
  );
}
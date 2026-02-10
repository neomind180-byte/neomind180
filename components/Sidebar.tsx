"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Zap, 
  Users, 
  Star,
  Settings, 
  LogOut,
  Heart,
  History // Added for the History link
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Heart, label: "BE-ENOUGH SHIFT", href: "/dashboard/be-enough" }, // Text Fixed
  { icon: History, label: "Shift History", href: "/dashboard/history" },  // New Item
  { icon: BookOpen, label: "Self-Help Library", href: "/dashboard/library" },
  { icon: MessageSquare, label: "Ask-the-Coach", href: "/dashboard/coach" },
  { icon: Zap, label: "Reflection with Neo", href: "/dashboard/reflection" },
  { icon: Users, label: "Deep-Dive Circles", href: "/dashboard/circles" },
  { icon: Star, label: "1:1 Sessions", href: "/dashboard/sessions" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 p-8 sticky top-0 h-screen shrink-0">
      <div className="mb-12 px-4 flex items-center gap-4">
        <div className="w-[60px] h-[60px] relative shrink-0">
          <Image 
            src="/business-logo.png" 
            alt="NeoMind180 Logo" 
            width={60} 
            height={60} 
            className="object-contain" 
            priority
          />
        </div>
        <h2 className="text-xl font-black text-[#00538e] tracking-tighter uppercase leading-none">
          NeoMind180
        </h2>
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isBeEnough = item.label === "BE-ENOUGH SHIFT";
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 p-4 rounded-[1.5rem] font-bold transition-all group ${
                isActive 
                  ? (isBeEnough ? "bg-[#993366] text-white shadow-lg" : "bg-[#00538e] text-white shadow-lg")
                  : "text-slate-400 hover:bg-slate-50 hover:text-[#00538e]"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#00538e]"}`} />
              <span className="text-[11px] uppercase tracking-widest leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Account / Bottom Actions */}
      <div className="pt-8 border-t border-slate-50 space-y-2">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-4 p-4 rounded-[1.5rem] font-bold transition-all group ${
            pathname === "/dashboard/settings" 
              ? "bg-[#00538e] text-white shadow-lg" 
              : "text-slate-400 hover:bg-slate-50 hover:text-[#00538e]"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-widest leading-none">Settings</span>
        </Link>
        <Link href="/" className="flex items-center gap-4 p-4 rounded-[1.5rem] font-bold text-slate-400 hover:bg-slate-50 hover:text-[#993366] transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-widest leading-none">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
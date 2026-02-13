"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, MessageSquare, BookOpen, X, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchNotifications() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Check for replied coach messages
            // We assume coach_messages has status 'replied' and updated_at
            const { data: messages } = await supabase
                .from("coach_messages")
                .select("id, subject, status, updated_at")
                .eq("user_id", user.id)
                .eq("status", "replied")
                .order("updated_at", { ascending: false })
                .limit(5);

            // 2. Check for new library items (last 14 days to be safe)
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

            const { data: libraryItems } = await supabase
                .from("library_items")
                .select("id, title, type, created_at")
                .gt("created_at", fourteenDaysAgo.toISOString())
                .order("created_at", { ascending: false })
                .limit(3);

            const allNotifications = [
                ...(messages || []).map((m) => ({
                    id: m.id,
                    type: "message",
                    title: "Coach Replied!",
                    description: `Regarding: ${m.subject}`,
                    href: "/dashboard/coach",
                    timestamp: m.updated_at,
                })),
                ...(libraryItems || []).map((l) => ({
                    id: l.id,
                    type: "library",
                    title: "New Content!",
                    description: `New ${l.type}: ${l.title}`,
                    href: "/dashboard/library",
                    timestamp: l.created_at,
                })),
            ].sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            setNotifications(allNotifications);

            // Check for unread status using localStorage
            const lastViewed = localStorage.getItem("last_viewed_notifications");
            if (allNotifications.length > 0) {
                const latestTime = new Date(allNotifications[0].timestamp).getTime();
                const lastTime = lastViewed ? new Date(lastViewed).getTime() : 0;
                if (latestTime > lastTime) {
                    setHasUnread(true);
                }
            }
        }

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && notifications.length > 0) {
            // Don't mark as read immediately, maybe on close or when clicking a specific one? 
            // User requested "notify", so marking as read when the list is viewed is reasonable.
            localStorage.setItem("last_viewed_notifications", new Date().toISOString());
            setHasUnread(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className={`relative p-3 rounded-full transition-all group ${isOpen
                        ? "bg-[#0AA390] text-white"
                        : "bg-[#232938] border border-[#2d3548] text-[#94a3b8] hover:text-[#0AA390] hover:border-[#0AA390]/30"
                    }`}
                aria-label="Notifications"
            >
                <Lightbulb
                    className={`w-6 h-6 transition-transform ${hasUnread ? "animate-pulse" : "group-hover:scale-110"
                        }`}
                />
                {hasUnread && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-[#0AA390] rounded-full border-2 border-[#1a1f2e] shadow-[0_0_10px_rgba(10,163,144,0.5)]" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-[#1a1f2e] border border-[#2d3548] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 bg-[#232938] border-b border-[#2d3548] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#0AA390]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                Intelligence Feed
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-[#1a1f2e] rounded-full text-[#475569] hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((n, i) => (
                                <Link
                                    key={i}
                                    href={n.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block p-5 border-b border-[#2d3548] hover:bg-[#232938]/50 transition-all group"
                                >
                                    <div className="flex gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${n.type === "message"
                                                    ? "bg-[#00538e]/10 text-[#00538e] border border-[#00538e]/20"
                                                    : "bg-[#0AA390]/10 text-[#0AA390] border border-[#0AA390]/20"
                                                }`}
                                        >
                                            {n.type === "message" ? (
                                                <MessageSquare className="w-5 h-5" />
                                            ) : (
                                                <BookOpen className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-white group-hover:text-[#0AA390] transition-colors uppercase tracking-tight">
                                                {n.title}
                                            </p>
                                            <p className="text-[11px] text-[#94a3b8] leading-tight font-medium">
                                                {n.description}
                                            </p>
                                            <p className="text-[8px] text-[#475569] font-black uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                                <span className="w-1 h-1 bg-[#475569] rounded-full" />
                                                {new Date(n.timestamp).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-[#232938] rounded-full flex items-center justify-center mx-auto border border-[#2d3548]">
                                    <Lightbulb className="w-8 h-8 text-[#2d3548]" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
                                    No new updates for you
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-[#232938] border-t border-[#2d3548] text-center">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-[9px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#0AA390] transition-colors"
                        >
                            Clear Feed
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

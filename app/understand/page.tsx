"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Typewriter } from "@/components/Typewriter";
import { supabase } from "@/lib/supabaseClient";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function UnderstandPhase() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userFeeling, setUserFeeling] = useState("");
  const [userIntention, setUserIntention] = useState("");
  const [neoResponse, setNeoResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Neo's Shift
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const handleSessionComplete = async () => {
    if (!userId) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("sessions_this_month, plan")
        .eq("id", userId)
        .single();

      // If they are on the Basic plan and this was their first session
      if (profile?.plan === "Basic Self-Help" && profile?.sessions_this_month === 1) {
        setShowUpgrade(true);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const getNeoShift = async () => {
    if (!userFeeling || !userIntention) return alert("Please fill in both fields.");
    if (!userId) return alert("User not authenticated. Please log in.");

    setLoading(true);
    try {
      const res = await fetch("/api/neo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          mood: "reflecting",
          feeling: userFeeling,
          intention: userIntention,
        }),
      });

      const data = await res.json();
      const shiftText = data.message || data.error || "Neo is reflecting deeply. Please try rephrasing.";
      setNeoResponse(shiftText);
      setStep(2);
      
      // Check if we should show upgrade modal
      await handleSessionComplete();
    } catch (error) {
      console.error("Client-side Fetch Error:", error);
      setNeoResponse("Connection lost. Please check your internet and try again.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-12 h-12 mb-4" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#00538e]">Phase 3: Understand</h2>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <label htmlFor="feeling" className="text-[10px] font-black uppercase text-slate-400 ml-2">
                What is the current feeling?
              </label>
              <textarea
                id="feeling"
                value={userFeeling}
                onChange={(e) => setUserFeeling(e.target.value)}
                placeholder="e.g. I feel overwhelmed by my to-do list..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00538e]/10 h-32 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="intention" className="text-[10px] font-black uppercase text-slate-400 ml-2">
                What is your true intention?
              </label>
              <textarea
                id="intention"
                value={userIntention}
                onChange={(e) => setUserIntention(e.target.value)}
                placeholder="e.g. I want to provide high-quality computer services to my community..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00538e]/10 h-32 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={getNeoShift}
                disabled={loading || !userId}
                className="w-full py-4 bg-[#00538e] text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Neo is reflecting..." : "Ask Neo for a 180° Shift"}
              </button>
              {!userId && (
                <p className="text-xs text-slate-500 mt-2">
                  You must be signed in to save this session. (Sign in or set localStorage userId for testing.)
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {step === 2 && (
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                <span className="absolute -top-3 left-8 bg-[#00538e] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Neo's Perspective
                </span>
                <p className="text-xl leading-relaxed font-medium italic text-slate-700">
                  "<Typewriter text={neoResponse} speed={40} />"
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Link href="/choose" className="w-full py-4 bg-[#0AA390] text-center text-white rounded-2xl font-bold hover:shadow-lg transition-all">
                Proceed to Phase 4: Choose
              </Link>
              <button onClick={() => setStep(1)} className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-all">
                Rephrase my thoughts
              </button>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
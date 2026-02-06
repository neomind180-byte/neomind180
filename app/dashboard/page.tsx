"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Added Sparkles and Mail for the new Yearly Member section
import { Settings, Sparkles, Mail } from 'lucide-react'; 
import { supabase } from '@/lib/supabaseClient';
import { Logo } from '@/components/Logo';
import { UpgradeReminder } from '@/components/UpgradeReminder';
import HistoryList from '@/components/HistoryList';
import MoodChart from '@/components/MoodChart';

// --- DATA: WISDOM VAULT ---
const SCRIPTURES = [
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged." },
  { ref: "Matthew 6:34", text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself." },
  { ref: "2 Timothy 1:7", text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind." }
];

const RESILIENT_QUOTES = [
  { author: "Marcus Aurelius", text: "The happiness of your life depends upon the quality of your thoughts." },
  { author: "Epictetus", text: "It's not what happens to you, but how you react to it that matters." },
  { author: "Seneca", text: "Luck is what happens when preparation meets opportunity." },
  { author: "Zeno", text: "Well-being is realized by small steps, but is truly no small thing." }
];

const MICRO_RESETS = [
  { id: 1, title: "Grounded Breath", desc: "One deep breath, exhaling twice as long as the inhale.", color: "#00538e" },
  { id: 2, title: "Body Check", desc: "Release your jaw and drop your shoulders away from your ears.", color: "#0AA390" },
  { id: 3, title: "Affirmation", desc: "I am a calm observer, taking steady action.", color: "#F39904" }
];

// --- TYPES ---
type CheckIn = {
  id: string;
  created_at: string;
  mood_score: number;
  feeling_text: string;
  intention_text: string;
  ai_coaching: string | null;
};

// --- HELPERS ---
function calculateStreak(dates: string[]) {
  if (dates.length === 0) return 0;
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastCheckIn = new Date(dates[0]).toDateString();
  if (lastCheckIn !== today && lastCheckIn !== yesterday) return 0;
  streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]).getDate();
    const prev = new Date(dates[i+1]).getDate();
    if (curr - prev === 1) streak++;
    else break;
  }
  return streak;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [userName, setUserName] = useState("Traveler");
  const [userPlan, setUserPlan] = useState("Basic Self-Help");
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [activeReset, setActiveReset] = useState<number | null>(null);
  const router = useRouter();

  const dayIndex = new Date().getDate() % 4;
  const dailyScripture = SCRIPTURES[dayIndex];
  const dailyResilience = RESILIENT_QUOTES[dayIndex];

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Resilient Name Logic: metadata -> email prefix -> Traveler
      let displayName = user.user_metadata?.full_name?.split(' ')[0];
      if (!displayName && user.email) {
        const emailPrefix = user.email.split('@')[0];
        displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
      setUserName(displayName || 'Traveler');

      // Fetch user plan from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      
      if (profileData?.plan) {
        setUserPlan(profileData.plan);
      }

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentCheckins(data);
        setStreak(calculateStreak(data.map(d => d.created_at)));
      }
      setLoading(false);
    }
    getData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9" />
          <span className="font-bold text-xl tracking-tight text-[#00538e]">NeoMind180</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 group">
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-[#00538e] transition-colors" />
          </Link>
          <button 
            onClick={handleSignOut}
            className="text-xs font-bold bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 px-4 py-2 rounded-full transition-colors uppercase tracking-widest"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8 flex-grow w-full">
        
        {/* --- HEADER --- */}
        <header className="mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, <span className="text-[#00538e]">{userName}.</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg italic">Building strength, one thought at a time.</p>
          </div>
          <div className="bg-white px-8 py-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
             <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consistency Streak</span>
                <div className="text-2xl font-black text-[#00538e]">{streak} Days</div>
             </div>
             <div className="w-10 h-10 bg-[#0AA390]/10 rounded-full flex items-center justify-center text-[#0AA390]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             </div>
          </div>
        </header>

        {/* --- PLAN REMINDER --- */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-[2rem] mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Current Plan</h4>
              <p className="text-lg font-bold text-[#00538e]">{userPlan}</p>
            </div>
            <Link 
              href="/pricing"
              className="px-4 py-2 bg-[#0AA390] text-white text-xs font-bold rounded-full hover:shadow-md transition-all inline-block"
            >
              Upgrade
            </Link>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 italic">
            "Beautiful work. Imagine having this level of clarity 2–3 times every week."
          </p>
        </div>

        {/* --- UPDATED YEARLY MEMBER STATUS --- */}
        {userPlan === 'Yearly Growth' && (
          <div className="p-6 bg-[#0AA390]/5 border border-[#0AA390]/10 rounded-[2.5rem] relative overflow-hidden">
            {/* Decorative Sparkle for Premium Feel */}
            <div className="absolute -right-4 -top-4 opacity-10">
              <Sparkles className="w-24 h-24 text-[#0AA390]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-[#0AA390] text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  Member Exclusive
                </div>
              </div>
              
              <h5 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                Upcoming Circle
              </h5>
              
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                I meet when the collective energy is right - our next deep-dive session will be announced seven days in advance. 
                Keep an eye on your email for your private invitation and grounding prompts.
              </p>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-[#0AA390] tracking-widest">
                <Mail className="w-4 h-4" />
                Status: Awaiting Announcement
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN LAYOUT --- */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT: HISTORY & INSIGHTS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Recent Insights</h2>
              <Link href="/breathe" className="bg-[#00538e] hover:bg-[#004272] text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-100 transition-all font-bold text-sm transform hover:-translate-y-1">
                Start 5-Phase Session
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-slate-200 rounded-3xl"></div>
              </div>
            ) : recentCheckins.length === 0 ? (
              <div className="bg-white rounded-[32px] p-16 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">Your resilience journey starts with your first session.</p>
              </div>
            ) : (
              recentCheckins.map((checkin) => (
                <div key={checkin.id} className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 transition hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(checkin.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-100">
                      Alignment: {checkin.mood_score}/10
                    </div>
                  </div>
                  <p className="text-slate-800 font-semibold mb-4 leading-relaxed italic text-lg">"{checkin.intention_text}"</p>
                  {checkin.ai_coaching && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                      <span className="font-black text-[#00538e] text-[10px] uppercase block mb-2 tracking-widest">Neo's Guidance</span>
                      {checkin.ai_coaching}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* RIGHT: SIDEBAR WISDOM & RESETS */}
          <div className="space-y-6">
            
            {/* DAILY SCRIPTURE */}
            <div className="bg-white p-7 rounded-[32px] shadow-sm border-t-4 border-t-[#F39904] border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Daily Scripture</h3>
              <p className="text-xl font-serif text-slate-800 leading-relaxed mb-4 italic">"{dailyScripture.text}"</p>
              <p className="text-xs font-black text-[#F39904] uppercase tracking-widest">— {dailyScripture.ref}</p>
            </div>

            {/* RESILIENT MINDSET */}
            <div className="bg-slate-900 text-white p-7 rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#00538e] rounded-full blur-[80px] opacity-40"></div>
              <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4 relative z-10">Resilient Mindset</h3>
              <p className="text-xl font-serif italic mb-6 relative z-10 text-slate-100 leading-relaxed">"{dailyResilience.text}"</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest relative z-10">— {dailyResilience.author}</p>
            </div>
            
            {/* QUICK MICRO-RESETS */}
            <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Quick Micro-Resets</h3>
              <div className="space-y-3">
                {MICRO_RESETS.map((reset) => (
                  <div key={reset.id} className="group">
                    <button 
                      onClick={() => setActiveReset(activeReset === reset.id ? null : reset.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left border ${
                        activeReset === reset.id ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-sm text-slate-700">{reset.title}</span>
                      <span className={`text-xl font-light text-slate-400 transition-transform duration-300 ${activeReset === reset.id ? 'rotate-45' : ''}`}>
                        {activeReset === reset.id ? '✕' : '+'}
                      </span>
                    </button>
                    
                    {activeReset === reset.id && (
                      <div 
                        className="mt-2 p-5 rounded-2xl text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner"
                        style={{ backgroundColor: `${reset.color}08`, color: reset.color, border: `1px solid ${reset.color}15` }}
                      >
                        <span className="font-black uppercase text-[9px] tracking-[0.15em] block mb-2 opacity-60">Practice Now:</span>
                        <p className="font-medium">{reset.desc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-[#00538e]/5 border border-[#00538e]/10 p-4 rounded-2xl">
                 <p className="text-[11px] text-[#00538e] leading-relaxed font-medium">
                   When things feel heavy, use these to <strong>refocus</strong> your energy. Neo is here to help you move from stuck to steady action.
                 </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- ADDED FOOTER --- */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left Column: Logo & Disclaimer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-[#00538e]">NeoMind180</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Mindset coaching for clarity, not therapy. Seek professional help for mental health concerns.
            </p>
          </div>

          {/* Center Column: Payment Security */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
              Payment Security
            </h4>
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-300 text-xl tracking-tighter">
                PayFast
              </span>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                Secure payments powered by PayFast.<br/>
                Cancel anytime • No hidden fees • ZAR pricing
              </p>
            </div>
          </div>
          
          {/* Right Column: Links & Copyright */}
          <div className="space-y-4 text-right md:self-end">
             <div className="flex gap-6 justify-end text-[10px] font-bold uppercase tracking-tight text-slate-400">
               <Link href="/privacy" className="hover:text-[#00538e]">Privacy</Link>
               <Link href="/terms" className="hover:text-[#00538e]">Terms</Link>
             </div>
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              © 2026 NeoMind180
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
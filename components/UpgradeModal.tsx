"use client";

import Link from 'next/link';

export const UpgradeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#00538e]/10 rounded-full flex items-center justify-center mx-auto text-2xl">🤍</div>
          <h2 className="text-xl font-black text-[#00538e] uppercase tracking-tight">Beautiful work.</h2>
          <p className="text-slate-600 leading-relaxed">
            Imagine having this level of clarity 2–3 times every week. 
            On the Monthly plan, you can enjoy up to 12 deep-dive AI coaching sessions, plus richer insights and more support.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link 
            href="/plans" 
            className="block w-full py-4 bg-[#0AA390] text-center text-white rounded-2xl font-bold hover:shadow-lg transition-all"
          >
            See upgrade options
          </Link>
          <button 
            onClick={onClose}
            className="block w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};
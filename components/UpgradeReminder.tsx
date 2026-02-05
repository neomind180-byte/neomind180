export const UpgradeReminder = ({ plan }: { plan: string }) => {
  if (plan !== 'Basic Self-Help') return null;

  return (
    <div className="p-6 bg-[#00538e]/5 border border-[#00538e]/10 rounded-[2rem] mb-8">
      <h4 className="text-sm font-black text-[#00538e] uppercase tracking-widest">Your Support Plan</h4>
      <p className="text-sm text-slate-600 mt-2">
        You are on the **Basic Self-Help** plan. 
        You have **1 full coaching session** available this month.
      </p>
      <button className="mt-4 text-xs font-bold text-[#0AA390] hover:underline">
        Explore Monthly & Yearly Plans →
      </button>
    </div>
  );
};
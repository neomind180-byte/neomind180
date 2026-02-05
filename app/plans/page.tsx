export default function PlansPage() {
  const plans = [
    { name: 'Basic Self-Help', price: 'Free', sessions: '1 session/month', resets: '2/day' },
    { name: 'Monthly Support', price: '£15', sessions: '12 sessions/month', resets: 'Unlimited' },
    { name: 'Yearly Growth', price: '£150', sessions: '12 sessions/month', extras: 'Community Circle' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-black text-[#00538e] uppercase mb-12">Support Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
        {plans.map((p) => (
          <div key={p.name} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{p.name}</h3>
            <p className="text-4xl font-black text-[#00538e] mt-4">{p.price}</p>
            <ul className="mt-8 space-y-4 flex-grow">
              <li className="text-sm text-slate-600">✓ {p.sessions}</li>
              <li className="text-sm text-slate-600">✓ {p.resets || p.extras}</li>
            </ul>
            <button className="mt-8 w-full py-4 bg-slate-50 text-slate-800 rounded-2xl font-bold hover:bg-slate-100 transition-all">
              {p.price === 'Free' ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
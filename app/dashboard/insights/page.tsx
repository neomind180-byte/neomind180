"use client";

import { useInsightsData } from '@/hooks/useInsightsData';
import {
    Calendar,
    CheckCircle2,
    Target,
    Heart,
    TrendingUp,
    Brain,
    Zap,
    Lock,
    Snowflake,
    AlertTriangle,
    Loader2,
    Sparkles
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import Link from 'next/link';

const BRAND_COLORS = {
    blue: '#00538e',
    teal: '#0AA390',
    orange: '#F39904',
    pink: '#993366',
    slate: '#64748b'
};

const CHART_PALETTES = {
    mind: ['#00538e', '#0AA390', '#a7f3d0'],
    body: ['#993366', '#00538e', '#0AA390'],
    energy: ['#F39904', '#00538e', '#0AA390']
};

export default function InsightsPage() {
    const {
        metrics,
        stuckIndexHistory,
        mindDistribution,
        bodyDistribution,
        energyDistribution,
        subscriptionTier,
        loading
    } = useInsightsData();

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--header-accent)]" />
            </div>
        );
    }

    const isLocked = subscriptionTier === 'free';

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Insights</h1>
                <p className="text-base text-[var(--text-muted)] font-medium italic mt-2">Your 30-day journey overview.</p>
            </div>

            {/* SECTION 1: TOP METRIC CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={Calendar}
                    label="Sessions"
                    value={metrics.sessions}
                    color={BRAND_COLORS.blue}
                />
                <MetricCard
                    icon={CheckCircle2}
                    label="Check-ins"
                    value={metrics.checkIns}
                    color={BRAND_COLORS.teal}
                />
                <MetricCard
                    icon={Target}
                    label="Aligned Steps"
                    value={metrics.alignedSteps}
                    color={BRAND_COLORS.orange}
                />
                <MetricCard
                    icon={Heart}
                    label="Avg Compassion"
                    value={metrics.avgCompassion}
                    color={BRAND_COLORS.pink}
                />
            </section>

            {/* SECTION 2: STUCK-IN-HEAD INDEX CHART */}
            <section className="bg-[var(--bg-card)] p-8 md:p-10 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="w-5 h-5 text-[var(--header-accent)]" />
                    <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Stuck-in-Head Index Over Time</h3>
                </div>

                <div className="h-[300px] w-full mt-4">
                    {stuckIndexHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stuckIndexHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--text-dim)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="var(--text-dim)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '1rem',
                                        color: 'var(--text-primary)',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                    itemStyle={{ color: BRAND_COLORS.blue }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={BRAND_COLORS.blue}
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: BRAND_COLORS.blue, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartState message="No data yet. Complete your daily check-ins to see trends." />
                    )}
                </div>
            </section>

            {/* SECTION 3: MIND/BODY/ENERGY DONUT CHARTS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DonutCard
                    title="Mind States"
                    icon={Brain}
                    data={mindDistribution}
                    colors={CHART_PALETTES.mind}
                />
                <DonutCard
                    title="Body States"
                    icon={Heart}
                    data={bodyDistribution}
                    colors={CHART_PALETTES.body}
                />
                <DonutCard
                    title="Energy Levels"
                    icon={Zap}
                    data={energyDistribution}
                    colors={CHART_PALETTES.energy}
                />
            </section>

            {/* SECTION 4: ADVANCED INSIGHTS */}
            <section className={`bg-[var(--bg-card)] p-12 rounded-[3rem] border border-[var(--border)] shadow-sm text-center space-y-8 relative overflow-hidden group ${isLocked ? '' : 'border-[#0AA390]/30'}`}>
                {isLocked && (
                    <div className="absolute inset-0 bg-[var(--bg-card)]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 space-y-6">
                        <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-[2rem] flex items-center justify-center border border-[var(--border)] shadow-xl">
                            <Lock className="w-10 h-10 text-[#F39904]" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4">
                                Deep Insights Locked
                            </h2>
                            <p className="text-base text-[var(--text-muted)] font-medium italic mb-8">
                                Upgrade to Coaching Access to unlock your 30-day journey analysis, pattern detection, and progress tracking.
                            </p>
                            <Link href="/pricing">
                                <button className="px-12 py-5 bg-[#00538e] text-white rounded-[1.5rem] font-bold uppercase text-[12px] tracking-[0.2em] shadow-xl hover:shadow-2xl shadow-[#00538e]/20 transition-all hover:-translate-y-1">
                                    Compare Plans
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    {isLocked ? <Lock className="w-32 h-32" /> : <Sparkles className="w-32 h-32 text-[#0AA390]" />}
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="w-16 h-16 bg-[var(--bg-primary)] rounded-[1.5rem] flex items-center justify-center mx-auto border border-[var(--border)]">
                        {isLocked ? <Lock className="w-8 h-8 text-[#F39904]" /> : <Sparkles className="w-8 h-8 text-[#0AA390]" />}
                    </div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                        {isLocked ? 'Advanced Insights' : 'Premium Advanced Insights'}
                    </h2>
                    <p className="text-base text-[var(--text-muted)] font-medium leading-relaxed italic">
                        {isLocked
                            ? 'Upgrade to see deeper patterns in your mind, body, and energy over time so you can spot growth and triggers faster.'
                            : 'You have unlocked premium analysis. We are currently processing your historical data to surface deeper trends and behavioral patterns.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                        <LockedFeature icon={Snowflake} text="Pattern Detection" subtext={isLocked ? "See recurring themes" : "Deep-dive themes unlocked"} />
                        <LockedFeature icon={TrendingUp} text="Progress Tracking" subtext={isLocked ? "Weekly/monthly growth" : "Real-time growth analysis"} />
                        <LockedFeature icon={AlertTriangle} text="Trigger Alerts" subtext={isLocked ? "Know when you're spiraling" : "Proactive trigger detection"} />
                    </div>
                </div>
            </section>
        </div >
    );
}

function MetricCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm group hover:border-[var(--text-dim)] transition-all">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 min-w-[3rem] min-h-[3rem] aspect-square rounded-xl flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border)] shrink-0">
                        <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <span className="text-[12px] font-black uppercase text-[var(--text-muted)] tracking-widest">{label}</span>
                </div>
                <div className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">
                    {value}
                </div>
            </div>
        </div>
    );
}

function DonutCard({ title, icon: Icon, data, colors }: any) {
    const hasData = data.some((d: any) => d.value > 0);

    return (
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <Icon className="w-5 h-5 text-[var(--header-accent)]" />
                <h3 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest">{title}</h3>
            </div>

            <div className="flex-grow flex flex-col justify-center min-h-[220px]">
                {hasData ? (
                    <>
                        <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="transparent" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-4">
                            {data.map((entry: any, index: number) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 opacity-40">
                        <Icon className="w-8 h-8 mx-auto mb-2 text-[var(--text-dim)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">No data yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function LockedFeature({ icon: Icon, text, subtext }: any) {
    return (
        <div className="space-y-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center mx-auto">
                <Icon className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div>
                <h4 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-tight">{text}</h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium italic leading-tight">{subtext}</p>
            </div>
        </div>
    );
}

function EmptyChartState({ message }: { message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
            <TrendingUp className="w-10 h-10 mb-4 text-[var(--text-dim)]" />
            <p className="text-sm font-medium italic text-[var(--text-muted)] max-w-xs">{message}</p>
        </div>
    );
}

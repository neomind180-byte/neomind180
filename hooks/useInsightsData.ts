import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface InsightsData {
    metrics: {
        sessions: number;
        checkIns: number;
        alignedSteps: number;
        avgCompassion: string;
    };
    stuckIndexHistory: { date: string; value: number }[];
    mindDistribution: { name: string; value: number }[];
    bodyDistribution: { name: string; value: number }[];
    energyDistribution: { name: string; value: number }[];
    subscriptionTier: string;
    loading: boolean;
}

export function useInsightsData() {
    const [data, setData] = useState<InsightsData>({
        metrics: { sessions: 0, checkIns: 0, alignedSteps: 0, avgCompassion: '0/5' },
        stuckIndexHistory: [],
        mindDistribution: [],
        bodyDistribution: [],
        energyDistribution: [],
        subscriptionTier: 'free',
        loading: true
    });

    useEffect(() => {
        async function fetchData() {
            try {
                console.log('Fetching insights data from API...');

                // Get the session to pass the JWT to our API for verification
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    console.warn('No session found, skipping insights fetch');
                    setData(prev => ({ ...prev, loading: false }));
                    return;
                }

                const response = await fetch(`/api/dashboard/insights?t=${Date.now()}`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    cache: 'no-store'
                });

                if (!response.ok) {
                    const errorDetail = await response.json().catch(() => ({}));
                    console.error('Insights API Error:', response.status, errorDetail);
                    throw new Error(errorDetail.error || `API error: ${response.status}`);
                }

                const result = await response.json();

                setData({
                    ...result,
                    loading: false
                });
            } catch (err) {
                console.error('Failed to fetch insights:', err);
                setData(prev => ({ ...prev, loading: false }));
            }
        }

        fetchData();
    }, []);

    return data;
}

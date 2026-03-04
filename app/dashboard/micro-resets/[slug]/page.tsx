"use client";

import { useParams, useRouter } from 'next/navigation';
import { microResets } from '@/lib/micro-resets-data';
import ExerciseRunner from '@/components/micro-resets/ExerciseRunner';
import { useEffect, useState } from 'react';

export default function MicroResetPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const exercise = microResets[slug];

    useEffect(() => {
        if (!exercise) {
            router.push('/dashboard');
        }
    }, [exercise, router]);

    if (!exercise) {
        return null;
    }

    return (
        <div className="min-h-screen bg-stone-50/50">
            <ExerciseRunner exercise={exercise} />
        </div>
    );
}

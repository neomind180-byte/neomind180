"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, Home, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';
import { MicroReset } from '@/lib/micro-resets-data';

interface ExerciseRunnerProps {
    exercise: MicroReset;
}

export default function ExerciseRunner({ exercise }: ExerciseRunnerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isPlaying && !isCompleted && exercise.stepAudio && exercise.stepAudio[currentStep] && !isMuted) {
            // Stop previous audio
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }

            const newAudio = new Audio(exercise.stepAudio[currentStep]);
            newAudio.play().catch(err => console.error("Audio playback failed:", err));
            setAudio(newAudio);

            return () => {
                newAudio.pause();
                newAudio.currentTime = 0;
            };
        }
    }, [currentStep, isPlaying, isCompleted, isMuted, exercise.stepAudio]);

    const startExercise = () => {
        setIsPlaying(true);
        setCurrentStep(0);
        setIsCompleted(false);
    };

    const nextStep = () => {
        if (currentStep < exercise.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsCompleted(true);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const restart = () => {
        setCurrentStep(0);
        setIsCompleted(false);
        setIsPlaying(true);
    };

    if (!isPlaying) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#00538e] uppercase tracking-widest mb-12 hover:opacity-70 transition-opacity"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className={`p-10 rounded-[3rem] border ${exercise.borderColor} ${exercise.bgColor} shadow-sm text-center space-y-8`}>
                    <div className="space-y-4">
                        <h1 className={`text-3xl md:text-4xl font-black ${exercise.textColor} uppercase tracking-tight`}>
                            {exercise.title}
                        </h1>
                        <p className="text-lg font-medium text-stone-600 max-w-md mx-auto leading-relaxed">
                            {exercise.purpose}
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={startExercise}
                            className="group relative flex items-center justify-center w-24 h-24 bg-[#00538e] text-white rounded-full hover:scale-110 transition-all shadow-xl shadow-[#00538e]/20"
                        >
                            <Play className="w-8 h-8 fill-current ml-1" />
                        </button>
                    </div>

                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00538e]">
                        Begin Session
                    </p>
                </div>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="p-10 rounded-[3rem] border border-emerald-200 bg-emerald-50 shadow-sm text-center space-y-8">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <ChevronRight className="w-10 h-10 rotate-[-90deg] translate-y-1" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-emerald-950 uppercase tracking-tight">
                            Well Done!
                        </h1>
                        <p className="text-lg font-medium text-emerald-900/70 max-w-md mx-auto leading-relaxed">
                            {exercise.completionMessage}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={restart}
                            className="flex items-center justify-center gap-2 py-5 bg-white border border-emerald-200 text-emerald-950 rounded-[1.5rem] font-bold uppercase text-[12px] tracking-[0.2em] hover:bg-emerald-100 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Do Again
                        </button>
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center gap-2 py-5 bg-[#00538e] text-white rounded-[1.5rem] font-bold uppercase text-[12px] tracking-[0.2em] hover:shadow-xl transition-all"
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <div className={`p-10 md:p-16 rounded-[3rem] border ${exercise.borderColor} ${exercise.bgColor} shadow-sm min-h-[400px] flex flex-col justify-between transition-all duration-500`}>
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <span className={`text-[12px] font-black uppercase tracking-[0.3em] ${exercise.textColor} opacity-60`}>
                            Step {currentStep + 1} of {exercise.steps.length}
                        </span>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`${exercise.textColor} opacity-40 hover:opacity-100 transition-opacity`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <Volume2 className="w-5 h-5 opacity-20" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="py-12">
                        <h2 className={`text-2xl md:text-3xl font-bold ${exercise.textColor} leading-tight transition-all duration-300`}>
                            {exercise.steps[currentStep]}
                        </h2>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 p-4 rounded-2xl transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-black/5 text-stone-600'
                            }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextStep}
                        className="flex items-center gap-3 px-8 py-5 bg-[#00538e] text-white rounded-[1.5rem] font-bold uppercase text-[12px] tracking-[0.2em] hover:shadow-xl transition-all"
                    >
                        {currentStep === exercise.steps.length - 1 ? 'Finish' : 'Next Step'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="mt-8 flex justify-center gap-2">
                {exercise.steps.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-[#00538e]' : 'w-2 bg-stone-200'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Play,
  Volume2,
  VolumeX,
  CheckCircle2,
  X,
  Flame,
  ShieldCheck,
  Zap,
  Gift,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface AdRewardModalProps {
  slug: string;
  problemTitle?: string;
  requiredTier?: string;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

const SPONSORS = [
  {
    company: 'CloudScale Cloud AI',
    tagline: 'Distributed GPU Clusters for Generative AI & ML Workloads',
    cta: 'Deploy in 60s with $200 Free Credits',
    accent: 'from-cyan-500 to-blue-600',
    badge: 'Official Sponsor',
  },
  {
    company: 'DevFlow Microservices',
    tagline: 'Next-Gen Observability & Real-Time Performance Tracing for Cloud-Native Stacks',
    cta: 'Explore 30-Day Enterprise Trial',
    accent: 'from-purple-500 to-indigo-600',
    badge: 'Developer Partner',
  },
  {
    company: 'Apex Code Mentorship',
    tagline: 'Crack FAANG & Tier-1 Software Engineering Interviews with Ex-Staff Engineers',
    cta: 'Book 1-on-1 Free Strategy Call',
    accent: 'from-amber-500 to-rose-600',
    badge: 'Career Partner',
  },
];

export function AdRewardModal({
  slug,
  problemTitle,
  requiredTier = 'mid',
  isOpen,
  onClose,
  onUnlocked,
}: AdRewardModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [adFinished, setAdFinished] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSponsor] = useState(() => SPONSORS[Math.floor(Math.random() * SPONSORS.length)]);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(15);
      setAdFinished(false);
      setIsClaiming(false);
      setUnlockedSuccess(false);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch(`/api/problems/${slug}/unlock-ad`, {
        method: 'POST',
      });
      if (res.ok) {
        setUnlockedSuccess(true);
        setTimeout(() => {
          onUnlocked();
          onClose();
        }, 1500);
      } else {
        alert('Could not unlock problem. Please try again or sign in.');
      }
    } catch {
      alert('Network error while claiming unlock.');
    } finally {
      setIsClaiming(false);
    }
  };

  const progressPercent = Math.min(100, Math.round(((15 - secondsLeft) / 15) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Sponsored Video Reward
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              12 Hours Access
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {adFinished && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sponsor Banner & Simulated Video Player */}
        <div className="relative p-6 bg-gradient-to-b from-slate-900 to-slate-950">
          {unlockedSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white">Problem Unlocked!</h3>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                You now have full access to view, edit, run, and submit code for this problem for the next 12 hours.
              </p>
            </div>
          ) : (
            <>
              {/* Sponsor Media Card */}
              <div className={`relative rounded-xl overflow-hidden p-6 bg-gradient-to-br ${currentSponsor.accent} shadow-lg border border-white/10`}>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/40 backdrop-blur-md text-[10px] font-bold text-white/90 uppercase tracking-wider">
                  {currentSponsor.badge}
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
                    <h4 className="text-lg font-black text-white">{currentSponsor.company}</h4>
                  </div>
                  <p className="text-xs text-white/90 font-medium leading-relaxed max-w-md">
                    {currentSponsor.tagline}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black/30 hover:bg-black/50 px-3.5 py-1.5 rounded-lg backdrop-blur-sm transition border border-white/20">
                      {currentSponsor.cta} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Animated Graphic Waves in Background */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Problem Unlock Target Info */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Unlocking Problem</div>
                  <div className="text-sm font-bold text-white truncate max-w-xs">
                    {problemTitle || slug}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Duration</div>
                  <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 12 Hours
                  </div>
                </div>
              </div>

              {/* Progress Bar & Countdown Indicator */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">
                    {adFinished ? 'Reward Ready!' : 'Watching Sponsor Ad...'}
                  </span>
                  <span className={adFinished ? 'text-emerald-400' : 'text-amber-400'}>
                    {adFinished ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      `0:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`
                    )}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      adFinished
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  No credit card required. Free tier access.
                </div>

                {adFinished ? (
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition animate-bounce disabled:opacity-50"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Unlocking...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" /> Claim 12-Hour Access
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center gap-2 border border-slate-700"
                  >
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Unlock in {secondsLeft}s
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Zap,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface DailyData {
  dailyProblem: {
    slug: string;
    title: string;
    difficulty: string;
    category: string;
  } | null;
  date: string;
  streakDays: number;
  solvedToday: boolean;
  bonusXp: number;
}

export function DailyStreakBanner() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    try {
      const res = await fetch('/api/daily-problem');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch {
      // Non-critical fallback
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data?.dailyProblem) return null;

  // Generate 14-day activity heatmap mock
  const days = Array.from({ length: 14 }, (_, i) => {
    const isPastSolved = i < data.streakDays;
    return isPastSolved;
  });

  const diffColor =
    data.dailyProblem.difficulty === 'Easy'
      ? 'text-emerald-400'
      : data.dailyProblem.difficulty === 'Medium'
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-4 sm:p-6 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
        {/* Row 1: Problem info + CTA */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: Problem info */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Calendar className="w-2.5 h-2.5" /> Daily Problem
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> +{data.bonusXp} XP
              </span>
            </div>

            <h2 className="text-sm sm:text-xl font-black text-white leading-tight line-clamp-2">
              {data.dailyProblem.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold hidden sm:inline">{data.dailyProblem.category}</span>
              <span className="hidden sm:inline">•</span>
              <span className={`font-extrabold ${diffColor}`}>
                {data.dailyProblem.difficulty}
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/problems/${data.dailyProblem.slug}`}
            className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-[11px] sm:text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition hover:scale-[1.02] shrink-0 self-start whitespace-nowrap"
          >
            {data.solvedToday ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /><span className="hidden sm:inline">Solved!</span><span className="sm:hidden">✓</span></>
            ) : (
              <><span className="hidden sm:inline">Solve Challenge</span><span className="sm:hidden">Solve</span><ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </Link>
        </div>

        {/* Row 2: Streak heatmap */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 text-xs font-black text-amber-400 shrink-0">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-bounce" />
            <span>{data.streakDays}d</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-1 overflow-hidden">
            {days.map((solved, idx) => (
              <div
                key={idx}
                title={`Day ${idx + 1}: ${solved ? 'Solved' : 'Missed'}`}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm shrink-0 transition ${
                  solved
                    ? 'bg-amber-400 shadow-xs shadow-amber-400/40'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-500 hidden sm:inline shrink-0">Past 14 days</span>
        </div>
      </div>
    </div>
  );
}

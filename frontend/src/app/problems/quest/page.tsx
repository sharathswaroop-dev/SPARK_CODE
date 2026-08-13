'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Calendar, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function ProblemsQuestPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Daily Challenge & Quest Streak
          </h1>
          <p className="text-xs text-slate-500">
            Solve 1 challenge every day to build consistency and keep your problem-solving streak alive.
          </p>
        </div>
        <Link href="/problems" className="text-xs text-indigo-600 font-bold hover:underline">
          ← Back to All Problems
        </Link>
      </div>

      {/* Today's Daily Problem Card */}
      <div className="card p-6 border-2 border-indigo-600 bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold px-3 py-1 bg-amber-400 text-slate-950 rounded-full uppercase tracking-wider">
            Today's Quest • Aug 12
          </span>
          <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" /> 14h 22m remaining
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white">Two Sum</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="badge-easy">Easy</span>
            <span className="text-slate-400">Category: Array</span>
          </div>

          <Link href="/problems/two-sum" className="btn-primary text-xs h-9 bg-indigo-500 hover:bg-indigo-400 text-white font-bold border-none">
            Solve Daily Quest <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Streak tracker box */}
      <div className="card p-6 border border-slate-200 space-y-4 bg-white">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> August Quest Calendar Streak
        </h3>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 text-center">
          {Array.from({ length: 28 }).map((_, i) => {
            const dayNum = i + 1;
            const isCompleted = dayNum <= 12;
            return (
              <div
                key={dayNum}
                className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 ${
                  isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}
              >
                <span>Aug {dayNum}</span>
                {isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

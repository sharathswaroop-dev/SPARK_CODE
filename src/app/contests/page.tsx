'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Swords, ArrowRight, Sparkles, Clock } from 'lucide-react';

export default function ContestsPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" /> Scheduled for Phase 2 Release
          </span>
          <h1 className="text-2xl font-black text-slate-900">SparkCode Tournaments</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Official rated weekly and biweekly algorithmic tournaments are scheduled for our Phase 2 roadmap.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 text-left">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> In the meantime:
          </div>
          <p className="text-[11px] text-slate-500">
            Jump into real-time 1v1 and 3v3 live coding battles in the Battle Arena!
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/battles"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
          >
            <Swords className="w-4 h-4" /> Go to Battle Arena <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/problems"
            className="w-full py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition"
          >
            Browse Problem Library
          </Link>
        </div>
      </div>
    </div>
  );
}

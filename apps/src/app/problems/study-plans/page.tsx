'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function StudyPlansPage() {
  const plans = [
    {
      title: 'Data Structures & Algorithms 101',
      subtitle: 'Complete roadmap covering Arrays, Hash Maps, Strings, and Linked Lists.',
      duration: '4 Weeks',
      problems: 30,
      level: 'Beginner',
    },
    {
      title: 'Dynamic Programming Mastery',
      subtitle: 'From memoization to tabular DP: 1D DP, 2D DP, and Knapsack variants.',
      duration: '3 Weeks',
      problems: 25,
      level: 'Intermediate',
    },
    {
      title: 'Graph Theory & BFS/DFS Patterns',
      subtitle: 'Tree traversal, topological sort, Dijkstra, and connected components.',
      duration: '3 Weeks',
      problems: 20,
      level: 'Advanced',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Curated Study Plans & Learning Tracks
          </h1>
          <p className="text-xs text-slate-500">
            Structured step-by-step curricula to master specific computer science topics.
          </p>
        </div>
        <Link href="/problems" className="text-xs text-indigo-600 font-bold hover:underline">
          ← Back to All Problems
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.title} className="card p-6 border border-slate-200 flex flex-col justify-between gap-4 bg-white hover:border-slate-300 transition-all shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {p.level}
                </span>
                <span className="text-xs text-slate-400 font-medium">{p.duration}</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-900">{p.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{p.subtitle}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{p.problems} Target Problems</span>
              <Link href="/problems" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                Start Plan <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

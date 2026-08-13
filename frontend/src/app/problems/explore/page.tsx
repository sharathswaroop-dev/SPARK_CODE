'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, Code, Database, Cpu, Network } from 'lucide-react';

export default function ExplorePage() {
  const topics = [
    { title: 'Arrays & Hashing', icon: Code, desc: 'Master sliding window, two pointers, prefix sum, and hash maps.' },
    { title: 'Dynamic Programming', icon: Cpu, desc: 'Understand overlapping subproblems, memoization, and state transitions.' },
    { title: 'Trees & Graphs', icon: Network, desc: 'Learn DFS, BFS, topological sort, and shortest path algorithms.' },
    { title: 'Database & SQL', icon: Database, desc: 'Query optimization, joins, group by, and window functions.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Explore Topics & Patterns
          </h1>
          <p className="text-xs text-slate-500">
            Deep-dive into core computer science building blocks and algorithmic patterns.
          </p>
        </div>
        <Link href="/problems" className="text-xs text-indigo-600 font-bold hover:underline">
          ← Back to All Problems
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.title} className="card p-6 border border-slate-200 flex items-start gap-4 bg-white hover:border-slate-300 transition-all shadow-sm">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <h2 className="text-base font-extrabold text-slate-900">{t.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
                <Link href="/problems" className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline pt-1">
                  Explore Problems <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

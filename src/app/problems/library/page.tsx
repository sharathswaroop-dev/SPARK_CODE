'use client';

import React from 'react';
import Link from 'next/link';
import { Library, ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export default function ProblemsLibraryPage() {
  const collections = [
    {
      title: 'Blind 75 Must-Do Questions',
      description: 'The definitive list of 75 coding interview questions curated by Meta engineers.',
      count: '75 Problems',
      tags: ['Arrays', 'Trees', 'Graphs', 'DP'],
    },
    {
      title: 'Top 100 Liked Questions',
      description: 'Most frequently asked algorithm questions across Google, Amazon, and Microsoft interviews.',
      count: '100 Problems',
      tags: ['Hash Table', 'Two Pointers', 'Sliding Window'],
    },
    {
      title: 'LeetCode 75 Study Plan',
      description: 'Essential problem set designed for beginners building interview confidence step-by-step.',
      count: '75 Problems',
      tags: ['Binary Search', 'Stack', 'Queue'],
    },
    {
      title: 'SQL & Database Essentials',
      description: 'Master relational queries, joins, window functions, and schema design.',
      count: '25 Problems',
      tags: ['Database', 'SQL'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-600" />
            Problem Library & Collections
          </h1>
          <p className="text-xs text-slate-500">
            Curated problem sets grouped by difficulty, company tags, and interview patterns.
          </p>
        </div>
        <Link href="/problems" className="text-xs text-indigo-600 font-bold hover:underline">
          ← Back to All Problems
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div key={col.title} className="card p-6 border border-slate-200 space-y-4 hover:border-slate-300 transition-all bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                {col.count}
              </span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-900">{col.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{col.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <div className="flex flex-wrap gap-1">
                {col.tags.map((t) => (
                  <span key={t} className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
              <Link href="/problems" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                Explore Collection <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

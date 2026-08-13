'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Code2, Zap, Users, ShieldCheck, ArrowRight, CheckCircle2, Cpu, Sparkles, BookOpen, Terminal } from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="w-full bg-slate-50 text-slate-900 overflow-hidden space-y-20 pb-20">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-7">

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold shadow-xs">
          <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
          Real Server-Side Code Execution — Never Simulated
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.1]">
          Write &amp; Execute Code Together{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500">
            in Real-Time.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          SparkCode features a server-side isolated execution service supporting Python, JavaScript, and Java.{' '}
          Create study groups, assign tasks to members, and track real coding solutions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link href="/playground" className="btn-primary px-6 py-2.5 text-sm gap-2">
            <Terminal className="w-4 h-4" /> Launch Playground
          </Link>
          <Link href="/problems" className="btn-secondary px-6 py-2.5 text-sm gap-2">
            <BookOpen className="w-4 h-4" /> Browse Problems
          </Link>
        </div>

        {/* Live Code Preview Frame */}
        <div className="mt-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl text-left font-mono text-[11px] max-w-xl mx-auto overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-slate-400 text-[10px]">main.py</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 rounded-md">
              PISTON BACKED
            </span>
          </div>
          <pre className="p-4 text-indigo-300 overflow-x-auto leading-relaxed">
{`# Python 3 — real server-side execution
def add_nums(a, b):
    return a + b

print(add_nums(5, 7))  # Output: 12`}
          </pre>
        </div>
      </section>

      {/* ── FEATURE GRID ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-950">Core Platform Features</h2>
          <p className="text-slate-500 text-sm font-medium">Everything runs on real systems — no simulated placeholders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900">Real Execution Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Never simulated. Code runs server-side in a containerized environment (Piston API), supporting Python, JavaScript, and Java.
              </p>
            </div>
          </div>

          <div className="card p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900">Study Group Workspaces</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create or join groups, assign coding tasks to members, track status, and study efficiently together — 100% Free.
              </p>
            </div>
          </div>

          <div className="card p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900">Verified Problem Submissions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit code directly to run against test cases stored securely in our database, yielding real judge verdicts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING MATRIX ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-950">Indian Market Pricing</h2>
          <p className="text-slate-500 text-sm font-medium">Simple, transparent tiers. All prices in INR.</p>
        </div>

        <div className="card overflow-hidden border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">

            {/* Free Tier */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Free Tier</h3>
                </div>
                <div className="text-2xl font-extrabold text-slate-950">₹0
                  <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Playground execution</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Easy difficulty problems</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Create &amp; join study groups</li>
              </ul>
            </div>

            {/* Mid Tier */}
            <div className="p-6 space-y-5 bg-indigo-50/20">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Mid Tier</h3>
                </div>
                <div className="text-2xl font-extrabold text-slate-950">₹200
                  <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Access Medium problems</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Assign &amp; track group tasks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Priority execution queue</li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div className="p-6 space-y-5 bg-amber-50/20">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <h3 className="font-extrabold text-amber-900 text-sm">Pro Tier</h3>
                </div>
                <div className="text-2xl font-extrabold text-slate-950">₹700
                  <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Access Hard problems</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Live Watch presentation mode</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Execution memory profiling</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

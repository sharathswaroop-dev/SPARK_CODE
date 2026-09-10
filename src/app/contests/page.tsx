'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Swords,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ContestsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* ── HEADER & HERO ───────────────────────────────────────── */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          Official Competitive Arena
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          SparkCode Algorithmic Tournaments
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          Compete against programmers across the globe in real-time speed, accuracy, and algorithmic problem-solving.
          Climb the global leaderboard, earn competitive Elo ratings, and benchmark your engineering skills.
        </p>
      </div>

      {/* ── TOURNAMENT SCHEDULE ─────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Regular Tournament Schedule
            </h2>
            <p className="text-xs text-slate-500">Rated contests take place weekly with automated live rating adjustments.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Contest Card */}
          <div className="card p-6 border border-slate-200 bg-white shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
                  Every Sunday
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2">SparkCode Weekly Contest</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard 90-minute competitive round consisting of 4 algorithm problems ranging from foundational logic to advanced dynamic programming.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Duration: 90 Minutes</span>
              <span>4 Problems</span>
              <span className="text-emerald-600 font-bold">Rated Round</span>
            </div>
          </div>

          {/* Biweekly Blitz Card */}
          <div className="card p-6 border border-slate-200 bg-white shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-amber-50 text-amber-700">
                  Alternate Wednesdays
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2">Biweekly Speed Blitz</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rapid-fire 60-minute round designed to evaluate speed and clean implementation under tight time constraints.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Duration: 60 Minutes</span>
              <span>3 Problems</span>
              <span className="text-amber-600 font-bold">Speed Rated</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTEST RULES & SCORING SYSTEM ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Scoring & Penalty Rules */}
        <div className="card p-6 border border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-sm">
            <Award className="w-4 h-4" /> Scoring &amp; Penalty Mechanics
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Participants are ranked based on the total points accrued during the contest window. Ties are broken based on finish time plus accumulated penalties.
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Point Weights:</strong> Problems are weighted dynamically based on difficulty (e.g., 300, 500, 700, 1000 points).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Wrong Submissions:</strong> Each rejected submission incurs a 5-minute time penalty, applied only if the problem is ultimately solved.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Compilation Errors:</strong> Syntax errors and compilation failures do not count toward wrong submission penalties.</span>
            </li>
          </ul>
        </div>

        {/* Fair Play & Integrity */}
        <div className="card p-6 border border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
            <ShieldCheck className="w-4 h-4" /> Fair Play &amp; Code Integrity
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            SparkCode maintains a strict integrity framework to guarantee that ratings reflect genuine algorithmic capability.
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Automated Plagiarism Detection:</strong> All solutions undergo AST structural analysis post-contest to flag identical submissions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Single Account Policy:</strong> Competitors must submit code using only their primary verified account.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero AI Assistance:</strong> The use of generative AI code generators or copilot plugins during rated rounds is strictly prohibited.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── PRACTICE & BATTLE ARENA ACTION ────────────────────────── */}
      <div className="card p-8 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl space-y-6 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-black">Prepare for the Next Tournament</h2>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Sharpen your speed with 1v1 duels against peer programmers or explore our curated problem library before the next rated round.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/battles"
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition"
          >
            <Swords className="w-4 h-4" /> Enter Real-Time Battle Arena <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/problems"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-2 transition"
          >
            <BookOpen className="w-4 h-4" /> Browse Practice Problems
          </Link>
        </div>
      </div>
    </div>
  );
}

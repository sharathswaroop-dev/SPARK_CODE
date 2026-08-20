'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { User as UserIcon, Shield, CheckCircle, Code, Clock, Loader2, Award, Calendar } from 'lucide-react';

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    tier: string;
    createdAt: string;
  };
  stats: {
    totalSolved: number;
    solvedEasy: number;
    solvedMedium: number;
    solvedHard: number;
    totalSubmissionsCount: number;
    acceptanceRate: number;
  };
  submissions: {
    id: string;
    language: string;
    verdict: string;
    submittedAt: string;
    problem: {
      id: string;
      slug: string;
      title: string;
      difficulty: string;
    };
  }[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const d = await res.json();
        setProfile(d);
      }
    } catch (e) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4 px-4">
        <UserIcon className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900">Developer Profile</h2>
        <p className="text-xs text-slate-500">Sign in to view your problem solving stats and submission history.</p>
        <Link href="/signin" className="btn-primary text-xs inline-flex">Sign In</Link>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs">Loading developer profile...</span>
      </div>
    );
  }

  const { user, stats, submissions } = profile;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">

      {/* ── TOP BANNER ── */}
      <div className="card p-4 sm:p-6 border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-xl sm:text-2xl text-indigo-600 shrink-0">
            {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
          </div>
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
              <span className="truncate">{user.name || user.email.split('@')[0]}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
                {user.tier} Tier
              </span>
            </h1>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <p className="text-[10px] text-slate-400 font-mono">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Link href="/pricing" className="btn-secondary text-xs h-9 font-bold flex items-center gap-1.5 self-start sm:self-center shrink-0">
          <Shield className="w-4 h-4 text-indigo-600" /> Upgrade Plan
        </Link>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card p-4 sm:p-5 border border-slate-200 space-y-1.5 sm:space-y-2 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Solved</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalSolved}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Acceptance: {stats.acceptanceRate}%</p>
        </div>

        <div className="card p-4 sm:p-5 border border-emerald-200 space-y-1.5 sm:space-y-2 bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Easy</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{stats.solvedEasy}</div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium">Foundational</p>
        </div>

        <div className="card p-4 sm:p-5 border border-amber-200 space-y-1.5 sm:space-y-2 bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Medium</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">{stats.solvedMedium}</div>
          <p className="text-[10px] sm:text-[11px] text-amber-600 font-medium">Interview Level</p>
        </div>

        <div className="card p-4 sm:p-5 border border-rose-200 space-y-1.5 sm:space-y-2 bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Hard</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-700">{stats.solvedHard}</div>
          <p className="text-[10px] sm:text-[11px] text-rose-600 font-medium">Advanced</p>
        </div>
      </div>

      {/* ── SUBMISSION HISTORY ── */}
      <div className="card p-4 sm:p-6 border border-slate-200 space-y-4 bg-white shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-600" /> Recent Submission History
        </h2>

        {submissions.length === 0 ? (
          <div className="text-center py-10 sm:py-12 text-slate-400 text-xs italic">
            No code submissions yet. Head over to Problems or Playground to run code!
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Problem</th>
                    <th className="px-4 py-3">Verdict</th>
                    <th className="px-4 py-3">Language</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold">
                        <Link href={`/problems/${sub.problem.slug}`} className="text-slate-900 hover:text-indigo-600 transition-colors">
                          {sub.problem.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sub.verdict === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {sub.verdict}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 uppercase text-[10px] font-mono">{sub.language}</td>
                      <td className="px-4 py-3 text-right text-slate-400 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="sm:hidden space-y-2.5">
              {submissions.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/problems/${sub.problem.slug}`}
                      className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug"
                    >
                      {sub.problem.title}
                    </Link>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      sub.verdict === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {sub.verdict === 'ACCEPTED' ? '✓ AC' : '✗ WA'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="uppercase">{sub.language}</span>
                    <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

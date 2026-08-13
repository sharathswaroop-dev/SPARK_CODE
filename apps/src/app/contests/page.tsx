'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Award, Clock, Users, ArrowRight, Loader2, Zap } from 'lucide-react';

interface ContestItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problemCount: number;
  participantCount: number;
  isActive: boolean;
}

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  solvedCount: number;
  totalScore: number;
  totalRuntime: number;
}

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contests');
      if (res.ok) {
        const d = await res.json();
        setContests(d.contests || []);
        setLeaderboard(d.leaderboard || []);
      }
    } catch (e) {
      console.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const RANK_STYLES: Record<number, string> = {
    0: 'bg-amber-100 text-amber-700 border border-amber-200',
    1: 'bg-slate-200 text-slate-700 border border-slate-300',
    2: 'bg-orange-100 text-orange-700 border border-orange-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 space-y-1">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-amber-500" />
          Competitive Coding Contests
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Participate in timed contests, climb the global ranking leaderboard, and sharpen your algorithmic skills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Contests List */}
        <div className="lg:col-span-7 space-y-5">
          <span className="section-header">
            <Zap className="w-4 h-4 text-amber-500" /> Active &amp; Upcoming Contests
          </span>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Loading contest schedule...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {contests.map((c) => (
                <div key={c.id} className="card p-5 space-y-4 hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {c.isActive ? '● Live Now' : 'Upcoming'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Ends {new Date(c.endTime).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900">{c.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {c.participantCount} Registered
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {c.problemCount} Problems
                      </span>
                    </div>
                    <Link href="/problems" className="btn-primary text-[11px] h-7 px-3 gap-1">
                      Enter <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Global Leaderboard */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 self-start">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="section-header">
                <Award className="w-4 h-4 text-indigo-600" /> Global Leaderboard
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Live</span>
            </div>

            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400 font-medium">Calculating ranks...</div>
            ) : leaderboard.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 italic">
                No submissions yet. Submit solutions to appear here!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {leaderboard.map((user, idx) => (
                  <div key={user.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] ${RANK_STYLES[idx] ?? 'text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{user.solvedCount} solved</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-indigo-600 text-xs">{user.totalScore} pts</div>
                      <div className="text-[9px] text-slate-400 font-mono">{user.totalRuntime}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

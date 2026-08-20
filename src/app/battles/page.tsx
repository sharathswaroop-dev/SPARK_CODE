'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Swords,
  Users,
  Shield,
  Zap,
  Flame,
  Trophy,
  Play,
  Plus,
  ArrowRight,
  Loader2,
  Lock,
  Sparkles,
  Crown,
  Radio,
  Gamepad2,
  Clock,
  History,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { MatchmakingModal } from '@/components/MatchmakingModal';

interface BattleHistoryItem {
  battleId: string;
  mode: string;
  problemTitle: string;
  difficulty: string;
  category: string;
  team: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  ratingChange: number;
  score: number;
  passedCases: number;
  endedAt: string;
  opponents: Array<{ name: string; isBot: boolean }>;
  teammates: Array<{ name: string }>;
}

export default function BattleArenaPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [history, setHistory] = useState<BattleHistoryItem[]>([]);
  const [userMmr, setUserMmr] = useState<number>(1200);
  const [creatingMode, setCreatingMode] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [botDifficulty, setBotDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  // Matchmaking modal state
  const [matchmakingOpen, setMatchmakingOpen] = useState(false);
  const [matchmakingMode, setMatchmakingMode] = useState<'1v1' | '3v3' | 'team'>('1v1');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/battles/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        if (data.currentMmr) setUserMmr(data.currentMmr);
      }
    } catch {}
  };

  const handleStartMatchmaking = (mode: '1v1' | '3v3') => {
    if (!session?.user) {
      router.push('/signin?callbackUrl=/battles');
      return;
    }
    setMatchmakingMode(mode);
    setMatchmakingOpen(true);
  };

  const handleCreateRoom = async (mode: '1v1' | '3v3' | 'team' | 'ai_bot') => {
    if (!session?.user) {
      router.push('/signin?callbackUrl=/battles');
      return;
    }

    setCreatingMode(mode);
    try {
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          difficulty: selectedDifficulty,
          botDifficulty,
        }),
      });
      const data = await res.json();
      if (res.ok && data.room) {
        router.push(`/battles/${data.room.id}`);
      }
    } catch {
      // Error handling
    } finally {
      setCreatingMode(null);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    if (!session?.user) {
      router.push('/signin?callbackUrl=/battles');
      return;
    }

    try {
      const res = await fetch(`/api/battles?code=${joinCodeInput.trim().toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          router.push(`/battles/${data.room.id}`);
          return;
        }
      }
      alert('Battle room not found or already finished.');
    } catch {
      alert('Error searching for room code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Matchmaking Queue Modal */}
      <MatchmakingModal
        isOpen={matchmakingOpen}
        mode={matchmakingMode}
        difficulty={selectedDifficulty}
        onClose={() => {
          setMatchmakingOpen(false);
          fetchHistory();
        }}
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 pt-12 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Swords className="w-3.5 h-3.5" /> COMPETITIVE BATTLE ARENA
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Crown className="w-3.5 h-3.5" /> ⭐ {userMmr} BATTLE MMR
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Real-Time Matchmaking & Arena
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
              Click <strong className="text-white">Find Match</strong> to automatically queue into competitive 1v1 duels and 3v3 squad battles. Compete for Elo MMR rating and climb the leaderboards!
            </p>

            {/* Quick Room Code Input for Private Matches */}
            <form onSubmit={handleJoinByCode} className="pt-4 flex items-center justify-center gap-2 max-w-md w-full mx-auto">
              <input
                type="text"
                maxLength={6}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER 6-DIGIT CUSTOM CODE"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-center text-sm font-mono tracking-widest font-black uppercase text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-extrabold text-xs text-white shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition shrink-0"
              >
                Join <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* Difficulty Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            Matchmaking Difficulty Filter:
          </div>
          <div className="flex items-center gap-2">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  selectedDifficulty === diff
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Main Battle Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Mode 1: 1v1 QUICK MATCH (Automatic Queue) */}
          <div className="relative group rounded-3xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border-2 border-rose-500/50 hover:border-rose-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-rose-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Swords className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/30 animate-pulse">
                  ⚡ Auto Queue
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">1v1 Quick Match</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Automatic MMR matchmaking! Click Find Match, get matched against a rival at your skill level, and clash head-to-head for rating points.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-rose-500/20 mt-6 space-y-2">
              <button
                onClick={() => handleStartMatchmaking('1v1')}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-600/40 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <Radio className="w-4 h-4 animate-pulse" /> FIND 1V1 MATCH
              </button>
              <button
                onClick={() => handleCreateRoom('1v1')}
                disabled={creatingMode !== null}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition"
              >
                Create Custom 1v1 Room
              </button>
            </div>
          </div>

          {/* Mode 2: 3v3 SQUAD WAR (Automatic Queue) */}
          <div className="relative group rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-indigo-500/50 hover:border-indigo-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-indigo-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                  🛡️ 6 Players
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">3v3 Squad War</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Automatic team matchmaking! 6 players are collected and balanced by average MMR into Team Red vs Team Blue for squad glory!
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-indigo-500/20 mt-6 space-y-2">
              <button
                onClick={() => handleStartMatchmaking('3v3')}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-indigo-600/40 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <Radio className="w-4 h-4 animate-pulse" /> FIND 3V3 SQUAD MATCH
              </button>
              <button
                onClick={() => handleCreateRoom('3v3')}
                disabled={creatingMode !== null}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition"
              >
                Create Custom 3v3 Room
              </button>
            </div>
          </div>

          {/* Mode 3: 1v1 VS AI BOT */}
          <div className="relative group rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 hover:border-purple-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-purple-500/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Solo Instant
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">1v1 vs AI Bot</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Race against an AI rival! The bot writes code and passes test cases on simulated timers. Instant warmup with zero wait.
                </p>
              </div>

              {/* Bot Level Selector */}
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-3 gap-1">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setBotDifficulty(lvl)}
                      className={`py-1 text-[9px] font-extrabold rounded-lg transition ${
                        botDifficulty === lvl
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl === 'EASY' ? 'SparkBot' : lvl === 'MEDIUM' ? 'DeepCoder' : 'Grandmaster'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-purple-500/20 mt-6">
              <button
                onClick={() => handleCreateRoom('ai_bot')}
                disabled={creatingMode !== null}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {creatingMode === 'ai_bot' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Battle AI Bot Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mode 4: CUSTOM ARENA (Private Lobby) */}
          <div className="relative group rounded-3xl bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-emerald-500/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Private Lobby
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Custom Clash</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Host custom matches for friend groups, college coding clubs, or tournaments. Share private 6-digit room codes to assemble your lobby.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-emerald-500/20 mt-6">
              <button
                onClick={() => handleCreateRoom('team')}
                disabled={creatingMode !== null}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {creatingMode === 'team' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Create Custom Lobby
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── USER BATTLE MATCH HISTORY TABLE ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-black text-white">Your Battle Match History</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Current Rating: <strong className="text-amber-400">{userMmr} MMR</strong>
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No completed matches yet. Click Find Match to jump into your first battle!</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Rating Change</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Opponents</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                            h.result === 'WIN'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {h.result === 'WIN' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {h.result}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold uppercase text-slate-200">{h.mode}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white truncate max-w-xs">{h.problemTitle}</div>
                        <span className="text-[10px] text-slate-500">{h.category}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black">
                        <span className={h.ratingChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {h.ratingChange >= 0 ? `+${h.ratingChange}` : h.ratingChange} MMR
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">{h.score} pts</td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {h.opponents.map((o) => o.name).join(', ') || 'Rivals'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-500">
                        {new Date(h.endedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

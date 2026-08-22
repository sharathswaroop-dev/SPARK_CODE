'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Editor from '@monaco-editor/react';
import {
  Swords,
  Users,
  Shield,
  Zap,
  Flame,
  Trophy,
  Play,
  Copy,
  Check,
  Send,
  Loader2,
  Lock,
  RotateCcw,
  Clock,
  Crown,
  Sparkles,
  Award,
  Terminal,
  Code2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ParticipantType {
  id: string;
  userId?: string | null;
  team: string;
  isBot?: boolean;
  botName?: string | null;
  botDifficulty?: string | null;
  score: number;
  passedCases: number;
  isFinished: boolean;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  } | null;
}

interface BattleRoomData {
  id: string;
  code: string;
  mode: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  startedAt: string | null;
  endedAt: string | null;
  winnerTeam: string | null;
  problem: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    category: string;
    description: string;
    constraints: string;
    examples: Array<{ input: string; output: string; explanation?: string }>;
    starterCode: Record<string, string>;
    totalCases: number;
  };
  teamA: ParticipantType[];
  teamB: ParticipantType[];
  participants: ParticipantType[];
  currentParticipant: ParticipantType | null;
}

type LangType = 'python' | 'javascript' | 'java' | 'cpp';

const DEFAULT_STARTER: Record<LangType, string> = {
  python: `import sys

def main():
    data = sys.stdin.read().split()
    if not data: return
    # Write solution here
    print(" ".join(data))

if __name__ == '__main__':
    main()
`,
  javascript: `// Readline for standard input
function main() {
  const line = readline().trim();
  if (line) console.log(line);
}
main();
`,
  java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) System.out.println(sc.next());
    }
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string s;
    if (cin >> s) cout << s << "\\n";
    return 0;
}
`,
};

export default function LiveBattleArenaPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [roomData, setRoomData] = useState<BattleRoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Editor and execution state
  const [language, setLanguage] = useState<LangType>('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [passedCases, setPassedCases] = useState<number | null>(null);

  // UI state
  const [leftTab, setLeftTab] = useState<'problem' | 'battlelog'>('problem');
  const [bottomTab, setBottomTab] = useState<'testcase' | 'result'>('testcase');
  const [actionLoading, setActionLoading] = useState(false);

  // Timer state
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 mins default

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 2500);
    return () => clearInterval(interval);
  }, [resolvedParams.roomId]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/battles/${resolvedParams.roomId}`);
      if (!res.ok) {
        throw new Error('Battle room not found');
      }
      const data = await res.json();
      setRoomData(data.room);

      // Auto-initialize code if empty
      if (!code && data.room?.problem?.starterCode) {
        setCode(data.room.problem.starterCode[language] || DEFAULT_STARTER[language]);
      }
      if (!customInput && data.room?.problem?.examples?.[0]) {
        setCustomInput(data.room.problem.examples[0].input);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load battle room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (team?: 'TEAM_A' | 'TEAM_B') => {
    if (!session?.user) {
      router.push(`/signin?callbackUrl=/battles/${resolvedParams.roomId}`);
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/battles/${resolvedParams.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', team }),
      });
      if (res.ok) fetchRoom();
    } catch {
      alert('Failed to join team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSwitchTeam = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/battles/${resolvedParams.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch_team' }),
      });
      if (res.ok) fetchRoom();
    } catch {
      alert('Failed to switch team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBattle = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/battles/${resolvedParams.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchRoom();
      } else {
        alert(data.error || 'Cannot start battle yet');
      }
    } catch {
      alert('Error starting battle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunCustom = async () => {
    setRunning(true);
    setVerdict(null);
    setStdout('');
    setStderr('');
    setBottomTab('result');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin: customInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      setStdout(data.stdout || '');
      setStderr(data.stderr || '');
    } catch (e: any) {
      setStderr(e.message || 'Execution error');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitBattle = async () => {
    setSubmitting(true);
    setVerdict(null);
    setStdout('');
    setStderr('');
    setBottomTab('result');
    try {
      const res = await fetch(`/api/battles/${resolvedParams.roomId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setVerdict(data.verdict);
      setPassedCases(data.passedCases);
      setStdout(data.stdout || '');
      setStderr(data.stderr || '');
      fetchRoom();
    } catch (e: any) {
      setStderr(e.message || 'Submit error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRoomCode = () => {
    if (!roomData) return;
    navigator.clipboard.writeText(roomData.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Battle Stadium...</span>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-xl font-black text-white">Arena Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This battle room no longer exists.'}</p>
        <Link href="/battles" className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
          Back to Battles
        </Link>
      </div>
    );
  }

  const isUserParticipant = !!roomData.currentParticipant;
  const teamAScore = roomData.teamA.reduce((sum, p) => sum + p.score, 0);
  const teamBScore = roomData.teamB.reduce((sum, p) => sum + p.score, 0);

  // ─── LOBBY VIEW (WAITING FOR PLAYERS) ──────────────────────────────────────
  if (roomData.status === 'WAITING') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {roomData.mode.toUpperCase()} LOBBY
                </span>
                <span className="text-xs text-slate-400 font-medium">#{roomData.code}</span>
              </div>
              <h1 className="text-2xl font-black text-white">Battle Preparation Room</h1>
              <p className="text-xs text-slate-400">
                Problem: <strong className="text-slate-200">{roomData.problem.title}</strong> ({roomData.problem.difficulty})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={copyRoomCode}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 border border-slate-700 transition"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied Code!' : `Code: ${roomData.code}`}
              </button>

              {isUserParticipant && (
                <button
                  onClick={handleStartBattle}
                  disabled={actionLoading || roomData.participants.length < 2}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50 transition"
                >
                  <Swords className="w-4 h-4" /> Start Battle
                </button>
              )}
            </div>
          </div>

          {/* Teams Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Red */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-950/30 to-slate-900 border-2 border-rose-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <h3 className="text-lg font-black text-rose-400">Team Red</h3>
                </div>
                <span className="text-xs text-rose-300 font-bold">{roomData.teamA.length} Players</span>
              </div>

              <div className="space-y-2 min-h-[140px]">
                {roomData.teamA.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center font-bold text-xs text-rose-400">
                        {p.user?.name?.[0] || 'U'}
                      </div>
                      <span className="text-xs font-bold text-white">
                        {p.user?.name || p.user?.email?.split('@')[0] || 'Coder'}
                      </span>
                    </div>
                    {p.userId === session?.user?.id && (
                      <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {!isUserParticipant && (
                <button
                  onClick={() => handleJoin('TEAM_A')}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md transition"
                >
                  Join Team Red
                </button>
              )}
            </div>

            {/* Team Blue */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-950/30 to-slate-900 border-2 border-blue-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="text-lg font-black text-blue-400">Team Blue</h3>
                </div>
                <span className="text-xs text-blue-300 font-bold">{roomData.teamB.length} Players</span>
              </div>

              <div className="space-y-2 min-h-[140px]">
                {roomData.teamB.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-400">
                        {p.isBot ? '🤖' : (p.user?.name?.[0] || 'U')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">
                          {p.botName || p.user?.name || p.user?.email?.split('@')[0] || 'Coder'}
                        </span>
                        {p.isBot && (
                          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">
                            AI Bot Rival ({p.botDifficulty || 'MED'})
                          </span>
                        )}
                      </div>
                    </div>
                    {p.userId === session?.user?.id && (
                      <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {!isUserParticipant && (
                <button
                  onClick={() => handleJoin('TEAM_B')}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md transition"
                >
                  Join Team Blue
                </button>
              )}
            </div>
          </div>

          {isUserParticipant && (
            <div className="flex justify-center">
              <button
                onClick={handleSwitchTeam}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Switch Team ⇄
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── ACTIVE STADIUM & VICTORY VIEW ─────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Stadium Top HUD */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-lg">
        {/* Team Red Progress */}
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <div className="space-y-1 flex-1 max-w-[200px]">
            <div className="flex justify-between text-[11px] font-black">
              <span className="text-rose-400">Team Red</span>
              <span className="text-white">{teamAScore} pts</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${Math.min(100, teamAScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Match Banner / Timer */}
        <div className="flex items-center gap-3 text-center">
          <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {roomData.status === 'FINISHED' ? 'MATCH ENDED' : 'BATTLE IN PROGRESS'}
          </div>
          <span className="text-xs font-extrabold text-slate-400 truncate hidden md:inline">
            {roomData.problem.title}
          </span>
        </div>

        {/* Team Blue Progress */}
        <div className="flex items-center justify-end gap-3 w-1/3 text-right">
          <div className="space-y-1 flex-1 max-w-[200px]">
            <div className="flex justify-between text-[11px] font-black">
              <span className="text-white">{teamBScore} pts</span>
              <span className="text-blue-400">Team Blue</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ml-auto"
                style={{ width: `${Math.min(100, teamBScore)}%` }}
              />
            </div>
          </div>
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>

      {/* Main Stadium Split View */}
      <div className="flex flex-1 gap-2 p-2 overflow-hidden min-h-0">
        {/* Left Side: Problem Statement & Live Battle Log */}
        <div className="flex flex-col w-[420px] shrink-0 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="flex items-center border-b border-slate-800 px-3 bg-slate-950/60">
            <button
              onClick={() => setLeftTab('problem')}
              className={`py-3 px-4 text-xs font-extrabold border-b-2 transition ${
                leftTab === 'problem'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Problem Description
            </button>
            <button
              onClick={() => setLeftTab('battlelog')}
              className={`py-3 px-4 text-xs font-extrabold border-b-2 transition ${
                leftTab === 'battlelog'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Combat Roster ({roomData.participants.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed text-slate-300">
            {leftTab === 'problem' ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-white">{roomData.problem.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {roomData.problem.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        roomData.problem.difficulty === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : roomData.problem.difficulty === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {roomData.problem.difficulty}
                    </span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap">{roomData.problem.description}</div>

                {roomData.problem.examples.map((ex, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                    <div className="text-slate-400 font-bold">Example {i + 1}:</div>
                    <div><span className="text-slate-500">Input:</span> {ex.input}</div>
                    <div><span className="text-slate-500">Output:</span> {ex.output}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Combatants
                </div>
                {roomData.participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          p.team === 'TEAM_A' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                      />
                      <span className="font-bold text-white">
                        {p.isBot ? p.botName : (p.user?.name || p.user?.email?.split('@')[0] || 'Coder')}
                      </span>
                      {p.isBot && (
                        <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400">{p.passedCases} tests</span>
                      <span className="font-extrabold text-amber-400">{p.score} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Editor & Execution Runner */}
        <div className="flex flex-col flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-400" />
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as LangType;
                  setLanguage(newLang);
                  if (roomData.problem.starterCode[newLang]) {
                    setCode(roomData.problem.starterCode[newLang]);
                  } else {
                    setCode(DEFAULT_STARTER[newLang]);
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-rose-500"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCustom}
                disabled={running || submitting}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Code
              </button>

              <button
                onClick={handleSubmitBattle}
                disabled={running || submitting || roomData.status === 'FINISHED'}
                className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-xs font-black text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Swords className="w-3.5 h-3.5" />}
                Submit for Battle
              </button>
            </div>
          </div>

          {/* Monaco Code Editor */}
          <div className="flex-1 min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              theme="vs-dark"
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Execution Results Panel */}
          <div className="h-44 bg-slate-950 border-t border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBottomTab('testcase')}
                  className={`text-[11px] font-bold ${
                    bottomTab === 'testcase' ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  Custom Test Input
                </button>
                <button
                  onClick={() => setBottomTab('result')}
                  className={`text-[11px] font-bold ${
                    bottomTab === 'result' ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  Battle Verdict
                </button>
              </div>

              {verdict && (
                <div
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                    verdict === 'ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {verdict} ({passedCases !== null ? `${passedCases}/${roomData.problem.totalCases} passed` : ''})
                </div>
              )}
            </div>

            <div className="flex-1 p-3 overflow-y-auto text-xs font-mono">
              {bottomTab === 'testcase' ? (
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom standard input..."
                  className="w-full h-full bg-transparent text-slate-200 resize-none focus:outline-none"
                />
              ) : (
                <div className="space-y-2">
                  {stdout && (
                    <div>
                      <span className="text-slate-500 font-bold">Standard Output:</span>
                      <pre className="text-emerald-300 mt-1 whitespace-pre-wrap">{stdout}</pre>
                    </div>
                  )}
                  {stderr && (
                    <div>
                      <span className="text-rose-400 font-bold">Error Output:</span>
                      <pre className="text-rose-300 mt-1 whitespace-pre-wrap">{stderr}</pre>
                    </div>
                  )}
                  {!stdout && !stderr && (
                    <div className="text-slate-500 italic">No output yet. Run or submit your battle code above.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FINISHED / VICTORY MODAL OVERLAY */}
      {roomData.status === 'FINISHED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                <Crown className="w-3.5 h-3.5" /> Battle Concluded
              </div>
              <h2 className="text-3xl font-black text-white">
                {roomData.mode === 'ai_bot'
                  ? roomData.winnerTeam === 'TEAM_A'
                    ? '🎉 You Defeated the AI Bot!'
                    : '🤖 AI Rival Won This Round!'
                  : roomData.winnerTeam === 'TEAM_A'
                  ? '🔴 Team Red Victory!'
                  : '🔵 Team Blue Victory!'}
              </h2>
              <p className="text-xs text-slate-400">
                {roomData.mode === 'ai_bot'
                  ? roomData.winnerTeam === 'TEAM_A'
                    ? 'Flawless victory! You coded and passed the test cases faster than the AI rival.'
                    : 'The AI passed all test cases first. Practice and challenge it again!'
                  : 'The battle is over. Test cases were conquered and the winner has taken the arena!'}
              </p>
            </div>

            {/* Scorecard */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-rose-400">Team Red Final Score:</span>
                <span className="text-white">{teamAScore} pts</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-blue-400">Team Blue Final Score:</span>
                <span className="text-white">{teamBScore} pts</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/battles"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition"
              >
                Back to Battle Arenas
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

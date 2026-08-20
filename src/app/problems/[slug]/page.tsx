'use client';

import React, { use, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Send, Loader2, Code2, Terminal, CheckCircle, XCircle,
  Lock, CheckCircle2, ExternalLink, ChevronUp, ChevronDown,
  BarChart2, Clock, Tag, Lightbulb, FileText, RotateCcw, AlertTriangle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemDetailType {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tier: string;
  description: string;
  constraints: string;
  acceptanceRate: number;
  examples: Example[];
  starterCode: Record<string, string>;
}

type LangType = 'python' | 'javascript' | 'java' | 'cpp';

const DEFAULT_STARTER: Record<LangType, string> = {
  python: `import sys

def main():
    data = sys.stdin.read().split()
    if not data: return
    print(" ".join(data))

if __name__ == '__main__':
    main()
`,
  javascript: `// Use readline() to read each input line
function main() {
  const first = readline().trim();
  if (first) console.log(first);
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
#include <vector>
#include <string>
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

function DifficultyBadge({ d }: { d: string }) {
  return (
    <span className={
      d === 'Easy' ? 'badge-easy' : d === 'Medium' ? 'badge-medium' : 'badge-hard'
    }>{d}</span>
  );
}

import { AdRewardModal } from '@/components/AdRewardModal';

function LockedScreen({
  tier,
  slug,
  onUnlocked,
}: {
  tier: string;
  slug: string;
  onUnlocked: () => void;
}) {
  const [adModalOpen, setAdModalOpen] = useState(false);
  const isMid = tier === 'mid';
  const label = isMid ? 'Mid' : 'Pro';
  const price = isMid ? '₹200' : '₹700';
  const features = isMid
    ? ['Unlock all Medium problems', 'Curated Study Plans & Topic Quests', 'Priority Execution Runner']
    : ['Unlock all Medium & Hard problems', 'Live Contest Participation', 'Execution Memory Profiling'];

  return (
    <div className="max-w-lg mx-auto my-12 text-center space-y-6 px-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-[11px] font-bold">
          <AlertTriangle className="w-3.5 h-3.5" /> Premium Content
        </div>
        <h2 className="text-2xl font-black text-slate-900">{label} Tier Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          This {isMid ? 'Medium' : 'Hard'} problem is reserved for subscribers, but you can also unlock it for{' '}
          <strong className="text-slate-800 font-bold">12 hours for free</strong> by watching a short sponsor ad!
        </p>
      </div>

      {/* Free Ad Unlock Option */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-md text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase text-emerald-900 tracking-wide">
              Free Access Option
            </span>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
            100% Free
          </span>
        </div>
        <p className="text-xs text-emerald-800/90 leading-relaxed">
          Watch a 15-second sponsor video to get instant <strong>12-hour full access</strong> to solve and submit this problem.
        </p>
        <button
          onClick={() => setAdModalOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
        >
          <Play className="w-4 h-4 fill-current" /> Watch 15s Ad to Unlock for 12 Hours
        </button>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">or upgrade permanently</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div>
            <span className="text-xl font-black text-slate-900">{price}</span>
            <span className="text-xs text-slate-400 font-medium"> / month</span>
          </div>
          <Link href="/pricing" className="btn-primary text-xs inline-flex items-center gap-1.5 py-2 px-4">
            Get {label} Access <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div>
        <Link href="/problems" className="btn-ghost text-xs text-slate-400 hover:text-slate-600">
          ← Back to All Problems
        </Link>
      </div>

      <AdRewardModal
        slug={slug}
        requiredTier={tier}
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        onUnlocked={() => {
          setAdModalOpen(false);
          onUnlocked();
        }}
      />
    </div>
  );
}

import { DSAVisualizer } from '@/components/DSAVisualizer';
import {
  Sparkles,
  Sliders,
  CheckCheck,
  FileEdit,
  Cpu,
  HelpCircle,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();

  const [problem, setProblem] = useState<ProblemDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lockedTier, setLockedTier] = useState<string | null>(null);

  // Editor state
  const [language, setLanguage] = useState<LangType>('python');
  const [code, setCode] = useState('');
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState<number>(13);

  // Left panel tab
  const [leftTab, setLeftTab] = useState<'description' | 'ai_mentor' | 'visualizer' | 'editorial' | 'notes' | 'submissions'>('description');

  // AI Mentor & Complexity State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState<{ tier: number; title: string; content: string; takeaway: string } | null>(null);
  const [aiComplexity, setAiComplexity] = useState<{
    timeComplexity: string;
    spaceComplexity: string;
    verdict: string;
    bottlenecks: string[];
    suggestions: string[];
  } | null>(null);
  const [aiErrorExplanation, setAiErrorExplanation] = useState<{
    summary: string;
    rootCause: string;
    fixStrategy: string;
    checklist: string[];
  } | null>(null);

  // Personal Notes State
  const [personalNotes, setPersonalNotes] = useState('');
  const [savedNotesNotice, setSavedNotesNotice] = useState(false);

  // Bottom panel
  const [bottomOpen, setBottomOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<'testcase' | 'result'>('testcase');
  const [customInput, setCustomInput] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [casesPassed, setCasesPassed] = useState<number | null>(null);
  const [casesTotal, setCasesTotal] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<'problem' | 'editor' | 'console'>('problem');

  useEffect(() => {
    fetchProblem();
  }, [resolvedParams.slug]);

  // Load saved draft per problem + language
  useEffect(() => {
    if (!problem) return;
    const saved = localStorage.getItem(`sparkcode_draft_${problem.slug}_${language}`);
    if (saved) {
      setCode(saved);
    } else {
      setCode(problem.starterCode[language] || DEFAULT_STARTER[language]);
    }
  }, [language, problem]);

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || '';
    setCode(newCode);
    if (problem) {
      localStorage.setItem(`sparkcode_draft_${problem.slug}_${language}`, newCode);
    }
  };

  const [adUnlockedHours, setAdUnlockedHours] = useState<number | null>(null);

  const fetchProblem = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/problems/${resolvedParams.slug}`);
      if (!res.ok) {
        if (res.status === 403) {
          const d = await res.json().catch(() => ({}));
          setLockedTier(d.requiredTier ?? 'mid');
          return;
        }
        throw new Error('Problem not found');
      }
      const data = await res.json();
      setProblem(data);
      setLockedTier(null);
      if (data.examples?.[0]) setCustomInput(data.examples[0].input);

      // Check if unlocked via ad
      try {
        const unlockRes = await fetch(`/api/problems/${resolvedParams.slug}/unlock-ad`);
        if (unlockRes.ok) {
          const uData = await unlockRes.json();
          if (uData.isUnlocked && uData.remainingMinutes) {
            setAdUnlockedHours(Math.max(1, Math.ceil(uData.remainingMinutes / 60)));
          }
        }
      } catch {}
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  // Load personal notes
  useEffect(() => {
    if (!problem) return;
    const savedNotes = localStorage.getItem(`sparkcode_notes_${problem.slug}`);
    if (savedNotes) setPersonalNotes(savedNotes);
  }, [problem]);

  const handleSaveNotes = () => {
    if (!problem) return;
    localStorage.setItem(`sparkcode_notes_${problem.slug}`, personalNotes);
    setSavedNotesNotice(true);
    setTimeout(() => setSavedNotesNotice(false), 2000);
  };

  const handleFetchHint = async (tier: number) => {
    if (!problem) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hint',
          problemId: problem.id,
          language,
          hintTier: tier,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiHint(data);
      }
    } catch {
      // Ignore
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzeComplexity = async () => {
    if (!problem) return;
    setAiLoading(true);
    setLeftTab('ai_mentor');
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_complexity',
          problemId: problem.id,
          language,
          code,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiComplexity(data);
      }
    } catch {
      // Ignore
    } finally {
      setAiLoading(false);
    }
  };

  const handleExplainError = async () => {
    if (!problem) return;
    setAiLoading(true);
    setLeftTab('ai_mentor');
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_error',
          problemId: problem.id,
          language,
          code,
          errorDetails: { verdict: verdict || 'RUNTIME_ERROR', stdout, stderr },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiErrorExplanation(data);
      }
    } catch {
      // Ignore
    } finally {
      setAiLoading(false);
    }
  };

  const handleRun = async () => {
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

  const handleSubmit = async () => {
    if (!session?.user) { setStderr('Please sign in to submit.'); setBottomOpen(true); setBottomTab('result'); return; }
    setSubmitting(true);
    setVerdict(null);
    setStdout('');
    setStderr('');
    setBottomTab('result');
    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem?.id, language, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Judging failed');
      setVerdict(data.verdict);
      setCasesPassed(data.passedCases);
      setCasesTotal(data.totalCases);
      setStdout(data.stdout || '');
      setStderr(data.stderr || '');
    } catch (e: any) {
      setStderr(e.message || 'Submit error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetCode = () => {
    if (!problem) return;
    const starter = problem.starterCode[language] || DEFAULT_STARTER[language];
    setCode(starter);
    localStorage.removeItem(`sparkcode_draft_${problem.slug}_${language}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs">Loading problem...</span>
      </div>
    );
  }

  if (lockedTier) {
    return (
      <LockedScreen
        tier={lockedTier}
        slug={resolvedParams.slug}
        onUnlocked={() => {
          setLockedTier(null);
          fetchProblem();
        }}
      />
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 px-4">
        <h2 className="text-lg font-extrabold text-slate-900">Problem not found</h2>
        <p className="text-xs text-slate-500">{error || 'This problem does not exist.'}</p>
        <Link href="/problems" className="btn-primary text-xs inline-flex">Back to Problems</Link>
      </div>
    );
  }

  const extMap: Record<LangType, string> = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp' };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-100 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <Link href="/problems" className="text-[10px] text-indigo-600 font-bold hover:underline shrink-0">
          ← Problems
        </Link>
        <span className="text-slate-300">|</span>
        <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate flex-1">{problem.title}</h1>
        {adUnlockedHours !== null && (
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse">
            ⏳ {adUnlockedHours}h
          </span>
        )}
        <DifficultyBadge d={problem.difficulty} />
        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase hidden sm:inline">
          {problem.category}
        </span>
        {problem.acceptanceRate > 0 && (
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            {problem.acceptanceRate.toFixed(1)}% acc
          </span>
        )}
      </div>

      {/* Mobile Segmented View Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center justify-around bg-white border-b border-slate-200 px-2 py-1 shrink-0 text-xs font-bold gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab('problem')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            mobileTab === 'problem'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📄 Problem
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            mobileTab === 'editor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          💻 Code Editor
        </button>
        <button
          type="button"
          onClick={() => { setMobileTab('console'); setBottomOpen(true); }}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            mobileTab === 'console'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚡ Output
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 gap-2 p-1.5 sm:p-2 overflow-hidden min-h-0">

        {/* Left Panel */}
        <div className={`flex flex-col w-full lg:w-[440px] shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs ${
          mobileTab === 'problem' ? 'flex flex-1' : 'hidden lg:flex'
        }`}>
          <div className="flex items-center border-b border-slate-200 px-1.5 gap-0 shrink-0 bg-slate-50 overflow-x-auto scrollbar-none">
            {([
              { key: 'description', label: 'Description', icon: FileText },
              { key: 'ai_mentor', label: 'AI Mentor', icon: Sparkles },
              { key: 'visualizer', label: 'Visualizer', icon: Cpu },
              { key: 'editorial', label: 'Editorial', icon: Lightbulb },
              { key: 'notes', label: 'Notes', icon: FileEdit },
              { key: 'submissions', label: 'Submissions', icon: Clock },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setLeftTab(key)}
                className={`flex items-center gap-1 px-2.5 py-2.5 text-[11px] font-bold border-b-2 whitespace-nowrap transition-colors ${
                  leftTab === key
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-3 h-3 ${key === 'ai_mentor' ? 'text-purple-600' : ''}`} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {leftTab === 'description' && (
              <div className="p-5 space-y-5">
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                    <Tag className="w-2.5 h-2.5" />{problem.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                    <BarChart2 className="w-2.5 h-2.5" />{problem.acceptanceRate.toFixed(1)}% Acceptance
                  </span>
                </div>

                <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>

                {problem.examples.map((ex, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-600">Example {i + 1}:</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] font-mono space-y-1.5">
                      <div><span className="font-bold text-slate-500">Input:</span> <span className="text-slate-800">{ex.input}</span></div>
                      <div><span className="font-bold text-slate-500">Output:</span> <span className="text-slate-800">{ex.output}</span></div>
                      {ex.explanation && (
                        <div className="pt-1 text-slate-500 italic"><span className="font-bold not-italic">Explanation:</span> {ex.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <p className="text-xs font-extrabold text-slate-600 mb-2">Constraints:</p>
                  <div className="text-[11px] font-mono text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    {problem.constraints}
                  </div>
                </div>
              </div>
            )}

            {/* AI MENTOR & ASSISTANT TAB */}
            {leftTab === 'ai_mentor' && (
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900">AI Coding Assistant</h3>
                      <p className="text-[10px] text-slate-500">Socratic hints & complexity analysis</p>
                    </div>
                  </div>
                </div>

                {/* Socratic Progressive Hints */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                    Socratic Progressive Hints
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => handleFetchHint(tier)}
                        disabled={aiLoading}
                        className="py-2 px-2 text-[10px] font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition disabled:opacity-50"
                      >
                        {tier === 1 ? 'Hint 1 (Pattern)' : tier === 2 ? 'Hint 2 (Steps)' : 'Hint 3 (Edge)'}
                      </button>
                    ))}
                  </div>

                  {aiHint && (
                    <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 animate-in fade-in duration-200">
                      <div className="text-xs font-extrabold text-purple-900">{aiHint.title}</div>
                      <div className="text-xs text-purple-800 leading-relaxed whitespace-pre-wrap">
                        {aiHint.content}
                      </div>
                      <div className="text-[10px] font-bold text-purple-600 bg-purple-100/60 p-2 rounded-lg">
                        💡 Key Takeaway: {aiHint.takeaway}
                      </div>
                    </div>
                  )}
                </div>

                {/* Big-O Complexity Analyzer */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      Big-O Complexity Review
                    </label>
                    <button
                      onClick={handleAnalyzeComplexity}
                      disabled={aiLoading}
                      className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
                    >
                      {aiLoading ? 'Analyzing...' : 'Analyze Editor Code'}
                    </button>
                  </div>

                  {aiComplexity && (
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-md animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                          <div className="text-[10px] text-slate-400 font-bold">Time Complexity</div>
                          <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
                            {aiComplexity.timeComplexity}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                          <div className="text-[10px] text-slate-400 font-bold">Space Complexity</div>
                          <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                            {aiComplexity.spaceComplexity}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 font-medium leading-relaxed">
                        {aiComplexity.verdict}
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-400">
                        {aiComplexity.bottlenecks.map((b, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span className="text-amber-400">•</span> {b}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Error Explainer Card */}
                {aiErrorExplanation && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in duration-200">
                    <div className="text-xs font-black text-rose-900">
                      🐞 {aiErrorExplanation.summary}
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      {aiErrorExplanation.rootCause}
                    </p>
                    <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-xs text-slate-700 space-y-1 font-medium">
                      <div className="font-bold text-rose-700">Fix Strategy:</div>
                      <div>{aiErrorExplanation.fixStrategy}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DSA VISUALIZER TAB */}
            {leftTab === 'visualizer' && (
              <div className="p-2">
                <DSAVisualizer />
              </div>
            )}

            {/* EDITORIAL TAB */}
            {leftTab === 'editorial' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Official Editorial & Solution Guide</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
                  <div className="font-bold text-slate-900">Recommended Optimal Approach:</div>
                  <p>
                    1. Utilize hash mapping or two-pointer invariants to achieve linear $O(N)$ runtime.
                  </p>
                  <p>
                    2. Maintain constant auxiliary space $O(1)$ whenever possible to maximize memory efficiency.
                  </p>
                </div>
              </div>
            )}

            {/* PERSONAL NOTES TAB */}
            {leftTab === 'notes' && (
              <div className="p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <FileEdit className="w-4 h-4 text-indigo-600" />
                    <span>Personal Scratchpad & Notes</span>
                  </div>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition"
                  >
                    {savedNotesNotice ? 'Saved ✓' : 'Save Notes'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Notes are auto-saved to local browser storage for this problem.</p>
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Write your key takeaways, time complexity thoughts, or edge case reminders here..."
                  className="w-full flex-1 min-h-[260px] p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 resize-none focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* SUBMISSIONS TAB */}
            {leftTab === 'submissions' && (
              <div className="p-5 text-center space-y-2 py-8">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">Submissions History</p>
                <p className="text-[10px] text-slate-400">Click submit on the right to evaluate your code live.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Monaco Editor & Controls */}
        <div className={`flex flex-col flex-1 min-w-0 gap-2 overflow-hidden ${
          mobileTab !== 'problem' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Top Editor Control Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as LangType)}
                className="input text-xs h-7 py-0 w-36"
              >
                <option value="python">Python 3.10</option>
                <option value="javascript">JavaScript (Node)</option>
                <option value="java">Java 15</option>
                <option value="cpp">C++ (GCC 11)</option>
              </select>

              {/* Theme Switcher */}
              <select
                value={editorTheme}
                onChange={e => setEditorTheme(e.target.value as any)}
                className="input text-xs h-7 py-0 w-24"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>

              {/* Font Size Adjusters */}
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setFontSize(Math.max(11, fontSize - 1))}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 rounded"
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-700 px-1">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(18, fontSize + 1))}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 rounded"
                  title="Increase font size"
                >
                  A+
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyzeComplexity}
                disabled={aiLoading}
                className="btn-ghost text-xs h-7 px-2.5 flex items-center gap-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
                title="Review Big-O Complexity"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                AI Review
              </button>

              <button
                onClick={resetCode}
                className="btn-ghost text-xs h-7 px-2 flex items-center gap-1 text-slate-400 hover:text-slate-600"
                title="Reset to starter code"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>

              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 disabled:opacity-50"
              >
                {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Run
              </button>

              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="btn-primary text-xs h-8 px-3.5 flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Submit
              </button>
            </div>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-xs min-h-0">
            <div className="px-4 py-1.5 border-b border-slate-800 flex items-center gap-2 text-slate-400 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 font-mono">main.{extMap[language]}</span>
            </div>
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : language === 'cpp' ? 'cpp' : language}
              value={code}
              theme={editorTheme}
              onChange={handleCodeChange}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Panel */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs shrink-0">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setBottomTab('testcase'); setBottomOpen(true); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    bottomTab === 'testcase' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  Custom Testcase
                </button>
                <button
                  onClick={() => { setBottomTab('result'); setBottomOpen(true); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    bottomTab === 'result' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  Execution Result
                </button>
              </div>

              <div className="flex items-center gap-2">
                {verdict && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                        verdict === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {verdict}
                    </span>
                    {verdict !== 'ACCEPTED' && (
                      <button
                        onClick={handleExplainError}
                        className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Explain Error with AI
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setBottomOpen(!bottomOpen)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  {bottomOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {bottomOpen && (
              <div className="p-3 max-h-36 overflow-y-auto font-mono text-xs">
                {bottomTab === 'testcase' ? (
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Enter custom standard input..."
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-2 resize-none text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                ) : (
                  <div className="space-y-1 text-slate-800">
                    {stdout && (
                      <div>
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Standard Output:</span>
                        <pre className="p-2 bg-slate-50 rounded border border-slate-200 mt-1 whitespace-pre-wrap">{stdout}</pre>
                      </div>
                    )}
                    {stderr && (
                      <div>
                        <span className="text-rose-500 font-bold text-[10px] uppercase">Error Output:</span>
                        <pre className="p-2 bg-rose-50 text-rose-700 rounded border border-rose-200 mt-1 whitespace-pre-wrap">{stderr}</pre>
                      </div>
                    )}
                    {!stdout && !stderr && (
                      <div className="text-slate-400 italic">No output yet. Run or submit your code above.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

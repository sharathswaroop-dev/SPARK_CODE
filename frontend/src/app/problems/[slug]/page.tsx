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

function LockedScreen({ tier }: { tier: string }) {
  const isMid = tier === 'mid';
  const label = isMid ? 'Mid' : 'Pro';
  const price = isMid ? '\u20b9200' : '\u20b9700';
  const features = isMid
    ? ['Unlock all Medium problems', 'Curated Study Plans & Topic Quests', 'Priority Execution Runner']
    : ['Unlock all Medium & Hard problems', 'Live Contest Participation', 'Execution Memory Profiling'];
  return (
    <div className="max-w-md mx-auto my-20 text-center space-y-6 px-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-slate-900">{label} Tier Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          This {isMid ? 'Medium' : 'Hard'} problem is available to{' '}
          <span className="font-bold text-amber-700">{label}</span> subscribers.
        </p>
      </div>
      <ul className="text-left space-y-2">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <p className="text-2xl font-extrabold text-slate-900">{price}<span className="text-xs font-normal text-slate-400 ml-1">/ month</span></p>
        <Link href="/pricing" className="btn-primary text-xs inline-flex gap-1.5">
          View Pricing Plans <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <div><Link href="/problems" className="btn-ghost text-xs text-slate-400">\u2190 Back to Problems</Link></div>
      </div>
    </div>
  );
}

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

  // Left panel tab
  const [leftTab, setLeftTab] = useState<'description' | 'solutions' | 'submissions'>('description');

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
      if (data.examples?.[0]) setCustomInput(data.examples[0].input);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
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

  if (lockedTier) return <LockedScreen tier={lockedTier} />;

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
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <Link href="/problems" className="text-[10px] text-indigo-600 font-bold hover:underline shrink-0">
          \u2190 Problems
        </Link>
        <span className="text-slate-300">|</span>
        <h1 className="text-sm font-extrabold text-slate-900 truncate flex-1">{problem.title}</h1>
        <DifficultyBadge d={problem.difficulty} />
        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
          {problem.category}
        </span>
        {problem.acceptanceRate > 0 && (
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            {problem.acceptanceRate.toFixed(1)}% accepted
          </span>
        )}
      </div>

      {/* Main area */}
      <div className="flex flex-1 gap-2 p-2 overflow-hidden min-h-0">

        {/* Left Panel */}
        <div className="flex flex-col w-[420px] shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="flex items-center border-b border-slate-200 px-2 gap-0 shrink-0 bg-slate-50">
            {([
              { key: 'description', label: 'Description', icon: FileText },
              { key: 'solutions', label: 'Solutions', icon: Lightbulb },
              { key: 'submissions', label: 'Submissions', icon: Clock },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setLeftTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-colors ${
                  leftTab === key
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3 h-3" />{label}
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

            {leftTab === 'solutions' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Solutions & Hints</span>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-700 mb-1">Approach Tip</p>
                  <p className="text-[11px] text-indigo-600 leading-relaxed">
                    Test your solution with single elements, empty inputs, and large boundary values before submitting.
                  </p>
                </div>
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className="p-5 text-center space-y-2 py-8">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">Submissions History</p>
                <p className="text-[10px] text-slate-400">Your recent submissions are evaluated live upon clicking Submit.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col flex-1 min-w-0 gap-2 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shrink-0 shadow-xs">
            <Code2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as LangType)}
              className="input text-xs h-7 py-0 w-44"
            >
              <option value="python">Python 3.10</option>
              <option value="javascript">JavaScript (Node 18)</option>
              <option value="java">Java 15</option>
              <option value="cpp">C++ (GCC 11 / C++17)</option>
            </select>

            <button
              onClick={resetCode}
              className="btn-ghost text-xs h-7 px-2 flex items-center gap-1 text-slate-400 hover:text-slate-600 ml-auto"
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
              className="btn-primary text-xs h-8 px-3 flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Submit
            </button>
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
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                lineHeight: 20,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Bottom Console Panel */}
          <div className={
            `bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col shrink-0 transition-all ${
              bottomOpen ? 'h-52' : 'h-10'
            }`
          }>
            <div className="flex items-center border-b border-slate-200 px-2 gap-0 shrink-0 bg-slate-50 rounded-t-xl">
              <button
                onClick={() => { setBottomTab('testcase'); setBottomOpen(true); }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
                  bottomTab === 'testcase' && bottomOpen
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Terminal className="w-3 h-3" />Testcase
              </button>
              <button
                onClick={() => { setBottomTab('result'); setBottomOpen(true); }}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
                  bottomTab === 'result' && bottomOpen
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart2 className="w-3 h-3" />Test Result
                {verdict && (
                  <span className={`ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    verdict === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                    verdict === 'COMPILATION_ERROR' ? 'bg-amber-100 text-amber-800' :
                    verdict === 'TIME_LIMIT_EXCEEDED' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {verdict}
                  </span>
                )}
              </button>
              <button
                onClick={() => setBottomOpen(v => !v)}
                className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 mr-1"
              >
                {bottomOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {bottomOpen && (
              <div className="flex-1 overflow-auto p-3 text-[11px] font-mono">
                {bottomTab === 'testcase' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Custom Input (stdin)
                    </label>
                    <textarea
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      className="w-full h-24 bg-slate-950 text-emerald-300 border border-slate-700 rounded-lg p-2.5 text-[11px] font-mono resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter custom stdin input..."
                      spellCheck={false}
                    />
                  </div>
                )}

                {bottomTab === 'result' && (
                  <div className="space-y-2">
                    {(running || submitting) && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        <span>{running ? 'Running execution...' : 'Judging against test cases...'}</span>
                      </div>
                    )}
                    {verdict && (
                      <div className={`flex items-center gap-2 font-bold text-xs ${
                        verdict === 'ACCEPTED' ? 'text-emerald-600' :
                        verdict === 'COMPILATION_ERROR' ? 'text-amber-600' :
                        verdict === 'TIME_LIMIT_EXCEEDED' ? 'text-orange-600' : 'text-rose-600'
                      }`}>
                        {verdict === 'ACCEPTED' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span>{verdict}</span>
                        {casesPassed !== null && (
                          <span className="text-slate-400 font-normal text-[10px]">
                            ({casesPassed}/{casesTotal} test cases passed)
                          </span>
                        )}
                      </div>
                    )}
                    {stderr && (
                      <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-rose-700">Error / Compiler Output</span>
                        <pre className="whitespace-pre-wrap text-[10px]">{stderr}</pre>
                      </div>
                    )}
                    {stdout && (
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 text-slate-500">Output</span>
                        <pre className="text-emerald-700 whitespace-pre-wrap">{stdout}</pre>
                      </div>
                    )}
                    {!running && !submitting && !verdict && !stdout && !stderr && (
                      <span className="text-slate-500 italic">Run or submit your code to view judgment.</span>
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

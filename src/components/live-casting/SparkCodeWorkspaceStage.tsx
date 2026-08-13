'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  Loader2,
  Code2,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  ChevronDown,
  Layers,
  Check,
} from 'lucide-react';
import { RoomRunOutput } from '@/types/live-casting';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemDetail {
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
  starterCode?: Record<string, string>;
}

interface SparkCodeWorkspaceStageProps {
  problems: { id: string; slug: string; title: string }[];
  canEdit: boolean;
  liveCode: string;
  liveLanguage: string;
  onCodeChange: (val: string) => void;
  onLanguageChange: (lang: string) => void;
  stdin: string;
  onStdinChange: (val: string) => void;
  onRunCode: () => void;
  isRunning: boolean;
  lastRunOutput: RoomRunOutput | null;
}

function DifficultyBadge({ d }: { d: string }) {
  if (d === 'Easy') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
        Easy
      </span>
    );
  }
  if (d === 'Medium') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
        Medium
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
      Hard
    </span>
  );
}

export default function SparkCodeWorkspaceStage({
  problems,
  canEdit,
  liveCode,
  liveLanguage,
  onCodeChange,
  onLanguageChange,
  stdin,
  onStdinChange,
  onRunCode,
  isRunning,
  lastRunOutput,
}: SparkCodeWorkspaceStageProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>('two-sum');
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'testcase'>('description');
  const [bottomTab, setBottomTab] = useState<'stdin' | 'output' | 'submission'>('stdin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionVerdict, setSubmissionVerdict] = useState<{
    verdict: string;
    casesPassed?: number;
    totalCases?: number;
    executionTimeMs?: number;
    error?: string;
  } | null>(null);

  // Set default problem slug from available problems
  useEffect(() => {
    if (problems.length > 0 && !selectedSlug) {
      setSelectedSlug(problems[0].slug);
    }
  }, [problems, selectedSlug]);

  // Load problem details when selected slug changes
  useEffect(() => {
    if (!selectedSlug) return;
    let isCancelled = false;
    async function loadProblem() {
      setLoadingProblem(true);
      try {
        const res = await fetch(`/api/problems/${selectedSlug}`);
        if (res.ok) {
          const d = await res.json();
          if (!isCancelled) {
            setProblem(d);
          }
        }
      } catch (err) {
        console.error('Failed to load problem details', err);
      } finally {
        if (!isCancelled) setLoadingProblem(false);
      }
    }
    loadProblem();
    return () => {
      isCancelled = true;
    };
  }, [selectedSlug]);

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setBottomTab('submission');
    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          language: liveLanguage,
          code: liveCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissionVerdict({
          verdict: data.verdict,
          casesPassed: data.casesPassed,
          totalCases: data.totalCases,
          executionTimeMs: data.executionTimeMs,
        });
      } else {
        setSubmissionVerdict({
          verdict: 'Error',
          error: data.error || 'Submission failed',
        });
      }
    } catch (err: any) {
      setSubmissionVerdict({
        verdict: 'Error',
        error: err.message || 'Submission request failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#141518] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Workspace Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Problem Selector */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Problem:</span>
          </div>

          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            disabled={!canEdit}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none font-semibold max-w-[220px]"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.title}
              </option>
            ))}
            {problems.length === 0 && (
              <option value="two-sum">Two Sum</option>
            )}
          </select>

          {problem && <DifficultyBadge d={problem.difficulty} />}
        </div>

        {/* Right: Language Selector, Run Code, Submit */}
        <div className="flex items-center gap-2">
          <select
            value={liveLanguage}
            disabled={!canEdit}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none"
          >
            <option value="python">Python 3.10</option>
            <option value="javascript">JavaScript (Node 18)</option>
            <option value="java">Java 15</option>
            <option value="cpp">C++ (GCC 11)</option>
          </select>

          {canEdit && (
            <>
              <button
                type="button"
                onClick={onRunCode}
                disabled={isRunning || isSubmitting}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                )}
                <span>Run</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isRunning}
                className="px-3.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Two-Column Split Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Column: Problem Statement / Details */}
        <div className="lg:col-span-5 flex flex-col bg-[#111215] overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-800/80 px-4 bg-slate-900/40">
            <button
              type="button"
              onClick={() => setActiveLeftTab('description')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                activeLeftTab === 'description'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveLeftTab('testcase')}
              className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                activeLeftTab === 'testcase'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Examples &amp; Notes
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-slate-300 text-xs leading-relaxed">
            {loadingProblem ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                <span>Loading problem statement...</span>
              </div>
            ) : problem ? (
              <>
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white">{problem.title}</h2>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Category: <strong className="text-slate-200">{problem.category}</strong></span>
                    <span>•</span>
                    <span>Acceptance: <strong className="text-slate-200">{(problem.acceptanceRate * 100).toFixed(1)}%</strong></span>
                  </div>
                </div>

                <div className="text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {problem.description}
                </div>

                {/* Examples */}
                {problem.examples && problem.examples.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Examples
                    </h3>
                    {problem.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5 font-mono text-[11px]"
                      >
                        <div className="text-slate-400 font-sans font-bold">Example {i + 1}:</div>
                        <div>
                          <span className="text-slate-500 select-none font-sans">Input: </span>
                          <span className="text-slate-200">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 select-none font-sans">Output: </span>
                          <span className="text-emerald-400 font-semibold">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-slate-400 font-sans text-[10px] pt-1 border-t border-slate-800/80">
                            <strong>Explanation: </strong>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div className="space-y-1.5 pt-2">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Constraints
                    </h3>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 whitespace-pre-line">
                      {problem.constraints}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">
                Select a problem to view details
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monaco Code Editor & Bottom Console */}
        <div className="lg:col-span-7 flex flex-col bg-[#1e1e1e] min-h-0 overflow-hidden">
          {/* Monaco Editor */}
          <div className="flex-1 relative min-h-[260px]">
            <Editor
              height="100%"
              language={
                liveLanguage === 'javascript'
                  ? 'javascript'
                  : liveLanguage === 'cpp'
                  ? 'cpp'
                  : liveLanguage
              }
              value={liveCode}
              onChange={(val) => {
                if (canEdit) {
                  onCodeChange(val || '');
                }
              }}
              theme="vs-dark"
              options={{
                readOnly: !canEdit,
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                minimap: { enabled: false },
                lineHeight: 20,
                padding: { top: 8 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Bottom Console Tabs (stdin / Output / Submission) */}
          <div className="h-44 border-t border-slate-800 bg-[#121316] flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/70 border-b border-slate-800 text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBottomTab('stdin')}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    bottomTab === 'stdin'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'hover:text-slate-200'
                  }`}
                >
                  Standard Input (stdin)
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab('output')}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    bottomTab === 'output'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'hover:text-slate-200'
                  }`}
                >
                  Run Output
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab('submission')}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    bottomTab === 'submission'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'hover:text-slate-200'
                  }`}
                >
                  Verdict &amp; Judge
                </button>
              </div>

              {lastRunOutput?.executionTimeMs !== undefined && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {lastRunOutput.executionTimeMs}ms
                </span>
              )}
            </div>

            {/* Console Content */}
            <div className="flex-1 p-2.5 overflow-auto font-mono text-xs">
              {bottomTab === 'stdin' && (
                <textarea
                  value={stdin}
                  onChange={(e) => onStdinChange(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Enter custom standard input (stdin) lines for execution..."
                  className="w-full h-full bg-transparent text-slate-200 placeholder-slate-600 outline-none resize-none font-mono text-xs"
                />
              )}

              {bottomTab === 'output' && (
                <div className="space-y-1">
                  {lastRunOutput ? (
                    <>
                      {lastRunOutput.stdout && (
                        <div className="text-emerald-400 whitespace-pre-wrap">
                          {lastRunOutput.stdout}
                        </div>
                      )}
                      {lastRunOutput.stderr && (
                        <div className="text-rose-400 whitespace-pre-wrap">
                          {lastRunOutput.stderr}
                        </div>
                      )}
                      {lastRunOutput.exitCode !== null && (
                        <div className="text-[10px] text-slate-500 pt-1">
                          Process exited with code {lastRunOutput.exitCode}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-600 italic">
                      Click &ldquo;Run&rdquo; to execute code against standard input.
                    </div>
                  )}
                </div>
              )}

              {bottomTab === 'submission' && (
                <div className="space-y-2">
                  {submissionVerdict ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {submissionVerdict.verdict === 'Accepted' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Accepted
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1 text-sm">
                            <XCircle className="w-4 h-4" /> {submissionVerdict.verdict}
                          </span>
                        )}
                      </div>

                      {submissionVerdict.casesPassed !== undefined && (
                        <div className="text-xs text-slate-300">
                          Passed {submissionVerdict.casesPassed} / {submissionVerdict.totalCases} test cases
                        </div>
                      )}

                      {submissionVerdict.error && (
                        <div className="text-xs text-rose-400">{submissionVerdict.error}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-600 italic">
                      Click &ldquo;Submit&rdquo; to test your code against all judge test cases.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

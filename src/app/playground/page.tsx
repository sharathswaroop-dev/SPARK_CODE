'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Loader2, Code2, Terminal, AlertCircle,
  ChevronUp, ChevronDown, RotateCcw, Zap, X,
} from 'lucide-react';

const STARTERS: Record<string, string> = {
  python: `# Python 3.10 — SparkCode Playground
n = int(input())
nums = list(map(int, input().split()))
print(sum(nums))
`,
  javascript: `// JavaScript (Node.js 18) — SparkCode Playground
// Use readline() to read each line of input
const n = parseInt(readline());
const nums = readline().split(' ').map(Number);
console.log(nums.reduce((a, b) => a + b, 0));
`,
  java: `// Java 15 — SparkCode Playground
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long sum = 0;
        for (int i = 0; i < n; i++) sum += sc.nextInt();
        System.out.println(sum);
    }
}
`,
  cpp: `// C++ (GCC 11 / C++17) — SparkCode Playground
#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    int n;
    if (cin >> n) {
        long long sum = 0;
        for (int i = 0; i < n; i++) {
            long long x; cin >> x; sum += x;
        }
        cout << sum << "\\n";
    }
    return 0;
}
`,
};

const DEFAULT_STDIN: Record<string, string> = {
  python:     '5\n1 2 3 4 5',
  javascript: '5\n1 2 3 4 5',
  java:       '5\n1 2 3 4 5',
  cpp:        '5\n1 2 3 4 5',
};

const LANG_OPTIONS = [
  { value: 'python',     label: 'Python 3.10',         ext: 'py'   },
  { value: 'javascript', label: 'JavaScript (Node 18)', ext: 'js'   },
  { value: 'java',       label: 'Java 15',             ext: 'java' },
  { value: 'cpp',        label: 'C++ (GCC 11)',         ext: 'cpp'  },
];

export default function PlaygroundPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode]         = useState(STARTERS.python);
  const [stdin, setStdin]       = useState(DEFAULT_STDIN.python);
  const [stdout, setStdout]     = useState('');
  const [stderr, setStderr]     = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [running, setRunning]   = useState(false);
  const [runTime, setRunTime]   = useState<number | null>(null);

  const [bottomOpen, setBottomOpen] = useState(true);
  const [bottomTab, setBottomTab]   = useState<'stdin' | 'output'>('stdin');

  // Mobile: toggle between editor and output panel
  const [mobileView, setMobileView] = useState<'editor' | 'output'>('editor');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTERS[lang] || '');
    setStdin(DEFAULT_STDIN[lang] || '');
    setStdout(''); setStderr(''); setExitCode(null); setRunTime(null);
  };

  const handleReset = () => {
    setCode(STARTERS[language] || '');
    setStdout(''); setStderr(''); setExitCode(null); setRunTime(null);
  };

  const handleRun = async () => {
    setRunning(true);
    setStdout(''); setStderr(''); setExitCode(null); setRunTime(null);
    setBottomTab('output');
    setBottomOpen(true);
    setMobileView('output');
    const start = Date.now();
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      setStdout(data.stdout || '');
      setStderr(data.stderr || '');
      setExitCode(data.exitCode ?? null);
      setRunTime(Date.now() - start);
    } catch (e: any) {
      setStderr(e.message || 'Failed to connect to execution engine.');
    } finally {
      setRunning(false);
    }
  };

  const ext       = LANG_OPTIONS.find(l => l.value === language)?.ext ?? 'py';
  const hasOutput = stdout || stderr;
  const isSuccess = exitCode === 0 && !stderr;

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── TOP TOOLBAR ────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white border-b border-slate-200 shrink-0 flex-wrap sm:flex-nowrap">
        {/* Title — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-indigo-700 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900 leading-tight">Coding Playground</p>
            <p className="text-[10px] text-slate-400 leading-tight hidden md:block">Real server-side containerized execution.</p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />

        {/* Language Select */}
        <select
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
          className="input text-xs h-9 py-0 w-full sm:w-44 md:w-52"
        >
          {LANG_OPTIONS.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        {/* Mobile view toggle */}
        <div className="flex sm:hidden items-center gap-1 bg-slate-100 rounded-xl p-0.5 shrink-0">
          <button
            onClick={() => setMobileView('editor')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mobileView === 'editor' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'}`}
          >
            Editor
          </button>
          <button
            onClick={() => setMobileView('output')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${mobileView === 'output' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'}`}
          >
            Output
            {hasOutput && (
              <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            )}
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <button
            onClick={handleReset}
            className="btn-ghost text-xs h-9 px-2 sm:px-2.5 flex items-center gap-1.5 text-slate-500"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleRun}
            disabled={running}
            className="btn-primary text-xs h-9 px-3 sm:px-5 flex items-center gap-1.5 disabled:opacity-60"
          >
            {running
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Play className="w-3.5 h-3.5 fill-current" />
            }
            <span>{running ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT: Editor top, Output panel bottom ── */}
      <div className="hidden sm:flex flex-col flex-1 gap-2 p-3 overflow-hidden min-h-0">
        {/* Editor Panel */}
        <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs min-h-0 flex flex-col">
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono font-semibold text-slate-700">main.{ext}</span>
              <span className="text-slate-300 hidden md:inline">|</span>
              <span className="text-slate-400 hidden md:inline">Tab size: 4 spaces</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              {runTime !== null && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  {runTime}ms
                </span>
              )}
              {exitCode !== null && (
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  exit {exitCode}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={val => setCode(val || '')}
              theme="vs"
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
                minimap: { enabled: false },
                lineHeight: 22,
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                wordWrap: 'on',
                lineNumbers: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Bottom Output/Stdin Panel */}
        <div className={`bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col shrink-0 transition-all duration-200 ${
          bottomOpen ? 'h-48 md:h-56' : 'h-10'
        }`}>
          <div className="flex items-center border-b border-slate-200 px-2 shrink-0 bg-slate-50 rounded-t-xl">
            {([
              { key: 'stdin'  as const, label: 'Stdin',  icon: Terminal },
              { key: 'output' as const, label: 'Output', icon: Zap      },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setBottomTab(key); setBottomOpen(true); }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-colors ${
                  bottomTab === key && bottomOpen
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
                {key === 'output' && hasOutput && (
                  <span className={`w-1.5 h-1.5 rounded-full ml-0.5 ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                )}
              </button>
            ))}
            <button
              onClick={() => setBottomOpen(v => !v)}
              className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 mr-1"
              title={bottomOpen ? 'Collapse' : 'Expand'}
            >
              {bottomOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {bottomOpen && (
            <div className="flex-1 overflow-auto p-3 font-mono text-[12px]">
              {bottomTab === 'stdin' && (
                <div className="h-full flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Provide inputs here...
                  </label>
                  <textarea
                    value={stdin}
                    onChange={e => setStdin(e.target.value)}
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[12px] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                    placeholder="Type your program input here..."
                    spellCheck={false}
                  />
                </div>
              )}

              {bottomTab === 'output' && (
                <div className="space-y-2 h-full overflow-auto">
                  {running && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span className="text-xs">Executing server-side...</span>
                    </div>
                  )}
                  {!running && !hasOutput && (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
                      Run the code to see execution output.
                    </div>
                  )}
                  {stderr && (
                    <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> stderr
                      </span>
                      <pre className="whitespace-pre-wrap text-[12px]">{stderr}</pre>
                    </div>
                  )}
                  {stdout && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">stdout</span>
                      <pre className="text-slate-800 whitespace-pre-wrap">{stdout}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT: Single panel, toggle between editor and output ── */}
      <div className="sm:hidden flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Editor panel */}
        {mobileView === 'editor' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Editor header bar */}
            <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="font-mono text-xs font-semibold text-slate-700">main.{ext}</span>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                {runTime !== null && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />{runTime}ms
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language === 'javascript' ? 'javascript' : language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={val => setCode(val || '')}
                theme="vs"
                options={{
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
                  minimap: { enabled: false },
                  lineHeight: 20,
                  padding: { top: 10, bottom: 10 },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'gutter',
                  wordWrap: 'on',
                  lineNumbers: 'on',
                }}
              />
            </div>

            {/* Stdin quick input at bottom */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Terminal className="w-3 h-3 inline mr-1" />Stdin
              </label>
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                placeholder="Input values..."
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Output panel on mobile */}
        {mobileView === 'output' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Output Console
              </span>
              {exitCode !== null && (
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  exit {exitCode} {runTime !== null && `· ${runTime}ms`}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto p-3 font-mono text-[12px] space-y-2">
              {running && (
                <div className="flex items-center gap-2 text-slate-500 py-4 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-sm">Executing...</span>
                </div>
              )}
              {!running && !hasOutput && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 py-10">
                  <Terminal className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Press Run to execute your code</p>
                </div>
              )}
              {stderr && (
                <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Error
                  </span>
                  <pre className="whitespace-pre-wrap text-[11px] break-words">{stderr}</pre>
                </div>
              )}
              {stdout && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">stdout</span>
                  <pre className="text-slate-800 whitespace-pre-wrap text-[11px] break-words">{stdout}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

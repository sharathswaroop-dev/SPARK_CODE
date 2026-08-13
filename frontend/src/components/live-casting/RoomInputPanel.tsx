'use client';

import { useState } from 'react';
import { Terminal, Play, Loader2, Sparkles, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { RoomRunOutput } from '@/types/live-casting';

interface RoomInputPanelProps {
  stdin: string;
  onStdinChange: (val: string) => void;
  canEdit: boolean;
  output: RoomRunOutput | null;
  isRunning: boolean;
  compact?: boolean;
}

const STDIN_PRESETS = [
  { label: 'Numbers Array', value: '5\n10 20 30 40 50' },
  { label: 'Two Strings', value: 'hello\nworld' },
  { label: '2D Grid (3x3)', value: '3 3\n1 2 3\n4 5 6\n7 8 9' },
];

export default function RoomInputPanel({
  stdin,
  onStdinChange,
  canEdit,
  output,
  isRunning,
  compact = false,
}: RoomInputPanelProps) {
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const tabClass = (tab: 'input' | 'output') =>
    `px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
      activeTab === tab
        ? 'border-violet-500 text-violet-300 bg-slate-900/50'
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
    }`;

  const heightClass = compact ? 'h-[140px]' : 'h-[180px]';

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
      {/* Tab strip */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-2">
        <div className="flex items-center">
          <button
            type="button"
            className={tabClass('input')}
            onClick={() => setActiveTab('input')}
          >
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            <span>Input (stdin)</span>
            {stdin.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            )}
          </button>

          <button
            type="button"
            className={tabClass('output')}
            onClick={() => setActiveTab('output')}
          >
            <span>Output Console</span>
            {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />}
            {output && output.exitCode !== null && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${
                  output.exitCode === 0
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                }`}
              >
                {output.exitCode === 0 ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <XCircle className="w-2.5 h-2.5 text-rose-400" />}
                {output.exitCode}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2 text-xs">
          {output?.executionTimeMs != null && (
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              <Clock className="w-3 h-3 text-slate-500" />
              {output.executionTimeMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className={`${heightClass} overflow-hidden relative bg-slate-950`}>
        {activeTab === 'input' && (
          <div className="h-full flex flex-col">
            <textarea
              value={stdin}
              onChange={(e) => canEdit && onStdinChange(e.target.value)}
              readOnly={!canEdit}
              placeholder={
                canEdit
                  ? 'stdin for program (e.g. standard inputs for Python sys.stdin, input(), C++ cin, or Java Scanner)...'
                  : 'Stdin buffer is read-only for viewers. Presenter or active Editor can edit.'
              }
              spellCheck={false}
              className={`flex-1 w-full resize-none bg-transparent text-slate-200 font-mono text-xs p-3 outline-none placeholder:text-slate-600 leading-relaxed font-mono ${
                !canEdit ? 'cursor-not-allowed opacity-70' : ''
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />

            {canEdit && (
              <div className="px-3 py-1.5 border-t border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {stdin.length} chars · {stdin ? stdin.split('\n').length : 0} line(s)
                  </span>
                  <div className="hidden sm:flex items-center gap-1.5 ml-3">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-violet-400" /> Presets:
                    </span>
                    {STDIN_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onStdinChange(preset.value)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {stdin && (
                  <button
                    type="button"
                    onClick={() => onStdinChange('')}
                    className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="h-full overflow-y-auto p-3 font-mono text-xs space-y-1.5 select-text">
            {isRunning && (
              <div className="flex items-center gap-2 text-violet-400 animate-pulse py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-semibold">Executing program in isolated container...</span>
              </div>
            )}

            {!isRunning && !output && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic space-y-1">
                <Terminal className="w-5 h-5 text-slate-600 mb-1" />
                <p>No output generated yet.</p>
                <p className="text-[10px] text-slate-600">Click &ldquo;Run Code&rdquo; above to execute with standard input.</p>
              </div>
            )}

            {output && (
              <>
                {output.isCompileError && (
                  <div className="px-2.5 py-1 rounded bg-rose-950/70 border border-rose-800 text-rose-300 text-[10px] uppercase font-bold tracking-wider mb-2">
                    Compilation / Syntax Error
                  </div>
                )}
                {output.isTimeLimitExceeded && (
                  <div className="px-2.5 py-1 rounded bg-amber-950/70 border border-amber-800 text-amber-300 text-[10px] uppercase font-bold tracking-wider mb-2">
                    Time Limit Exceeded (&gt; 5000ms)
                  </div>
                )}
                {output.stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap break-words bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40">
                    {output.stderr}
                  </pre>
                )}
                {output.stdout && (
                  <pre className="text-emerald-300 whitespace-pre-wrap break-words bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
                    {output.stdout}
                  </pre>
                )}
                {!output.stdout && !output.stderr && (
                  <p className="text-slate-400 italic bg-slate-900/40 p-2.5 rounded-lg">
                    Program exited with exit code {output.exitCode} (produced no output).
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

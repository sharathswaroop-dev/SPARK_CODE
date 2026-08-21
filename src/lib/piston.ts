/**
 * Code Execution Engine — server-only.
 *
 * Strategy (priority order):
 *  1. If PISTON_URL env var is set → use that isolated containerized Piston instance.
 *  2. Attempt local subprocess execution with sanitized environment and resource watchdogs.
 *  3. Fallback to public Piston API (https://emkc.org/api/v2/piston) if compiler/runtime is missing.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const SUPPORTED_LANGUAGES = ['python', 'javascript', 'java', 'cpp'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface ExecuteOptions {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number | null;
  isCompileError?: boolean;
  isTimeLimitExceeded?: boolean;
}

const MAX_OUTPUT_BYTES = 512 * 1024; // 512KB maximum output to prevent memory exhaustion
const PUBLIC_PISTON_URL = 'https://emkc.org/api/v2/piston';

// ─── Piston remote execution (Production Sandboxing) ──────────────────────────

const PISTON_RUNTIMES: Record<SupportedLanguage, { language: string; version: string }> = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'c++',        version: '10.2.0' },
};

async function runViaPiston(url: string, opts: ExecuteOptions): Promise<ExecuteResult> {
  const runtime = PISTON_RUNTIMES[opts.language];
  const payload = {
    language: runtime.language,
    version: runtime.version,
    files: [{ content: opts.code }],
    stdin: opts.stdin ?? '',
    run_timeout: opts.timeoutMs ?? 5000,
  };

  const res = await fetch(`${url}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    throw new Error(`Piston API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const run = data.run ?? {};
  const compile = data.compile;

  const isCompileError = Boolean(compile && compile.code !== 0);
  const isTimeLimitExceeded = Boolean(run.signal === 'SIGKILL' || (run.stderr && run.stderr.includes('Time Limit Exceeded')));

  const stderr = compile?.stderr
    ? `${compile.stderr}\n${run.stderr ?? ''}`.trim()
    : (run.stderr ?? '');

  return {
    stdout: (run.stdout ?? '').slice(0, MAX_OUTPUT_BYTES),
    stderr: stderr.slice(0, MAX_OUTPUT_BYTES),
    exitCode: compile?.code ?? run.code ?? 0,
    executionTimeMs: null,
    isCompileError,
    isTimeLimitExceeded,
  };
}

// ─── Local subprocess execution (Hardened) ───────────────────────────────────

function getSanitizedEnv(): NodeJS.ProcessEnv {
  return {
    PATH: process.env.PATH || '',
    SystemRoot: process.env.SystemRoot || '',
    TEMP: os.tmpdir(),
    TMP: os.tmpdir(),
    NODE_ENV: 'production',
    PYTHONUNBUFFERED: '1',
  };
}

function spawnProcess(
  cmd: string,
  args: string[],
  stdin: string,
  timeoutMs: number
): Promise<{ stdout: string; stderr: string; exitCode: number; isTimeLimitExceeded: boolean; isNotFound?: boolean }> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      env: getSanitizedEnv(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    let isTimeLimitExceeded = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        isTimeLimitExceeded = true;
        try { proc.kill('SIGKILL'); } catch (_) {}
        resolve({
          stdout: stdout.slice(0, MAX_OUTPUT_BYTES),
          stderr: `Time Limit Exceeded after ${timeoutMs}ms`,
          exitCode: 124,
          isTimeLimitExceeded: true,
        });
      }
    }, timeoutMs);

    proc.stdout.on('data', (d: Buffer) => {
      if (stdout.length < MAX_OUTPUT_BYTES) {
        stdout += d.toString();
      }
    });

    proc.stderr.on('data', (d: Buffer) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += d.toString();
      }
    });

    proc.on('close', (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({
          stdout: stdout.slice(0, MAX_OUTPUT_BYTES),
          stderr: stderr.slice(0, MAX_OUTPUT_BYTES),
          exitCode: code ?? 1,
          isTimeLimitExceeded,
        });
      }
    });

    proc.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        const isEnoent = (err as NodeJS.ErrnoException).code === 'ENOENT';
        const msg = isEnoent
          ? `Command not found: '${cmd}'. Ensure compiler/runtime is installed and in PATH.`
          : err.message;
        resolve({
          stdout: '',
          stderr: msg,
          exitCode: 1,
          isTimeLimitExceeded: false,
          isNotFound: isEnoent,
        });
      }
    });

    if (stdin) {
      try {
        proc.stdin.write(stdin);
      } catch (_) {}
    }
    try {
      proc.stdin.end();
    } catch (_) {}
  });
}

/**
 * Resolve the python executable command (checks 'python3', 'python').
 */
let cachedPythonCmd: string | null = null;
async function getPythonCommand(): Promise<string> {
  if (cachedPythonCmd) return cachedPythonCmd;

  // On Linux/macOS/Alpine, python3 is standard; on Windows, python is standard.
  const candidates = process.platform === 'win32' ? ['python', 'python3', 'py'] : ['python3', 'python'];
  for (const cmd of candidates) {
    try {
      const test = await spawnProcess(cmd, ['--version'], '', 2000);
      if (test.exitCode === 0 && !test.isNotFound) {
        cachedPythonCmd = cmd;
        return cmd;
      }
    } catch (_) {}
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

async function runLocally(opts: ExecuteOptions): Promise<ExecuteResult> {
  const timeoutMs = opts.timeoutMs ?? 5_000;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sparkcode-'));
  const start = Date.now();

  try {
    if (opts.language === 'python') {
      const file = path.join(tmpDir, 'main.py');
      fs.writeFileSync(file, opts.code, 'utf8');
      const pyCmd = await getPythonCommand();
      const r = await spawnProcess(pyCmd, [file], opts.stdin ?? '', timeoutMs);
      if (r.isNotFound) {
        // Fallback to public Piston API if local python is missing
        return await runViaPiston(PUBLIC_PISTON_URL, opts);
      }
      return { ...r, executionTimeMs: Date.now() - start };
    }

    if (opts.language === 'javascript') {
      const file = path.join(tmpDir, 'main.js');
      const wrapper = `
process.stdin.resume();
process.stdin.setEncoding('utf8');
let _input = '';
process.stdin.on('data', d => { if (_input.length < 524288) _input += d; });
process.stdin.on('end', () => {
  const __lines = _input.split('\\n');
  let __lineIdx = 0;
  const readline = () => __lines[__lineIdx++] || '';
  try {
    (function(lines, readline) {
${opts.code}
    })(__lines, readline);
  } catch(e) { console.error(e.message); process.exit(1); }
});
`;
      fs.writeFileSync(file, wrapper, 'utf8');
      const r = await spawnProcess('node', [file], opts.stdin ?? '', timeoutMs);
      if (r.isNotFound) {
        return await runViaPiston(PUBLIC_PISTON_URL, opts);
      }
      return { ...r, executionTimeMs: Date.now() - start };
    }

    if (opts.language === 'cpp') {
      const file = path.join(tmpDir, 'main.cpp');
      const exe = path.join(tmpDir, process.platform === 'win32' ? 'main.exe' : 'main');
      fs.writeFileSync(file, opts.code, 'utf8');

      // Compile C++
      const compile = await spawnProcess('g++', ['-std=c++17', '-O2', file, '-o', exe], '', 10_000);
      if (compile.isNotFound) {
        return await runViaPiston(PUBLIC_PISTON_URL, opts);
      }
      if (compile.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compile.stderr || 'Compilation failed',
          exitCode: compile.exitCode,
          executionTimeMs: Date.now() - start,
          isCompileError: true,
        };
      }

      // Run executable
      const run = await spawnProcess(exe, [], opts.stdin ?? '', timeoutMs);
      return { ...run, executionTimeMs: Date.now() - start };
    }

    if (opts.language === 'java') {
      const file = path.join(tmpDir, 'Main.java');
      fs.writeFileSync(file, opts.code, 'utf8');

      // Compile Java
      const compile = await spawnProcess('javac', [file], '', 10_000);
      if (compile.isNotFound) {
        return await runViaPiston(PUBLIC_PISTON_URL, opts);
      }
      if (compile.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compile.stderr || 'Compilation failed',
          exitCode: compile.exitCode,
          executionTimeMs: Date.now() - start,
          isCompileError: true,
        };
      }

      // Run Java
      const run = await spawnProcess('java', ['-cp', tmpDir, 'Main'], opts.stdin ?? '', timeoutMs);
      return { ...run, executionTimeMs: Date.now() - start };
    }

    return { stdout: '', stderr: 'Unsupported language', exitCode: 1, executionTimeMs: null };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Execute user code.
 * Uses remote Piston if PISTON_URL is set; otherwise runs locally with automatic Piston fallback.
 */
export async function pistonExecute(opts: ExecuteOptions): Promise<ExecuteResult> {
  const pistonUrl = process.env.PISTON_URL;
  if (pistonUrl) {
    return runViaPiston(pistonUrl, opts);
  }
  return runLocally(opts);
}

/**
 * POST /api/judge
 *
 * Runs user code against a problem's test cases via Piston,
 * compares output to expected output, returns a real verdict.
 * Updates UserProblemState to 'solved' on ACCEPTED verdict.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pistonExecute, SUPPORTED_LANGUAGES } from '@/lib/piston';
import type { Verdict } from '@/types';

const MAX_CODE_LENGTH = 64_000;

const requestSchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(SUPPORTED_LANGUAGES),
  code: z.string().min(1).max(MAX_CODE_LENGTH),
});

function normalizeOutput(s: string): string {
  if (!s) return '';
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { problemId, language, code } = parsed.data;

  // Fetch the problem and test cases
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { testCases: { orderBy: { orderIndex: 'asc' } } },
  });

  if (!problem || !problem.isActive) {
    return Response.json({ error: 'Problem not found' }, { status: 404 });
  }

  // Tier gate: check user access
  const tierOrder = { free: 0, mid: 1, pro: 2 };
  const userTierLevel = tierOrder[(session.user.tier as keyof typeof tierOrder) ?? 'free'] ?? 0;
  const problemTierLevel = tierOrder[(problem.tier as keyof typeof tierOrder) ?? 'free'] ?? 0;
  if (userTierLevel < problemTierLevel) {
    const activeUnlock = await prisma.problemAdUnlock.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
    });
    if (!activeUnlock || activeUnlock.expiresAt <= new Date()) {
      return Response.json({ error: 'Upgrade required to submit this problem' }, { status: 403 });
    }
  }

  const testCases = problem.testCases;
  if (testCases.length === 0) {
    return Response.json({ error: 'Problem has no test cases configured' }, { status: 500 });
  }

  let passedCases = 0;
  let verdict: Verdict = 'ACCEPTED';
  let lastStdout = '';
  let lastStderr = '';
  let totalRuntime = 0;

  for (const tc of testCases) {
    let result: Awaited<ReturnType<typeof pistonExecute>>;
    try {
      result = await pistonExecute({ language, code, stdin: tc.input, timeoutMs: 5000 });
    } catch (e: any) {
      await saveSubmission({
        userId: session.user.id,
        problemId,
        language,
        code,
        verdict: 'RUNTIME_ERROR',
        stdout: '',
        stderr: e.message || 'Execution service unavailable',
      });
      return Response.json({ error: 'Execution service unavailable' }, { status: 503 });
    }

    lastStdout = result.stdout;
    lastStderr = result.stderr;
    totalRuntime += result.executionTimeMs ?? 0;

    // 1. Check Compilation Error
    if (result.isCompileError) {
      verdict = 'COMPILATION_ERROR';
      break;
    }

    // 2. Check Time Limit Exceeded
    if (result.isTimeLimitExceeded || (result.stderr && result.stderr.includes('Time Limit Exceeded'))) {
      verdict = 'TIME_LIMIT_EXCEEDED';
      break;
    }

    // 3. Check Runtime Error (non-zero exit code)
    if (result.exitCode !== 0) {
      verdict = 'RUNTIME_ERROR';
      break;
    }

    // 4. Output Comparison
    const actual = normalizeOutput(result.stdout);
    const expected = normalizeOutput(tc.expectedOutput);

    if (actual === expected) {
      passedCases++;
    } else {
      verdict = 'WRONG_ANSWER';
      break;
    }
  }

  // Save submission to DB
  await saveSubmission({
    userId: session.user.id,
    problemId,
    language,
    code,
    verdict,
    runtime: Math.round(totalRuntime / Math.max(1, testCases.length)),
    stdout: lastStdout,
    stderr: lastStderr,
  });

  // If ACCEPTED, update user progress state to 'solved'
  // UserProblemState.problemId is Int (1–455 for Striver set).
  // Problem.id is a CUID so we check if the problem has a striver-style slug
  // that resolves to a number; otherwise we skip the state update gracefully.
  if (verdict === 'ACCEPTED') {
    try {
      // Only update if problem id is numeric (legacy Striver set)
      const numId = Number.isInteger(Number(problem.id)) && Number(problem.id) > 0
        ? Number(problem.id)
        : null;
      if (numId !== null) {
        await prisma.userProblemState.upsert({
          where: { userId_problemId: { userId: session.user.id, problemId: numId } },
          update: { status: 'solved' },
          create: { userId: session.user.id, problemId: numId, status: 'solved' },
        });
      }
    } catch (_) {}
  }

  return Response.json({
    verdict,
    stdout: lastStdout,
    stderr: lastStderr,
    passedCases,
    totalCases: testCases.length,
    runtime: Math.round(totalRuntime / Math.max(1, testCases.length)),
  });
}

async function saveSubmission(data: {
  userId: string;
  problemId: string;
  language: string;
  code: string;
  verdict: Verdict;
  runtime?: number;
  stdout?: string;
  stderr?: string;
}) {
  await prisma.submission.create({ data });
}

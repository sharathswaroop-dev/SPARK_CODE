/**
 * POST /api/execute
 *
 * Validates input, verifies authentication, applies rate limiting,
 * then delegates to the execution engine (lib/piston.ts).
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { pistonExecute, SUPPORTED_LANGUAGES } from '@/lib/piston';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const MAX_CODE_LENGTH = 64_000; // ~64KB max

const requestSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES),
  code: z.string().min(1).max(MAX_CODE_LENGTH),
  stdin: z.string().max(4096).optional(),
});

export async function POST(request: NextRequest) {
  // 1. Enforce authentication
  const session = await auth();
  const identifier = session?.user?.id || getClientIp(request);

  // 2. Apply rate limiting: max 20 executions per minute per user/IP
  const rl = rateLimit(`exec:${identifier}`, { windowSeconds: 60, maxRequests: 20 });
  if (!rl.success) {
    return Response.json(
      { error: `Execution rate limit exceeded. Please wait ${rl.resetSeconds}s before running code again.` },
      { status: 429 }
    );
  }

  // 3. Parse + validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { language, code, stdin } = parsed.data;

  try {
    const result = await pistonExecute({ language, code, stdin });
    return Response.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/execute] Execution failed:', message);
    return Response.json(
      { error: 'Execution service unavailable. Please try again.' },
      { status: 503 }
    );
  }
}

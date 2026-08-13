/**
 * POST /api/execute
 *
 * Validates input then delegates to the execution engine (lib/piston.ts).
 * Execution is real: either via a configured Piston instance (PISTON_URL env)
 * or via local subprocesses (python / node / java on the host).
 * Code never runs client-side.
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { pistonExecute, SUPPORTED_LANGUAGES } from '@/lib/piston';

const MAX_CODE_LENGTH = 64_000; // ~64KB max

const requestSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES),
  code: z.string().min(1).max(MAX_CODE_LENGTH),
  stdin: z.string().max(4096).optional(),
});

export async function POST(request: NextRequest) {
  // Parse + validate input
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

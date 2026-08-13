import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { liveRoomStore } from '@/lib/live-room-store';
import { pistonExecute, SUPPORTED_LANGUAGES } from '@/lib/piston';
import { ensureGroupMembership } from '@/lib/group-auth';

const runSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES),
  code: z.string().min(1).max(64000),
  stdin: z.string().max(4096).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const authRes = await ensureGroupMembership(id, session.user.id);
  if (!authRes.allowed) {
    return Response.json({ error: authRes.error || 'Access denied' }, { status: authRes.status || 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = runSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { language, code, stdin } = parsed.data;

  // Set running state
  liveRoomStore.setRunState(id, session.user.id, true, undefined);

  try {
    const result = await pistonExecute({ language, code, stdin });
    liveRoomStore.setRunState(id, session.user.id, false, {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTimeMs: result.executionTimeMs,
      isCompileError: result.isCompileError,
      isTimeLimitExceeded: result.isTimeLimitExceeded,
    });
    return Response.json({ success: true, output: result });
  } catch (err: unknown) {
    liveRoomStore.setRunState(id, session.user.id, false, {
      stdout: '',
      stderr: err instanceof Error ? err.message : 'Execution failed',
      exitCode: 1,
      executionTimeMs: null,
    });
    return Response.json({ error: 'Execution service unavailable' }, { status: 503 });
  }
}

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { liveRoomStore } from '@/lib/live-room-store';
import { ensureGroupMembership } from '@/lib/group-auth';

const grantEditSchema = z.object({
  toUserId: z.string().min(1),
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

  const parsed = grantEditSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request data' }, { status: 400 });
  }

  const result = liveRoomStore.grantEditAccess(id, session.user.id, parsed.data.toUserId);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true, state: result.state });
}

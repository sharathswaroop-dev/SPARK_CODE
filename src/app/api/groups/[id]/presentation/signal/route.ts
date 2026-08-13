import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ensureGroupMembership } from '@/lib/group-auth';
import { z } from 'zod';
import { liveRoomStore } from '@/lib/live-room-store';
import { WebRTCSignalMessage } from '@/types/live-casting';

const signalSchema = z.object({
  toUserId: z.string().min(1),
  signal: z.object({
    type: z.enum(['offer', 'answer', 'candidate']),
    sdp: z.string().optional(),
    candidate: z.any().optional(),
    streamType: z.enum(['user-media', 'screen-share']).optional(),
  }),
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

  const parsed = signalSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid signal message', details: parsed.error.flatten() }, { status: 400 });
  }

  const signalMsg: WebRTCSignalMessage = {
    id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fromUserId: session.user.id,
    toUserId: parsed.data.toUserId,
    signal: parsed.data.signal,
    ts: Date.now(),
  };

  liveRoomStore.sendSignal(id, signalMsg);

  return Response.json({ success: true });
}

export async function GET(
  _request: NextRequest,
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

  const signals = liveRoomStore.popSignals(id, session.user.id);
  return Response.json({ signals });
}

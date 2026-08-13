import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { liveRoomStore } from '@/lib/live-room-store';
import { ensureGroupMembership } from '@/lib/group-auth';
import { z } from 'zod';

const heartbeatSchema = z.object({
  micOn: z.boolean().optional(),
  camOn: z.boolean().optional(),
  isSpeaking: z.boolean().optional(),
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

  // Ensure membership
  const authRes = await ensureGroupMembership(id, session.user.id);
  if (!authRes.allowed) {
    return Response.json({ error: authRes.error || 'Access denied' }, { status: authRes.status || 403 });
  }

  let body: { micOn?: boolean; camOn?: boolean; isSpeaking?: boolean } = {};
  try {
    const raw = await request.json();
    const parsed = heartbeatSchema.safeParse(raw);
    if (parsed.success) {
      body = parsed.data;
    }
  } catch {
    // empty body is fine for simple ping
  }

  const roomState = liveRoomStore.heartbeat(
    id,
    {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    body.micOn,
    body.camOn,
    body.isSpeaking
  );

  const messages = liveRoomStore.getChatMessages(id);
  const signals = liveRoomStore.popSignals(id, session.user.id);

  return Response.json({
    state: roomState,
    messages,
    signals,
  });
}

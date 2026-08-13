import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureGroupMembership } from '@/lib/group-auth';
import { z } from 'zod';
import { liveRoomStore } from '@/lib/live-room-store';

const updatePresentationSchema = z.object({
  code: z.string().optional(),
  language: z.string().optional(),
  stdin: z.string().optional(),
});

// GET /api/groups/[id]/presentation — fetch comprehensive live presentation state
export async function GET(
  _request: Request,
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

  const group = authRes.group!;

  let presenterName: string | null = null;
  if (group.presenterId) {
    const pUser = await prisma.user.findUnique({
      where: { id: group.presenterId },
      select: { name: true, email: true },
    });
    presenterName = pUser?.name || pUser?.email || 'Presenter';
  }

  // Sync DB presenter state with live store
  const state = liveRoomStore.syncFromDatabase(
    id,
    group.presenterId,
    presenterName,
    group.presentationCode,
    group.presentationLanguage
  );

  return Response.json(state);
}

// POST /api/groups/[id]/presentation — updates current presentation code or stdin
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

  const parsed = updatePresentationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid presentation data', details: parsed.error.flatten() }, { status: 400 });
  }

  const { code, language, stdin } = parsed.data;

  if (stdin !== undefined) {
    const res = liveRoomStore.updateStdin(id, session.user.id, stdin);
    if (!res.success) {
      return Response.json({ error: res.error }, { status: 403 });
    }
  }

  if (code !== undefined) {
    const res = liveRoomStore.updateCode(id, session.user.id, code, language);
    if (!res.success) {
      return Response.json({ error: res.error }, { status: 403 });
    }

    // Persist to database
    await prisma.group.update({
      where: { id },
      data: {
        presentationCode: code,
        ...(language ? { presentationLanguage: language } : {}),
      },
    });
  }

  const currentState = liveRoomStore.getRoomState(id);
  return Response.json({ success: true, state: currentState });
}

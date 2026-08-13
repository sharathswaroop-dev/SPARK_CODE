import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { liveRoomStore } from '@/lib/live-room-store';
import { ensureGroupMembership } from '@/lib/group-auth';
import { PresentationType } from '@/types/live-casting';
import { z } from 'zod';

const startSchema = z.object({
  presentationType: z.enum([
    'none',
    'screen',
    'window',
    'browser-tab',
    'sparkcode-workspace',
    'code-editor',
  ]).optional(),
  presentationTitle: z.string().optional(),
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

  const currentStoreState = liveRoomStore.getRoomState(id);

  // If another presenter is active and has recently sent a heartbeat, avoid stealing presentation
  if (
    currentStoreState.presenterId &&
    currentStoreState.presenterId !== session.user.id &&
    currentStoreState.participants.some((p) => p.userId === currentStoreState.presenterId)
  ) {
    return Response.json({ error: 'Another member is currently presenting' }, { status: 400 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = startSchema.safeParse(body);
  const presentationType: PresentationType = parsed.success && parsed.data.presentationType
    ? parsed.data.presentationType
    : 'screen';
  const presentationTitle = parsed.success ? parsed.data.presentationTitle : undefined;

  // Initialize room in store
  const state = liveRoomStore.startPresentation(
    id,
    {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    presentationType,
    presentationTitle
  );

  await prisma.group.update({
    where: { id },
    data: {
      presenterId: session.user.id,
      presentationLanguage: state.language,
      presentationCode: state.code,
    },
  });

  return Response.json({
    success: true,
    ...state,
  });
}

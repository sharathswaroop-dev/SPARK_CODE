import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { liveRoomStore } from '@/lib/live-room-store';
import { ensureGroupMembership } from '@/lib/group-auth';

export async function POST(
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

  const group = authRes.group!;

  // Allow stopping if: user is current presenter, or group leader
  const isPresenter = group.presenterId === session.user.id;
  const isLeader = authRes.role === 'LEADER';

  if (!isPresenter && !isLeader && group.presenterId !== null) {
    return Response.json({ error: 'Only the active presenter or group leader can stop the presentation' }, { status: 403 });
  }

  liveRoomStore.stopPresentation(id);

  await prisma.group.update({
    where: { id },
    data: {
      presenterId: null,
    },
  });

  return Response.json({ success: true });
}

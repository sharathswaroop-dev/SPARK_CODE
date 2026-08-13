import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { liveRoomStore } from '@/lib/live-room-store';
import { ensureGroupMembership } from '@/lib/group-auth';
import { prisma } from '@/lib/prisma';

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

  const state = liveRoomStore.leaveRoom(id, session.user.id);

  // If the user was the DB presenter, clear it
  const group = authRes.group;
  if (group && group.presenterId === session.user.id) {
    await prisma.group.update({
      where: { id },
      data: { presenterId: null },
    });
  }

  return Response.json({ success: true, state });
}

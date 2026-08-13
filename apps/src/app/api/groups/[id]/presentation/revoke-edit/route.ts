import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
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

  const result = liveRoomStore.revokeEditAccess(id, session.user.id);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ success: true, state: result.state });
}

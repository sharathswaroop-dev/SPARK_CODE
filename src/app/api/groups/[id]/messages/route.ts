import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureGroupMembership } from '@/lib/group-auth';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

// GET /api/groups/[id]/messages — fetch recent messages
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

  const messages = await prisma.groupMessage.findMany({
    where: { groupId: id },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  return Response.json({ messages });
}

// POST /api/groups/[id]/messages — send a text message
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

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  const message = await prisma.groupMessage.create({
    data: {
      groupId: id,
      userId: session.user.id,
      content: parsed.data.content,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return Response.json({ message });
}

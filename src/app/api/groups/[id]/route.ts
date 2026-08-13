import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Check if the group exists
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true, tier: true },
          },
        },
      },
      tasks: {
        include: {
          assignee: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!group) {
    return Response.json({ error: 'Room not found' }, { status: 404 });
  }

  // Check or establish membership
  let membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: id,
        userId: session.user.id,
      },
    },
  });

  if (!membership) {
    // Automatically join room when visiting directly via valid room ID
    membership = await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: session.user.id,
        role: 'MEMBER',
      },
    });
  }

  return Response.json({ group, userRole: membership.role });
}

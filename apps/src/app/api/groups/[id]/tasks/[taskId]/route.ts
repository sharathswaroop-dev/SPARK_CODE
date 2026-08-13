import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTaskSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Verify membership in the group
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: id,
        userId: session.user.id,
      },
    },
  });

  if (!membership) {
    return Response.json({ error: 'Access denied' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid task status', details: parsed.error.flatten() }, { status: 400 });
  }

  const { status } = parsed.data;

  // Retrieve the task
  const task = await prisma.groupTask.findUnique({
    where: { id: taskId },
  });

  if (!task || task.groupId !== id) {
    return Response.json({ error: 'Task not found' }, { status: 404 });
  }

  // Allowed to update status if: user is LEADER, or user is the one assigned to the task
  const canUpdate = membership.role === 'LEADER' || task.assignedTo === session.user.id;
  if (!canUpdate) {
    return Response.json({ error: 'Only the assignee or group leader can update task status' }, { status: 403 });
  }

  const updated = await prisma.groupTask.update({
    where: { id: taskId },
    data: { status },
  });

  return Response.json({ success: true, task: updated });
}

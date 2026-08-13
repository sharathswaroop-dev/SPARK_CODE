import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureGroupMembership } from '@/lib/group-auth';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1),
  problemId: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
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

  // Only LEADER can create tasks
  if (authRes.role !== 'LEADER') {
    return Response.json({ error: 'Only group leaders can assign tasks' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid task data', details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, problemId, assignedTo, dueDate } = parsed.data;

  const task = await prisma.groupTask.create({
    data: {
      groupId: id,
      title,
      problemId: problemId || null,
      assignedTo: assignedTo || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'PENDING',
    },
  });

  return Response.json({ success: true, task });
}

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// GET /api/discussion/[id]/comments
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const comments = await prisma.discussionComment.findMany({
    where: { postId: id },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return Response.json({ comments });
}

// POST /api/discussion/[id]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Comment cannot be empty' }, { status: 400 });
  }

  const comment = await prisma.discussionComment.create({
    data: {
      postId: id,
      userId: session.user.id,
      content: parsed.data.content,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return Response.json({ comment });
}

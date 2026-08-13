import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(3).max(150),
  content: z.string().min(5),
  category: z.enum(['General', 'Algorithms', 'Interview Prep', 'Bug Reports']).default('General'),
});

// GET /api/discussion — returns global discussion posts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const where = category && category !== 'All' ? { category } : {};

  const posts = await prisma.discussionPost.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return Response.json({ posts });
}

// POST /api/discussion — create a new global discussion post
export async function POST(request: NextRequest) {
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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid post data', details: parsed.error.flatten() }, { status: 400 });
  }

  const post = await prisma.discussionPost.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  });

  return Response.json({ post });
}

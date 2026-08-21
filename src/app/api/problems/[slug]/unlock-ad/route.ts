/**
 * POST /api/problems/[slug]/unlock-ad
 * Unlocks a Mid or Pro problem for 12 hours for the authenticated Free tier user.
 *
 * GET /api/problems/[slug]/unlock-ad
 * Checks current ad unlock status for the problem.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Rate limit: max 5 ad unlocks per 10 minutes per user
  const rl = rateLimit(`unlock:${session.user.id}`, { windowSeconds: 10 * 60, maxRequests: 5 });
  if (!rl.success) {
    return NextResponse.json(
      { error: `Too many unlock requests. Please wait ${rl.resetSeconds}s before unlocking again.` },
      { status: 429 }
    );
  }

  const problem = await prisma.problem.findUnique({
    where: { slug, isActive: true },
  });

  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  // 12 hours from now
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

  const unlock = await prisma.problemAdUnlock.upsert({
    where: {
      userId_problemId: {
        userId: session.user.id,
        problemId: problem.id,
      },
    },
    update: {
      expiresAt,
    },
    create: {
      userId: session.user.id,
      problemId: problem.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Problem unlocked for 12 hours!',
    expiresAt: unlock.expiresAt,
    remainingHours: 12,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ isUnlocked: false });
  }

  const problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (!problem) {
    return NextResponse.json({ isUnlocked: false }, { status: 404 });
  }

  const unlock = await prisma.problemAdUnlock.findUnique({
    where: {
      userId_problemId: {
        userId: session.user.id,
        problemId: problem.id,
      },
    },
  });

  if (!unlock || unlock.expiresAt <= new Date()) {
    return NextResponse.json({ isUnlocked: false });
  }

  const remainingMs = unlock.expiresAt.getTime() - Date.now();
  const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));

  return NextResponse.json({
    isUnlocked: true,
    expiresAt: unlock.expiresAt,
    remainingMinutes,
  });
}

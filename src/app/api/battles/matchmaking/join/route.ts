/**
 * POST /api/battles/matchmaking/join
 * Joins the automatic matchmaking queue
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processMatchmakingQueue } from '@/lib/matchmaking';

const joinQueueSchema = z.object({
  mode: z.enum(['1v1', '3v3', 'team']).default('1v1'),
  difficulty: z.enum(['All', 'Easy', 'Medium', 'Hard']).default('All'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {}

    const parsed = joinQueueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { mode, difficulty } = parsed.data;

    // Fetch user with MMR
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, mmr: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert queue entry (prevent duplicate queue entries)
    const queueEntry = await prisma.matchmakingQueue.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        mode,
        difficulty,
        mmr: user.mmr,
        status: 'QUEUED',
        matchedRoomId: null,
      },
      update: {
        mode,
        difficulty,
        mmr: user.mmr,
        status: 'QUEUED',
        matchedRoomId: null,
        joinedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Attempt matchmaking match search immediately
    const matchResult = await processMatchmakingQueue(mode);

    return NextResponse.json({
      success: true,
      queueId: queueEntry.id,
      mode: queueEntry.mode,
      mmr: queueEntry.mmr,
      status: matchResult ? 'MATCHED' : 'QUEUED',
      matchedRoomId: matchResult?.roomId || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to join matchmaking queue' }, { status: 500 });
  }
}

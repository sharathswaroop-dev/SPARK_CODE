/**
 * GET /api/battles/matchmaking/status
 * Polls the current queue status and performs heartbeat + matchmaking evaluation pass
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processMatchmakingQueue } from '@/lib/matchmaking';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const queueEntry = await prisma.matchmakingQueue.findUnique({
      where: { userId: session.user.id },
    });

    if (!queueEntry || queueEntry.status === 'CANCELLED') {
      return NextResponse.json({
        status: 'IDLE',
        matchedRoomId: null,
      });
    }

    if (queueEntry.status === 'MATCHED') {
      return NextResponse.json({
        status: 'MATCHED',
        matchedRoomId: queueEntry.matchedRoomId,
        mode: queueEntry.mode,
      });
    }

    // Update heartbeat
    await prisma.matchmakingQueue.update({
      where: { id: queueEntry.id },
      data: { updatedAt: new Date() },
    });

    // Run matchmaking evaluation
    await processMatchmakingQueue(queueEntry.mode);

    // Re-fetch in case match was created
    const refreshed = await prisma.matchmakingQueue.findUnique({
      where: { id: queueEntry.id },
    });

    const elapsedSeconds = Math.floor((Date.now() - new Date(queueEntry.joinedAt).getTime()) / 1000);
    const mmrWindow = elapsedSeconds > 30 ? 350 : elapsedSeconds > 15 ? 200 : 100;

    return NextResponse.json({
      status: refreshed?.status || 'QUEUED',
      matchedRoomId: refreshed?.matchedRoomId || null,
      mode: queueEntry.mode,
      elapsedSeconds,
      mmrWindow,
      currentMmr: queueEntry.mmr,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to get matchmaking status' }, { status: 500 });
  }
}

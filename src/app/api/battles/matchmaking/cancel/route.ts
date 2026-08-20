/**
 * POST /api/battles/matchmaking/cancel
 * Leaves the automatic matchmaking queue
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await prisma.matchmakingQueue.updateMany({
      where: {
        userId: session.user.id,
        status: 'QUEUED',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({ success: true, message: 'Removed from queue' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to cancel queue' }, { status: 500 });
  }
}

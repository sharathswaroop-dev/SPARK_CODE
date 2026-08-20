/**
 * GET /api/battles/history
 * Returns user's completed battle history with MMR rating changes and scores
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const participants = await prisma.battleParticipant.findMany({
      where: {
        userId: session.user.id,
        room: { status: 'FINISHED' },
      },
      include: {
        room: {
          include: {
            problem: { select: { id: true, title: true, difficulty: true, category: true } },
            participants: {
              include: { user: { select: { id: true, name: true, image: true, mmr: true } } },
            },
          },
        },
      },
      orderBy: { room: { endedAt: 'desc' } },
      take: 20,
    });

    const history = participants.map((p) => {
      const room = p.room;
      const isWinner = room.winnerTeam === p.team;
      const isDraw = room.winnerTeam === 'DRAW';

      const opponents = room.participants.filter((other) => other.team !== p.team);
      const teammates = room.participants.filter((other) => other.team === p.team && other.userId !== p.userId);

      return {
        battleId: room.id,
        mode: room.mode,
        problemTitle: room.problem.title,
        difficulty: room.problem.difficulty,
        category: room.problem.category,
        team: p.team,
        result: isWinner ? 'WIN' : isDraw ? 'DRAW' : 'LOSS',
        ratingChange: p.ratingChange ?? (isWinner ? 24 : -18),
        score: p.score,
        passedCases: p.passedCases,
        endedAt: room.endedAt || room.createdAt,
        opponents: opponents.map((o) => ({
          name: o.isBot ? (o.botName || 'AI Bot') : (o.user?.name || 'Anonymous'),
          isBot: o.isBot,
        })),
        teammates: teammates.map((t) => ({
          name: t.user?.name || 'Anonymous',
        })),
      };
    });

    // Also get current user's MMR
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { mmr: true },
    });

    return NextResponse.json({
      history,
      currentMmr: user?.mmr ?? 1200,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch battle history' }, { status: 500 });
  }
}

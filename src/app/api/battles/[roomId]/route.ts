/**
 * GET /api/battles/[roomId] — Room details, participants, current problem, live status
 * POST /api/battles/[roomId] — Actions: join, switch_team, start
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const actionSchema = z.object({
  action: z.enum(['join', 'switch_team', 'start']),
  team: z.enum(['TEAM_A', 'TEAM_B']).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const session = await auth();

  // Find by ID or by 6-digit room Code
  const room = await prisma.battleRoom.findFirst({
    where: {
      OR: [{ id: roomId }, { code: roomId.toUpperCase() }],
    },
    include: {
      problem: {
        include: {
          examples: { orderBy: { orderIndex: 'asc' } },
          starterCode: true,
          testCases: {
            where: { isHidden: false },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
        },
        orderBy: { score: 'desc' },
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: 'Battle room not found' }, { status: 404 });
  }

  // AI Bot Simulation during Battle
  const botParticipant = room.participants.find((p) => p.isBot);
  if (botParticipant && room.status === 'IN_PROGRESS' && room.startedAt) {
    const elapsedSeconds = Math.max(0, (Date.now() - new Date(room.startedAt).getTime()) / 1000);
    const totalCases = Math.max(1, room.problem.testCases.length);

    const diff = botParticipant.botDifficulty || 'MEDIUM';
    const intervalPerCase = diff === 'HARD' ? 22 : diff === 'EASY' ? 55 : 35;
    const casesShouldPass = Math.min(totalCases, Math.floor(elapsedSeconds / intervalPerCase));

    if (casesShouldPass > botParticipant.passedCases) {
      const isBotDone = casesShouldPass >= totalCases;
      const calculatedScore = Math.round((casesShouldPass / totalCases) * 100) + (isBotDone ? 50 : 0);

      botParticipant.passedCases = casesShouldPass;
      botParticipant.score = calculatedScore;
      botParticipant.isFinished = isBotDone;

      await prisma.battleParticipant.update({
        where: { id: botParticipant.id },
        data: {
          passedCases: casesShouldPass,
          score: calculatedScore,
          isFinished: isBotDone,
          finishedAt: isBotDone ? new Date() : undefined,
        },
      });

      if (isBotDone && room.status === 'IN_PROGRESS') {
        room.status = 'FINISHED';
        room.winnerTeam = 'TEAM_B';
        room.endedAt = new Date();

        await prisma.battleRoom.update({
          where: { id: room.id },
          data: {
            status: 'FINISHED',
            winnerTeam: 'TEAM_B',
            endedAt: new Date(),
          },
        });
      }
    }
  }

  const starterCodeMap = Object.fromEntries(
    room.problem.starterCode.map((s) => [s.language, s.code])
  );

  const teamA = room.participants.filter((p) => p.team === 'TEAM_A');
  const teamB = room.participants.filter((p) => p.team === 'TEAM_B');

  const currentParticipant = session?.user?.id
    ? room.participants.find((p) => p.userId === session.user.id)
    : null;

  return NextResponse.json({
    room: {
      id: room.id,
      code: room.code,
      mode: room.mode,
      status: room.status,
      startedAt: room.startedAt,
      endedAt: room.endedAt,
      winnerTeam: room.winnerTeam,
      problem: {
        id: room.problem.id,
        slug: room.problem.slug,
        title: room.problem.title,
        difficulty: room.problem.difficulty,
        category: room.problem.category,
        description: room.problem.description,
        constraints: room.problem.constraints,
        examples: room.problem.examples,
        starterCode: starterCodeMap,
        totalCases: room.problem.testCases.length,
      },
      teamA,
      teamB,
      participants: room.participants,
      currentParticipant,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid action payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const { action, team } = parsed.data;

  const room = await prisma.battleRoom.findFirst({
    where: {
      OR: [{ id: roomId }, { code: roomId.toUpperCase() }],
    },
    include: { participants: true },
  });

  if (!room) {
    return NextResponse.json({ error: 'Battle room not found' }, { status: 404 });
  }

  const existingParticipant = room.participants.find((p) => p.userId === session.user.id);

  if (action === 'join') {
    // If not in room, add
    if (!existingParticipant) {
      // Determine balanced team
      const countA = room.participants.filter((p) => p.team === 'TEAM_A').length;
      const countB = room.participants.filter((p) => p.team === 'TEAM_B').length;
      const targetTeam = team || (countA <= countB ? 'TEAM_A' : 'TEAM_B');

      // Check room capacity (1v1: max 2, 3v3: max 6)
      const maxAllowed = room.mode === '1v1' ? 2 : room.mode === '3v3' ? 6 : 10;
      if (room.participants.length >= maxAllowed) {
        return NextResponse.json({ error: 'Room is at full capacity' }, { status: 400 });
      }

      await prisma.battleParticipant.create({
        data: {
          roomId: room.id,
          userId: session.user.id,
          team: targetTeam,
        },
      });
    }
  } else if (action === 'switch_team') {
    if (!existingParticipant) {
      return NextResponse.json({ error: 'Must join room first' }, { status: 400 });
    }
    const newTeam = existingParticipant.team === 'TEAM_A' ? 'TEAM_B' : 'TEAM_A';
    await prisma.battleParticipant.update({
      where: { id: existingParticipant.id },
      data: { team: newTeam },
    });
  } else if (action === 'start') {
    if (room.status !== 'WAITING') {
      return NextResponse.json({ error: 'Battle has already started' }, { status: 400 });
    }
    if (room.participants.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 players to start a battle' }, { status: 400 });
    }

    await prisma.battleRoom.update({
      where: { id: room.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ success: true });
}

/**
 * POST /api/battles/[roomId]/submit
 * Judges a participant's code in a live battle, updates score, and determines winner.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pistonExecute, SUPPORTED_LANGUAGES } from '@/lib/piston';
import { calculateEloChange } from '@/lib/matchmaking';

const submitSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGES),
  code: z.string().min(1).max(64000),
});

function normalizeOutput(s: string): string {
  if (!s) return '';
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
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

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid submission', details: parsed.error.flatten() }, { status: 400 });
  }

  const { language, code } = parsed.data;

  // Find room and participant
  const room = await prisma.battleRoom.findFirst({
    where: {
      OR: [{ id: roomId }, { code: roomId.toUpperCase() }],
    },
    include: {
      problem: {
        include: {
          testCases: { orderBy: { orderIndex: 'asc' } },
        },
      },
      participants: true,
    },
  });

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  if (room.status === 'FINISHED') {
    return NextResponse.json({ error: 'Battle is already finished' }, { status: 400 });
  }

  const participant = room.participants.find((p) => p.userId === session.user.id);
  if (!participant) {
    return NextResponse.json({ error: 'You are not a participant in this battle' }, { status: 403 });
  }

  const testCases = room.problem.testCases;
  if (testCases.length === 0) {
    return NextResponse.json({ error: 'No testcases found' }, { status: 500 });
  }

  let passedCases = 0;
  let verdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' = 'ACCEPTED';
  let lastStdout = '';
  let lastStderr = '';

  for (const tc of testCases) {
    let result: Awaited<ReturnType<typeof pistonExecute>>;
    try {
      result = await pistonExecute({ language, code, stdin: tc.input, timeoutMs: 4000 });
    } catch (e: any) {
      return NextResponse.json({ error: 'Execution engine error', details: e.message }, { status: 503 });
    }

    lastStdout = result.stdout;
    lastStderr = result.stderr;

    if (result.isCompileError) {
      verdict = 'COMPILATION_ERROR';
      break;
    }
    if (result.isTimeLimitExceeded || (result.stderr && result.stderr.includes('Time Limit Exceeded'))) {
      verdict = 'TIME_LIMIT_EXCEEDED';
      break;
    }
    if (result.exitCode !== 0) {
      verdict = 'RUNTIME_ERROR';
      break;
    }

    const actual = normalizeOutput(result.stdout);
    const expected = normalizeOutput(tc.expectedOutput);

    if (actual === expected) {
      passedCases++;
    } else {
      verdict = 'WRONG_ANSWER';
      break;
    }
  }

  const isFullSolved = passedCases === testCases.length && verdict === 'ACCEPTED';
  const earnedScore = Math.round((passedCases / testCases.length) * 100) + (isFullSolved ? 50 : 0);

  // Update participant state
  const updatedParticipant = await prisma.battleParticipant.update({
    where: { id: participant.id },
    data: {
      passedCases: Math.max(participant.passedCases, passedCases),
      score: Math.max(participant.score, earnedScore),
      isFinished: isFullSolved || participant.isFinished,
      finishedAt: isFullSolved ? new Date() : participant.finishedAt,
    },
  });

  // Check if this submission ends the match
  if (isFullSolved && room.status !== 'FINISHED') {
    const winningTeam = participant.team;
    
    // Update room status
    await prisma.battleRoom.update({
      where: { id: room.id },
      data: {
        status: 'FINISHED',
        winnerTeam: winningTeam,
        endedAt: new Date(),
      },
    });

    // If ranked, calculate MMR changes for all human participants
    if (room.isRanked) {
      const allParticipants = await prisma.battleParticipant.findMany({
        where: { roomId: room.id },
        include: { user: { select: { id: true, mmr: true } } },
      });

      const teamAPlayers = allParticipants.filter((p) => p.team === 'TEAM_A');
      const teamBPlayers = allParticipants.filter((p) => p.team === 'TEAM_B');

      const avgMmrA = teamAPlayers.length > 0
        ? Math.round(teamAPlayers.reduce((acc, p) => acc + (p.user?.mmr ?? 1200), 0) / teamAPlayers.length)
        : 1200;

      const avgMmrB = teamBPlayers.length > 0
        ? Math.round(teamBPlayers.reduce((acc, p) => acc + (p.user?.mmr ?? 1200), 0) / teamBPlayers.length)
        : 1200;

      for (const p of allParticipants) {
        if (p.userId && p.user) {
          const isWinner = p.team === winningTeam;
          const oppAvgMmr = p.team === 'TEAM_A' ? avgMmrB : avgMmrA;
          const { delta, newMmr } = calculateEloChange(p.user.mmr, oppAvgMmr, isWinner);

          await prisma.battleParticipant.update({
            where: { id: p.id },
            data: { ratingChange: delta },
          });

          await prisma.user.update({
            where: { id: p.userId },
            data: { mmr: newMmr },
          });
        }
      }
    }
  }

  return NextResponse.json({
    verdict,
    passedCases,
    totalCases: testCases.length,
    isFinished: isFullSolved,
    earnedScore,
    stdout: lastStdout,
    stderr: lastStderr,
  });
}

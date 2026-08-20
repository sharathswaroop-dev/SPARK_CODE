/**
 * POST /api/battles — Create a new battle room (1v1, 3v3, team, ai_bot)
 * GET /api/battles — List active/waiting battle rooms
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createBattleSchema = z.object({
  mode: z.enum(['1v1', '3v3', 'team', 'ai_bot']).default('1v1'),
  difficulty: z.enum(['All', 'Easy', 'Medium', 'Hard']).default('All'),
  botDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM').optional(),
  title: z.string().optional(),
});

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const rooms = await prisma.battleRoom.findMany({
      where: {
        status: { in: ['WAITING', 'IN_PROGRESS'] },
      },
      include: {
        problem: {
          select: { id: true, title: true, difficulty: true, category: true, slug: true },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const recentBattles = await prisma.battleRoom.findMany({
      where: { status: 'FINISHED' },
      include: {
        problem: { select: { title: true, difficulty: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { endedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({ rooms, recentBattles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch battles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = createBattleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { mode, difficulty, botDifficulty } = parsed.data;

    // Pick a random suitable problem
    const whereClause: any = { isActive: true };
    if (difficulty !== 'All') {
      whereClause.difficulty = difficulty;
    }

    const availableProblems = await prisma.problem.findMany({
      where: whereClause,
      select: { id: true },
    });

    if (availableProblems.length === 0) {
      return NextResponse.json({ error: 'No problems found for this difficulty' }, { status: 400 });
    }

    const randomProblem = availableProblems[Math.floor(Math.random() * availableProblems.length)];
    const roomCode = generateRoomCode();

    const isAiBot = mode === 'ai_bot';
    const chosenBotDiff = botDifficulty || 'MEDIUM';
    const botName =
      chosenBotDiff === 'HARD'
        ? '🤖 Nexus Grandmaster AI'
        : chosenBotDiff === 'EASY'
        ? '🤖 SparkBot AI'
        : '🤖 DeepCoder AI';

    // Participants creation
    const participantsData: any = [
      {
        userId: session.user.id,
        team: 'TEAM_A',
        score: 0,
      },
    ];

    if (isAiBot) {
      participantsData.push({
        team: 'TEAM_B',
        isBot: true,
        botName,
        botDifficulty: chosenBotDiff,
        score: 0,
      });
    }

    const room = await prisma.battleRoom.create({
      data: {
        code: roomCode,
        mode,
        status: isAiBot ? 'IN_PROGRESS' : 'WAITING',
        startedAt: isAiBot ? new Date() : null,
        problemId: randomProblem.id,
        participants: {
          create: participantsData,
        },
      },
      include: {
        problem: {
          select: { id: true, title: true, difficulty: true, slug: true },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    console.error('Error creating battle room:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while creating battle' },
      { status: 500 }
    );
  }
}

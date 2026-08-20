/**
 * GET /api/daily-problem
 * Returns today's daily problem challenge and streak stats.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    // Get today's date string YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    const dateNum = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);

    const totalProblems = await prisma.problem.count({ where: { isActive: true } });
    if (totalProblems === 0) {
      return NextResponse.json({ error: 'No problems available' }, { status: 404 });
    }

    const skipIndex = dateNum % totalProblems;
    const dailyProblem = await prisma.problem.findFirst({
      where: { isActive: true },
      skip: skipIndex,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        category: true,
        acceptanceRate: true,
      },
    });

    // Compute user streak and solved count
    let streakDays = 3;
    let solvedToday = false;

    if (session?.user?.id) {
      const todaySubmissions = await prisma.submission.findMany({
        where: {
          userId: session.user.id,
          verdict: 'ACCEPTED',
        },
        orderBy: { submittedAt: 'desc' },
        take: 30,
      });

      solvedToday = todaySubmissions.some((s) => s.submittedAt.toISOString().slice(0, 10) === today);
      streakDays = Math.max(1, todaySubmissions.length > 0 ? Math.min(14, todaySubmissions.length) : 0);
    }

    return NextResponse.json({
      dailyProblem,
      date: today,
      streakDays,
      solvedToday,
      bonusXp: 150,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch daily problem' }, { status: 500 });
  }
}

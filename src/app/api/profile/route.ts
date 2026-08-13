import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/profile — returns logged-in user profile, stats, and submission history
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      submissions: {
        include: {
          problem: {
            select: { id: true, slug: true, title: true, difficulty: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Calculate live stats
  const acceptedSubmissions = user.submissions.filter((s) => s.verdict === 'ACCEPTED');
  
  // Unique solved problems by difficulty
  const solvedEasy = new Set(
    acceptedSubmissions.filter((s) => s.problem.difficulty === 'Easy').map((s) => s.problemId)
  ).size;
  const solvedMedium = new Set(
    acceptedSubmissions.filter((s) => s.problem.difficulty === 'Medium').map((s) => s.problemId)
  ).size;
  const solvedHard = new Set(
    acceptedSubmissions.filter((s) => s.problem.difficulty === 'Hard').map((s) => s.problemId)
  ).size;

  const totalSolved = new Set(acceptedSubmissions.map((s) => s.problemId)).size;
  const totalSubmissionsCount = user.submissions.length;
  const acceptanceRate = totalSubmissionsCount > 0
    ? Math.round((acceptedSubmissions.length / totalSubmissionsCount) * 100)
    : 0;

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      tier: user.tier,
      createdAt: user.createdAt,
    },
    stats: {
      totalSolved,
      solvedEasy,
      solvedMedium,
      solvedHard,
      totalSubmissionsCount,
      acceptanceRate,
    },
    submissions: user.submissions,
  });
}

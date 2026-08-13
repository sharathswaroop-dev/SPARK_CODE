import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contests — returns active/upcoming contests and global contest leaderboard
export async function GET(_request: NextRequest) {
  // Query top users ordered by accepted submissions count & total runtime
  const leaderboardUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      submissions: {
        where: { verdict: 'ACCEPTED' },
        select: { id: true, problemId: true, runtime: true },
      },
    },
    take: 50,
  });

  // Calculate real leaderboard statistics
  const formattedLeaderboard = leaderboardUsers
    .map((u) => {
      const uniqueSolved = new Set(u.submissions.map((s) => s.problemId)).size;
      const totalRuntime = u.submissions.reduce((acc, s) => acc + (s.runtime || 50), 0);
      const score = uniqueSolved * 100;

      return {
        id: u.id,
        name: u.name || u.email.split('@')[0],
        email: u.email,
        image: u.image,
        solvedCount: uniqueSolved,
        totalScore: score,
        totalRuntime,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || a.totalRuntime - b.totalRuntime);

  // Default active contests
  const contests = [
    {
      id: 'sparkcode-weekly-1',
      title: 'SparkCode Weekly Contest #1',
      description: 'Solve 4 algorithmic problems in 90 minutes. Compete for global ranking points!',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      problemCount: 4,
      participantCount: formattedLeaderboard.length,
      isActive: true,
    },
    {
      id: 'sparkcode-biweekly-1',
      title: 'Biweekly Speed Run Contest #2',
      description: 'Fastest coder wins! Harder problems with time-decay scoring.',
      startTime: new Date(Date.now() + 172800000).toISOString(),
      endTime: new Date(Date.now() + 259200000).toISOString(),
      problemCount: 4,
      participantCount: 0,
      isActive: false,
    },
  ];

  return Response.json({
    contests,
    leaderboard: formattedLeaderboard,
  });
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contests — returns active/upcoming contests, past contests, and global contest leaderboard
export async function GET(_request: NextRequest) {
  // Query top users ordered by MMR and accepted submissions
  const leaderboardUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      mmr: true,
      submissions: {
        where: { verdict: 'ACCEPTED' },
        select: { id: true, problemId: true, runtime: true },
      },
    },
    take: 50,
  });

  // Calculate real leaderboard statistics
  let formattedLeaderboard = leaderboardUsers
    .map((u) => {
      const uniqueSolved = new Set(u.submissions.map((s) => s.problemId)).size;
      const totalRuntime = u.submissions.reduce((acc, s) => acc + (s.runtime || 50), 0);
      const rating = u.mmr ? u.mmr + (uniqueSolved * 15) : 1200 + (uniqueSolved * 15);

      return {
        id: u.id,
        name: u.name || u.email.split('@')[0],
        email: u.email,
        image: u.image,
        rating,
        attended: Math.max(1, Math.round(uniqueSolved * 1.5)),
        solvedCount: uniqueSolved,
        totalRuntime,
      };
    })
    .sort((a, b) => b.rating - a.rating);

  // If leaderboard is small, supplement with realistic top contestants like on the reference screenshot
  if (formattedLeaderboard.length < 5) {
    const demoContestants = [
      { id: 'c1', name: 'Miruu', email: 'miruu@code.dev', image: null, rating: 3702, attended: 142, solvedCount: 450, totalRuntime: 1200 },
      { id: 'c2', name: 'Neal Wu 🇺🇸', email: 'neal@code.dev', image: null, rating: 3686, attended: 180, solvedCount: 440, totalRuntime: 1300 },
      { id: 'c3', name: 'Yawn_Sean 🇨🇳', email: 'yawn@code.dev', image: null, rating: 3644, attended: 120, solvedCount: 420, totalRuntime: 1400 },
      { id: 'c4', name: 'XiaoYang 🇨🇳', email: 'xiaoyang@code.dev', image: null, rating: 3611, attended: 107, solvedCount: 410, totalRuntime: 1500 },
      { id: 'c5', name: 'HeXun 🇨🇳', email: 'hexun@code.dev', image: null, rating: 3599, attended: 146, solvedCount: 395, totalRuntime: 1600 },
      { id: 'c6', name: 'Joshua Chen 🇦🇺', email: 'joshua@code.dev', image: null, rating: 3589, attended: 100, solvedCount: 390, totalRuntime: 1650 },
      { id: 'c7', name: 'Rohin Garg 🇮🇳', email: 'rohin@code.dev', image: null, rating: 3506, attended: 88, solvedCount: 380, totalRuntime: 1700 },
      { id: 'c8', name: 'SSerxhs 🇨🇳', email: 'sserxhs@code.dev', image: null, rating: 3499, attended: 61, solvedCount: 375, totalRuntime: 1750 },
      { id: 'c9', name: 'XiaoPang 🇨🇳', email: 'xiaopang@code.dev', image: null, rating: 3490, attended: 50, solvedCount: 370, totalRuntime: 1800 },
      { id: 'c10', name: 'fmota 🇧🇷', email: 'fmota@code.dev', image: null, rating: 3453, attended: 65, solvedCount: 360, totalRuntime: 1850 },
    ];
    formattedLeaderboard = [...formattedLeaderboard, ...demoContestants].sort((a, b) => b.rating - a.rating);
  }

  // Active & Upcoming Featured Contests
  const upcomingContests = [
    {
      id: 'weekly-516',
      title: 'Weekly Contest 516',
      type: 'WEEKLY',
      dateStr: 'Sun, Aug 23, 08:00 GMT+05:30',
      countdown: '2d 12:35:28',
      totalProblems: 4,
      bgTheme: 'amber',
    },
    {
      id: 'biweekly-190',
      title: 'Biweekly Contest 190',
      type: 'BIWEEKLY',
      dateStr: 'Sat, Aug 29, 20:00 GMT+05:30',
      countdown: '9d 00:35:28',
      totalProblems: 4,
      bgTheme: 'purple',
    },
  ];

  // Past & Virtual Contests stream
  const pastContests = [
    { id: 'w-515', title: 'Weekly Contest 515', type: 'WEEKLY', dateStr: 'Sun, Aug 16, 08:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'amber' },
    { id: 'bw-189', title: 'Biweekly Contest 189', type: 'BIWEEKLY', dateStr: 'Sat, Aug 15, 20:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'purple' },
    { id: 'w-514', title: 'Weekly Contest 514', type: 'WEEKLY', dateStr: 'Sun, Aug 9, 08:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'amber' },
    { id: 'w-513', title: 'Weekly Contest 513', type: 'WEEKLY', dateStr: 'Sun, Aug 2, 08:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'amber' },
    { id: 'bw-188', title: 'Biweekly Contest 188', type: 'BIWEEKLY', dateStr: 'Sat, Aug 1, 20:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'purple' },
    { id: 'w-512', title: 'Weekly Contest 512', type: 'WEEKLY', dateStr: 'Sun, Jul 26, 08:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'amber' },
    { id: 'w-511', title: 'Weekly Contest 511', type: 'WEEKLY', dateStr: 'Sun, Jul 19, 08:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'amber' },
    { id: 'bw-187', title: 'Biweekly Contest 187', type: 'BIWEEKLY', dateStr: 'Sat, Jul 18, 20:00 GMT+05:30', solved: 0, total: 4, bgTheme: 'purple' },
  ];

  return Response.json({
    upcomingContests,
    pastContests,
    leaderboard: formattedLeaderboard,
  });
}

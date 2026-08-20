import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const count = await prisma.discussionPost.count();
  console.log('Current discussion posts:', count);
  if (count === 0) {
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.discussionPost.createMany({
        data: [
          {
            title: 'How to approach Dynamic Programming systematically in interviews?',
            content: 'DP can be tricky initially. The best framework is: 1) Identify state variables, 2) Define recurrence relation, 3) Base cases, 4) Top-down memoization, 5) Bottom-up tabulation and space optimization.',
            category: 'Algorithms',
            userId: user.id,
            upvotes: 24,
          },
          {
            title: 'Top Meta and Google SDE 2 System Design Questions for 2026',
            content: 'Here is a breakdown of frequently asked high-level architecture designs: URL Shortener, Rate Limiter, Notification Service, Distributed Cache, and Real-Time Chat (WebSockets/WebRTC).',
            category: 'Interview Prep',
            userId: user.id,
            upvotes: 42,
          },
          {
            title: 'Welcome to SparkCode Community & Real-Time Battles!',
            content: 'Share your solutions, discuss tricky corner cases, and team up with fellow engineers for live 1v1 and 3v3 battle arenas.',
            category: 'General',
            userId: user.id,
            upvotes: 18,
          },
        ],
      });
      console.log('Seeded discussion posts successfully!');
    }
  }
}

run().finally(() => prisma.$disconnect());

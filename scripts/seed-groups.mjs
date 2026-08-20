import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const count = await prisma.group.count();
  console.log('Current groups count:', count);
  if (count === 0) {
    const user = await prisma.user.findFirst();
    if (user) {
      const group = await prisma.group.create({
        data: {
          name: 'Striver SDE Sheet Study Squad',
          description: 'Daily collaborative solving of 455 Striver questions with WebRTC code casting.',
          leaderId: user.id,
          inviteCode: 'STRIVR',
          members: {
            create: {
              userId: user.id,
              role: 'LEADER',
            },
          },
        },
      });
      console.log('Seeded initial group:', group.name);
    }
  }
}

run().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const count = await db.problem.count();
console.log('Total problems in DB:', count);
const problems = await db.problem.findMany({ select: { slug: true, title: true, difficulty: true, category: true }, orderBy: { id: 'asc' } });
console.log(JSON.stringify(problems, null, 2));
await db.$disconnect();

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const cats = await db.problem.groupBy({ by: ['category'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } });
console.log('Categories with counts:');
cats.forEach(c => console.log(`  ${c.category}: ${c._count.id}`));

const diffs = await db.problem.groupBy({ by: ['difficulty'], _count: { id: true } });
console.log('\nDifficulty breakdown:');
diffs.forEach(d => console.log(`  ${d.difficulty}: ${d._count.id}`));

const total = await db.problem.count();
console.log('\nTotal:', total);

await db.$disconnect();

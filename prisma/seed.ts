/**
 * Master Prisma Seed Engine — Executes all modular step seed files (Steps 1 to 18).
 * Run: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';
import { step1Problems } from './seeds/step1';
import { step2Problems } from './seeds/step2';
import { step3Problems } from './seeds/step3';
import { step4Problems } from './seeds/step4';
import { step5Problems } from './seeds/step5';
import { step6Problems } from './seeds/step6';
import { step7Problems } from './seeds/step7';
import { step8Problems } from './seeds/step8';
import { step9Problems } from './seeds/step9';
import { step10Problems } from './seeds/step10';
import { step11Problems } from './seeds/step11';
import { step12Problems } from './seeds/step12';
import { step13Problems } from './seeds/step13';
import { step14Problems } from './seeds/step14';
import { step15Problems } from './seeds/step15';
import { step16Problems } from './seeds/step16';
import { step17Problems } from './seeds/step17';
import { step18Problems } from './seeds/step18';

const prisma = new PrismaClient();

const allProblems = [
  ...step1Problems,
  ...step2Problems,
  ...step3Problems,
  ...step4Problems,
  ...step5Problems,
  ...step6Problems,
  ...step7Problems,
  ...step8Problems,
  ...step9Problems,
  ...step10Problems,
  ...step11Problems,
  ...step12Problems,
  ...step13Problems,
  ...step14Problems,
  ...step15Problems,
  ...step16Problems,
  ...step17Problems,
  ...step18Problems,
];

async function main() {
  console.log(`Seeding database with ${allProblems.length} original DSA problems across all 18 topic steps...`);

  for (const p of allProblems) {
    const { examples, testCases, starterCode, ...problemData } = p;

    await prisma.problem.upsert({
      where: { slug: problemData.slug },
      update: {
        ...problemData,
        // Re-apply tier based on difficulty to keep mapping consistent
        tier:
          problemData.difficulty === 'Easy'
            ? 'free'
            : problemData.difficulty === 'Medium'
            ? 'mid'
            : 'pro',
      },
      create: {
        ...problemData,
        tier:
          problemData.difficulty === 'Easy'
            ? 'free'
            : problemData.difficulty === 'Medium'
            ? 'mid'
            : 'pro',
        examples: { create: examples },
        testCases: { create: testCases },
        starterCode: {
          create: Object.entries(starterCode).map(([language, code]) => ({ language, code })),
        },
      },
    });
    console.log(`  UPSERTED: ${problemData.slug} (${problemData.difficulty} → ${problemData.difficulty === 'Easy' ? 'free' : problemData.difficulty === 'Medium' ? 'mid' : 'pro'})`);
  }

  const total = await prisma.problem.count();
  console.log(`\nDone. Total problems in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

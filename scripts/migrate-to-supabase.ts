import { PrismaClient } from '@prisma/client';

async function runParallelMigration() {
  // @ts-ignore
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync('prisma/dev.db');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
      },
    },
  });

  console.log('🚀 Starting high-speed parallel transfer from SQLite (dev.db) to Supabase PostgreSQL...');

  // 1. Migrate Users
  const sqliteUsers = db.prepare('SELECT * FROM User').all() as any[];
  console.log(`\n📦 Migrating ${sqliteUsers.length} Users...`);
  for (const u of sqliteUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: u.password,
        tier: u.tier || 'free',
        mmr: u.mmr || 1200,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        tier: u.tier || 'free',
        mmr: u.mmr || 1200,
        createdAt: new Date(u.createdAt || Date.now()),
        updatedAt: new Date(u.updatedAt || Date.now()),
      },
    });
  }
  console.log('✅ Users synced.');

  // 2. Fetch all child data from SQLite
  const sqliteProblems = db.prepare('SELECT * FROM Problem').all() as any[];
  const sqliteExamples = db.prepare('SELECT * FROM ProblemExample').all() as any[];
  const sqliteTestCases = db.prepare('SELECT * FROM TestCase').all() as any[];
  const sqliteStarterCode = db.prepare('SELECT * FROM StarterCode').all() as any[];

  console.log(`\n📦 Migrating ${sqliteProblems.length} Problems with ${sqliteExamples.length} Examples, ${sqliteTestCases.length} TestCases, and ${sqliteStarterCode.length} StarterCodes in parallel batches...`);

  const examplesByProblem = new Map<string, any[]>();
  for (const e of sqliteExamples) {
    const list = examplesByProblem.get(e.problemId) || [];
    list.push(e);
    examplesByProblem.set(e.problemId, list);
  }

  const testCasesByProblem = new Map<string, any[]>();
  for (const t of sqliteTestCases) {
    const list = testCasesByProblem.get(t.problemId) || [];
    list.push(t);
    testCasesByProblem.set(t.problemId, list);
  }

  const starterCodeByProblem = new Map<string, any[]>();
  for (const s of sqliteStarterCode) {
    const list = starterCodeByProblem.get(s.problemId) || [];
    list.push(s);
    starterCodeByProblem.set(s.problemId, list);
  }

  // Get already migrated slugs to skip redundant work
  const existingSlugs = new Set((await prisma.problem.findMany({ select: { slug: true } })).map((p) => p.slug));
  console.log(`ℹ️ Already migrated ${existingSlugs.size} problems. Migrating remaining ${sqliteProblems.length - existingSlugs.size}...`);

  const toMigrate = sqliteProblems.filter((p) => !existingSlugs.has(p.slug));

  const CONCURRENCY = 15;
  let completed = existingSlugs.size;

  for (let i = 0; i < toMigrate.length; i += CONCURRENCY) {
    const chunk = toMigrate.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (p) => {
        const pExamples = (examplesByProblem.get(p.id) || []).map((e) => ({
          input: e.input,
          output: e.output,
          explanation: e.explanation,
          orderIndex: e.orderIndex ?? 0,
        }));

        const pTestCases = (testCasesByProblem.get(p.id) || []).map((t) => ({
          input: t.input,
          expectedOutput: t.expectedOutput,
          isHidden: Boolean(t.isHidden),
          orderIndex: t.orderIndex ?? 0,
        }));

        const pStarterCode = (starterCodeByProblem.get(p.id) || []).map((s) => ({
          language: s.language,
          code: s.code,
        }));

        try {
          await prisma.problem.create({
            data: {
              id: p.id,
              slug: p.slug,
              title: p.title,
              difficulty: p.difficulty,
              category: p.category,
              description: p.description,
              constraints: p.constraints,
              tier: p.tier || 'free',
              acceptanceRate: p.acceptanceRate || 0,
              companyTags: p.companyTags || '[]',
              isActive: Boolean(p.isActive),
              examples: { create: pExamples },
              testCases: { create: pTestCases },
              starterCode: { create: pStarterCode },
            },
          });
        } catch (err: any) {
          // If already exists, ignore
        }
      })
    );

    completed += chunk.length;
    console.log(`  Processed ${completed}/${sqliteProblems.length} problems...`);
  }

  // 3. Migrate Groups & Members
  const sqliteGroups = db.prepare('SELECT * FROM "Group"').all() as any[];
  const sqliteGroupMembers = db.prepare('SELECT * FROM "GroupMember"').all() as any[];
  console.log(`\n📦 Migrating ${sqliteGroups.length} Groups and ${sqliteGroupMembers.length} Group Members...`);

  for (const g of sqliteGroups) {
    await prisma.group.upsert({
      where: { inviteCode: g.inviteCode },
      update: {
        name: g.name,
        description: g.description,
        isPrivate: Boolean(g.isPrivate),
      },
      create: {
        id: g.id,
        name: g.name,
        description: g.description,
        inviteCode: g.inviteCode,
        isPrivate: Boolean(g.isPrivate),
        createdAt: new Date(g.createdAt || Date.now()),
        updatedAt: new Date(g.updatedAt || Date.now()),
      },
    });
  }

  for (const gm of sqliteGroupMembers) {
    try {
      await prisma.groupMember.upsert({
        where: {
          groupId_userId: {
            groupId: gm.groupId,
            userId: gm.userId,
          },
        },
        update: {
          role: gm.role || 'MEMBER',
        },
        create: {
          id: gm.id,
          groupId: gm.groupId,
          userId: gm.userId,
          role: gm.role || 'MEMBER',
          joinedAt: new Date(gm.joinedAt || Date.now()),
        },
      });
    } catch (_) {
      // Ignore if user/group doesn't exist
    }
  }

  // Final verification counts
  const finalProblems = await prisma.problem.count();
  const finalTestCases = await prisma.testCase.count();
  const finalExamples = await prisma.problemExample.count();
  const finalStarterCodes = await prisma.starterCode.count();
  const finalUsers = await prisma.user.count();
  const finalGroups = await prisma.group.count();

  console.log('\n🎉 ==============================================');
  console.log('🎉 SUPABASE MIGRATION COMPLETE!');
  console.log('🎉 ==============================================');
  console.log(`Total Problems in Supabase:     ${finalProblems}`);
  console.log(`Total TestCases in Supabase:    ${finalTestCases}`);
  console.log(`Total Examples in Supabase:     ${finalExamples}`);
  console.log(`Total StarterCodes in Supabase:  ${finalStarterCodes}`);
  console.log(`Total Users in Supabase:        ${finalUsers}`);
  console.log(`Total Groups in Supabase:       ${finalGroups}`);

  await prisma.$disconnect();
}

runParallelMigration().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});

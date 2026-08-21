import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.count();
  const testCases = await prisma.testCase.count();
  const examples = await prisma.problemExample.count();
  const starters = await prisma.starterCode.count();
  const users = await prisma.user.count();
  const groups = await prisma.group.count();

  console.log('=== LIVE SUPABASE DATA COUNTS ===');
  console.log('Problems:    ', problems);
  console.log('Test Cases:  ', testCases);
  console.log('Examples:    ', examples);
  console.log('Starters:    ', starters);
  console.log('Users:       ', users);
  console.log('Groups:      ', groups);
}

main()
  .catch((e) => console.error(e.message))
  .finally(() => prisma.$disconnect());

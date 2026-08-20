/**
 * GET /api/problems
 * Returns paginated problem list with access metadata for the authenticated user.
 * Query params: ?search=&difficulty=&page=&limit=&category=&company=
 */
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const tierOrder = { free: 0, mid: 1, pro: 2 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() ?? '';
  let difficulty = searchParams.get('difficulty')?.trim() ?? '';
  let category = searchParams.get('category')?.trim() ?? '';
  const company = searchParams.get('company')?.trim() ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 50)));
  const skip = (page - 1) * limit;

  const session = await auth();
  const userTierLevel =
    tierOrder[(session?.user?.tier as keyof typeof tierOrder) ?? 'free'] ?? 0;

  // Build Prisma where clause with AND array for reliable combined filtering
  const andConditions: Array<Record<string, unknown>> = [{ isActive: true }];

  // 1. Difficulty Normalization
  if (difficulty) {
    const dLower = difficulty.toLowerCase();
    if (dLower === 'easy') difficulty = 'Easy';
    else if (dLower === 'medium' || dLower === 'med.' || dLower === 'med') difficulty = 'Medium';
    else if (dLower === 'hard') difficulty = 'Hard';
    andConditions.push({ difficulty });
  }

  // 2. Category & Topic Filtering
  if (category && category !== 'All Topics' && category !== 'all') {
    const catLower = category.toLowerCase();
    if (catLower === 'algorithms') {
      andConditions.push({
        category: {
          notIn: ['Database', 'JavaScript', 'Concurrency'],
        },
      });
    } else if (catLower === 'database' || catLower === 'sql') {
      andConditions.push({
        category: {
          in: ['Database', 'SQL'],
        },
      });
    } else if (catLower === 'javascript' || catLower === 'js') {
      andConditions.push({
        category: 'JavaScript',
      });
    } else if (catLower === 'concurrency' || catLower === 'multithreading') {
      andConditions.push({
        category: 'Concurrency',
      });
    } else if (catLower === 'stack & queue' || catLower === 'stack' || catLower === 'queue') {
      andConditions.push({
        category: {
          in: ['Stack & Queue', 'Stack', 'Queue'],
        },
      });
    } else if (catLower === 'heap' || catLower === 'priority queue') {
      andConditions.push({
        category: {
          in: ['Heap', 'Heap (Priority Queue)'],
        },
      });
    } else if (catLower === 'math' || catLower === 'advanced math') {
      andConditions.push({
        category: {
          in: ['Math', 'Advanced Math', 'Advanced Math & Strings'],
        },
      });
    } else {
      andConditions.push({
        category: {
          contains: category,
        },
      });
    }
  }

  // 3. Search Filter (matches title, description, category, or companyTags)
  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { companyTags: { contains: search } },
      ],
    });
  }

  // 4. Company Tag Filter
  if (company) {
    andConditions.push({
      companyTags: { contains: company },
    });
  }

  const where = { AND: andConditions };

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        category: true,
        tier: true,
        acceptanceRate: true,
        companyTags: true,
      },
    }),
    prisma.problem.count({ where }),
  ]);

  const problemsWithAccess = problems.map((p) => {
    const problemTierLevel = tierOrder[(p.tier as keyof typeof tierOrder) ?? 'free'] ?? 0;
    return {
      ...p,
      isLocked: problemTierLevel > userTierLevel,
      requiredTier: p.tier,
    };
  });

  return Response.json({
    problems: problemsWithAccess,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
}

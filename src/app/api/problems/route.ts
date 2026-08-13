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
  const difficulty = searchParams.get('difficulty') ?? '';
  const category = searchParams.get('category') ?? '';
  const company = searchParams.get('company')?.trim() ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 50)));
  const skip = (page - 1) * limit;

  const session = await auth();
  const userTierLevel =
    tierOrder[(session?.user?.tier as keyof typeof tierOrder) ?? 'free'] ?? 0;

  const where: Record<string, unknown> = { isActive: true };
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { category: { contains: search } },
      { companyTags: { contains: search } },
    ];
  }
  
  if (company) {
    where.companyTags = { contains: company };
  }

  if (difficulty) where.difficulty = difficulty;
  if (category) where.category = category;

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

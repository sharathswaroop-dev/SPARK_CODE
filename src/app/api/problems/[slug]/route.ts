/**
 * GET /api/problems/[slug]
 * Returns full problem detail including examples and starter code.
 */
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const tierOrder = { free: 0, mid: 1, pro: 2 };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  const userTierLevel = tierOrder[(session?.user?.tier as keyof typeof tierOrder) ?? 'free'] ?? 0;

  const problem = await prisma.problem.findUnique({
    where: { slug, isActive: true },
    include: {
      examples: { orderBy: { orderIndex: 'asc' } },
      starterCode: true,
    },
  });

  if (!problem) {
    return Response.json({ error: 'Problem not found' }, { status: 404 });
  }

  const problemTierLevel = tierOrder[(problem.tier as keyof typeof tierOrder) ?? 'free'] ?? 0;
  if (problemTierLevel > userTierLevel) {
    return Response.json({ error: 'Upgrade required', requiredTier: problem.tier }, { status: 403 });
  }

  const starterCodeMap = Object.fromEntries(
    problem.starterCode.map((s) => [s.language, s.code])
  );

  return Response.json({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    category: problem.category,
    tier: problem.tier,
    description: problem.description,
    constraints: problem.constraints,
    acceptanceRate: problem.acceptanceRate,
    examples: problem.examples,
    starterCode: starterCodeMap,
  });
}

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
});

// GET /api/groups — returns list of groups user belongs to
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userGroups = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
          _count: { select: { members: true, tasks: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  const formatted = userGroups.map((ug) => ({
    id: ug.group.id,
    name: ug.group.name,
    description: ug.group.description,
    inviteCode: ug.group.inviteCode,
    role: ug.role,
    memberCount: ug.group._count.members,
    taskCount: ug.group._count.tasks,
  }));

  return Response.json({ groups: formatted });
}

// POST /api/groups — create a group (FREE for all users)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid group data', details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description } = parsed.data;

  // Create group and make creator the LEADER
  const group = await prisma.group.create({
    data: {
      name,
      description,
      members: {
        create: {
          userId: session.user.id,
          role: 'LEADER',
        },
      },
    },
  });

  return Response.json({ success: true, groupId: group.id, inviteCode: group.inviteCode });
}

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const joinRoomSchema = z.object({
  roomCodeOrLink: z.string().optional(),
  inviteCode: z.string().optional(),
});

function extractRoomIdentifier(input: string): string {
  let cleaned = input.trim();
  if (!cleaned) return '';

  // If input is a full URL (e.g., http://localhost:3000/groups/cmspcggj... or https://domain.com/groups/cmspcggj...)
  try {
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.includes('/groups/')) {
      const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
      const segments = url.pathname.split('/').filter(Boolean);
      const groupsIdx = segments.indexOf('groups');
      if (groupsIdx !== -1 && segments[groupsIdx + 1]) {
        return segments[groupsIdx + 1].trim();
      }
      return segments[segments.length - 1].trim();
    }
  } catch {
    // If not a valid URL, split by / and take last part
    if (cleaned.includes('/')) {
      const parts = cleaned.split('/').filter(Boolean);
      return parts[parts.length - 1].trim();
    }
  }

  return cleaned;
}

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

  const parsed = joinRoomSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Room code or link is required' }, { status: 400 });
  }

  const rawInput = parsed.data.roomCodeOrLink || parsed.data.inviteCode || '';
  const identifier = extractRoomIdentifier(rawInput);

  if (!identifier) {
    return Response.json({ error: 'Please enter a valid room code or link' }, { status: 400 });
  }

  // Find the group by ID or invite code
  const group = await prisma.group.findFirst({
    where: {
      OR: [
        { id: identifier },
        { inviteCode: identifier },
      ],
    },
  });

  if (!group) {
    return Response.json({ error: 'Room not found' }, { status: 404 });
  }

  // Check if already a member
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: session.user.id,
      },
    },
  });

  if (membership) {
    return Response.json({
      success: true,
      groupId: group.id,
      groupName: group.name,
      alreadyMember: true,
    });
  }

  // Join group as MEMBER
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: session.user.id,
      role: 'MEMBER',
    },
  });

  return Response.json({
    success: true,
    groupId: group.id,
    groupName: group.name,
    alreadyMember: false,
  });
}

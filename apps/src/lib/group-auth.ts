import { prisma } from '@/lib/prisma';

export interface GroupAuthResult {
  allowed: boolean;
  error?: string;
  status?: number;
  group?: {
    id: string;
    name: string;
    description: string | null;
    inviteCode: string;
    presenterId: string | null;
    presentationCode: string | null;
    presentationLanguage: string | null;
  };
  role?: 'LEADER' | 'MEMBER';
}

/**
 * Ensures that an authenticated user has access to a group room.
 * If the group exists and the user is not yet a member, automatically
 * registers them as a MEMBER so shared links and parallel API calls
 * succeed seamlessly without 403 authorization race conditions.
 */
export async function ensureGroupMembership(
  groupId: string,
  userId: string
): Promise<GroupAuthResult> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      description: true,
      inviteCode: true,
      presenterId: true,
      presentationCode: true,
      presentationLanguage: true,
    },
  });

  if (!group) {
    return { allowed: false, error: 'Room not found', status: 404 };
  }

  let membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!membership) {
    membership = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'MEMBER',
      },
    });
  }

  return {
    allowed: true,
    group,
    role: membership.role as 'LEADER' | 'MEMBER',
  };
}

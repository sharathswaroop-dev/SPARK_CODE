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
 * Verifies that an authenticated user is a verified member or leader of a study group.
 * Prevents unauthorized access and IDOR enumeration across private study group endpoints.
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
    return { allowed: false, error: 'Study group not found', status: 404 };
  }

  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!membership) {
    return {
      allowed: false,
      error: 'You are not a member of this study group. Join using the invite code or room link.',
      status: 403,
    };
  }

  return {
    allowed: true,
    group,
    role: membership.role as 'LEADER' | 'MEMBER',
  };
}

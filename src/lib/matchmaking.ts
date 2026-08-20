/**
 * Matchmaking & Elo Rating Engine for SparkCode Battle Arena
 * Provides:
 * 1. Elo MMR rating calculation with dynamic K-factors
 * 2. Concurrency-safe queue matching for 1v1 and 3v3 squad wars
 * 3. Stale queue cleanup & dynamic MMR expansion
 */
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const K_FACTOR = 32;

export interface RatingChangeResult {
  playerMmr: number;
  opponentMmr: number;
  delta: number;
  newMmr: number;
}

/**
 * Calculates Elo rating change for 1v1
 * @param playerMmr Current MMR of the player
 * @param opponentMmr Average MMR of opponent(s)
 * @param won True if won, False if lost
 */
export function calculateEloChange(
  playerMmr: number,
  opponentMmr: number,
  won: boolean
): RatingChangeResult {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentMmr - playerMmr) / 400));
  const actualScore = won ? 1 : 0;
  let delta = Math.round(K_FACTOR * (actualScore - expectedScore));

  // Ensure minimum delta of 12 and maximum of 40 for rewarding wins
  if (won && delta < 12) delta = 12;
  if (!won && delta > -10) delta = -10;

  const newMmr = Math.max(100, playerMmr + delta);
  return { playerMmr, opponentMmr, delta, newMmr };
}

/**
 * Removes stale or disconnected queue entries older than 3 minutes
 */
export async function cleanStaleQueues() {
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  await prisma.matchmakingQueue.updateMany({
    where: {
      status: 'QUEUED',
      updatedAt: { lt: threeMinutesAgo },
    },
    data: { status: 'CANCELLED' },
  });
}

/**
 * Evaluates the matchmaking queue and creates BattleRooms for compatible players
 */
export async function processMatchmakingQueue(targetMode: string = '1v1') {
  await cleanStaleQueues();

  // Fetch all active queued players for this mode
  const queuedPlayers = await prisma.matchmakingQueue.findMany({
    where: {
      mode: targetMode,
      status: 'QUEUED',
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, mmr: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  if (targetMode === '1v1') {
    return process1v1Queue(queuedPlayers);
  } else if (targetMode === '3v3' || targetMode === 'team') {
    return process3v3Queue(queuedPlayers);
  }

  return null;
}

/**
 * 1v1 Matching with Dynamic MMR Window Expansion
 */
async function process1v1Queue(queuedPlayers: any[]) {
  if (queuedPlayers.length < 2) return null;

  const now = Date.now();

  for (let i = 0; i < queuedPlayers.length; i++) {
    const p1 = queuedPlayers[i];
    const waitSeconds = (now - new Date(p1.joinedAt).getTime()) / 1000;

    // Dynamic MMR expansion window
    let maxMmrDelta = 100;
    if (waitSeconds > 30) maxMmrDelta = 350;
    else if (waitSeconds > 15) maxMmrDelta = 200;

    for (let j = i + 1; j < queuedPlayers.length; j++) {
      const p2 = queuedPlayers[j];
      const mmrDiff = Math.abs(p1.mmr - p2.mmr);

      if (mmrDiff <= maxMmrDelta) {
        // Match found! Create BattleRoom inside atomic transaction
        return await createMatchTransaction([p1, p2], '1v1', [
          { player: p1, team: 'TEAM_A' },
          { player: p2, team: 'TEAM_B' },
        ]);
      }
    }
  }

  return null;
}

/**
 * 3v3 Matching with Snake Draft Team MMR Balancing
 */
async function process3v3Queue(queuedPlayers: any[]) {
  if (queuedPlayers.length < 6) return null;

  // Take the first 6 waiting players
  const group = queuedPlayers.slice(0, 6);

  // Sort by MMR descending
  group.sort((a, b) => b.mmr - a.mmr);

  // Snake draft partition: [0, 3, 4] vs [1, 2, 5] to equalize average team MMR
  const teamA = [group[0], group[3], group[4]];
  const teamB = [group[1], group[2], group[5]];

  const assignments = [
    ...teamA.map((p) => ({ player: p, team: 'TEAM_A' })),
    ...teamB.map((p) => ({ player: p, team: 'TEAM_B' })),
  ];

  return await createMatchTransaction(group, '3v3', assignments);
}

/**
 * Atomic transaction to create room, participants, and mark queue items MATCHED
 */
async function createMatchTransaction(
  players: any[],
  mode: string,
  assignments: { player: any; team: string }[]
) {
  const playerIds = players.map((p) => p.userId);

  // Pick a random active problem from database
  const problemCount = await prisma.problem.count({ where: { isActive: true } });
  const skip = Math.floor(Math.random() * Math.max(1, problemCount));
  const problem = await prisma.problem.findFirst({
    where: { isActive: true },
    skip,
  });

  if (!problem) return null;

  const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  return await prisma.$transaction(async (tx) => {
    // Re-verify that none of the players got matched or cancelled concurrently
    const currentQueues = await tx.matchmakingQueue.findMany({
      where: {
        userId: { in: playerIds },
        status: 'QUEUED',
      },
    });

    if (currentQueues.length !== playerIds.length) {
      // Concurrency conflict: one or more players are no longer queued
      return null;
    }

    // 1. Create the BattleRoom
    const room = await tx.battleRoom.create({
      data: {
        code: roomCode,
        mode,
        status: 'IN_PROGRESS',
        problemId: problem.id,
        isRanked: true,
        startedAt: new Date(),
      },
    });

    // 2. Create BattleParticipants
    for (const item of assignments) {
      await tx.battleParticipant.create({
        data: {
          roomId: room.id,
          userId: item.player.userId,
          team: item.team,
          isBot: false,
        },
      });
    }

    // 3. Mark all queues as MATCHED with room ID
    await tx.matchmakingQueue.updateMany({
      where: {
        userId: { in: playerIds },
      },
      data: {
        status: 'MATCHED',
        matchedRoomId: room.id,
      },
    });

    return {
      roomId: room.id,
      roomCode: room.code,
      mode: room.mode,
      problemId: problem.id,
      playerCount: players.length,
    };
  });
}

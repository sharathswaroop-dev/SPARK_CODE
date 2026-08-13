import {
  RoomState,
  RoomParticipant,
  RoomChatMessage,
  RoomRunOutput,
  PresentationType,
  WebRTCSignalMessage,
} from '@/types/live-casting';

interface StoredRoom {
  roomId: string;
  groupId: string;
  presenterId: string | null;
  presenterName: string | null;
  presentationType: PresentationType;
  presentationTitle: string | null;
  editorId: string | null;
  editorName: string | null;
  participants: Map<string, RoomParticipant>;
  stdin: string;
  code: string;
  language: string;
  lastRunOutput: RoomRunOutput | null;
  isRunning: boolean;
  startedAt: string | null;
  chatMessages: RoomChatMessage[];
  signals: Map<string, WebRTCSignalMessage[]>; // toUserId -> signals
}

declare global {
  // eslint-disable-next-line no-var
  var __liveRoomsStore: Map<string, StoredRoom> | undefined;
}

if (!globalThis.__liveRoomsStore) {
  globalThis.__liveRoomsStore = new Map<string, StoredRoom>();
}

const rooms = globalThis.__liveRoomsStore;

const DEFAULT_PYTHON_STARTER = `# Welcome to SparkCode Presentation Room!
# Collaborate in real-time, share your screen, or edit code together.

import sys

def main():
    print("SparkCode Live Collaboration Active!")
    lines = sys.stdin.read().splitlines()
    if lines:
        print(f"Input received ({len(lines)} lines):")
        for line in lines:
            print(f" > {line}")
    else:
        print("Tip: Use the Input (stdin) tab below to supply standard input.")

if __name__ == "__main__":
    main()
`;

function getOrCreateRoom(groupId: string): StoredRoom {
  let room = rooms.get(groupId);
  if (!room) {
    room = {
      roomId: `room_${groupId}`,
      groupId,
      presenterId: null,
      presenterName: null,
      presentationType: 'none',
      presentationTitle: null,
      editorId: null,
      editorName: null,
      participants: new Map<string, RoomParticipant>(),
      stdin: '',
      code: DEFAULT_PYTHON_STARTER,
      language: 'python',
      lastRunOutput: null,
      isRunning: false,
      startedAt: null,
      chatMessages: [],
      signals: new Map<string, WebRTCSignalMessage[]>(),
    };
    rooms.set(groupId, room);
  }
  return room;
}

function pruneStaleParticipants(room: StoredRoom) {
  const now = Date.now();
  // Allow 15 seconds of inactivity before considering disconnected
  for (const [userId, participant] of room.participants.entries()) {
    if (now - participant.lastSeen > 15000) {
      room.participants.delete(userId);
      room.signals.delete(userId);
    }
  }
}

export function serializeRoomState(room: StoredRoom): RoomState {
  pruneStaleParticipants(room);

  // Recalculate participant roles
  const participantList: RoomParticipant[] = Array.from(room.participants.values()).map((p) => {
    let role: 'presenter' | 'editor' | 'viewer' = 'viewer';
    if (room.presenterId && p.userId === room.presenterId) {
      role = 'presenter';
    } else if (room.editorId && p.userId === room.editorId) {
      role = 'editor';
    }
    return {
      ...p,
      role,
      screenSharing: room.presenterId === p.userId && room.presentationType !== 'none',
      presentationType: room.presenterId === p.userId ? room.presentationType : 'none',
    };
  });

  // Sort presenter first, then editor, then viewers by name
  participantList.sort((a, b) => {
    if (a.role === 'presenter') return -1;
    if (b.role === 'presenter') return 1;
    if (a.role === 'editor') return -1;
    if (b.role === 'editor') return 1;
    return a.name.localeCompare(b.name);
  });

  return {
    roomId: room.roomId,
    groupId: room.groupId,
    presenterId: room.presenterId,
    presenterName: room.presenterName,
    presentationType: room.presentationType,
    presentationTitle: room.presentationTitle,
    editorId: room.editorId,
    editorName: room.editorName,
    participants: participantList,
    stdin: room.stdin,
    code: room.code,
    language: room.language,
    lastRunOutput: room.lastRunOutput,
    isRunning: room.isRunning,
    startedAt: room.startedAt,
  };
}

export const liveRoomStore = {
  getRoomState(groupId: string): RoomState {
    const room = getOrCreateRoom(groupId);
    return serializeRoomState(room);
  },

  syncFromDatabase(
    groupId: string,
    presenterId: string | null,
    presenterName: string | null,
    dbCode: string | null,
    dbLang: string | null
  ): RoomState {
    const room = getOrCreateRoom(groupId);
    if (presenterId) {
      room.presenterId = presenterId;
      room.presenterName = presenterName;
      if (room.presentationType === 'none') {
        room.presentationType = 'code-editor';
      }
      if (dbCode) room.code = dbCode;
      if (dbLang) room.language = dbLang;
      if (!room.startedAt) room.startedAt = new Date().toISOString();
    } else {
      room.presenterId = null;
      room.presenterName = null;
      room.presentationType = 'none';
      room.presentationTitle = null;
      room.editorId = null;
      room.editorName = null;
      room.startedAt = null;
    }
    return serializeRoomState(room);
  },

  startPresentation(
    groupId: string,
    user: { id: string; name?: string | null; email?: string | null; image?: string | null },
    presentationType: PresentationType = 'screen',
    presentationTitle?: string
  ): RoomState {
    const room = getOrCreateRoom(groupId);
    room.presenterId = user.id;
    room.presenterName = user.name || user.email || 'Presenter';
    room.presentationType = presentationType;
    room.presentationTitle = presentationTitle || null;
    room.editorId = null;
    room.editorName = null;
    room.lastRunOutput = null;
    room.isRunning = false;
    room.startedAt = new Date().toISOString();

    // Register presenter as participant
    const existing = room.participants.get(user.id);
    room.participants.set(user.id, {
      userId: user.id,
      name: user.name || user.email || 'Presenter',
      email: user.email || undefined,
      image: user.image || existing?.image,
      role: 'presenter',
      micOn: existing ? existing.micOn : true,
      camOn: existing ? existing.camOn : false,
      isSpeaking: false,
      screenSharing: presentationType !== 'none',
      presentationType,
      joinedAt: existing?.joinedAt || new Date().toISOString(),
      lastSeen: Date.now(),
    });

    return serializeRoomState(room);
  },

  stopPresentation(groupId: string): RoomState {
    const room = getOrCreateRoom(groupId);
    room.presenterId = null;
    room.presenterName = null;
    room.presentationType = 'none';
    room.presentationTitle = null;
    room.editorId = null;
    room.editorName = null;
    room.startedAt = null;
    room.isRunning = false;
    return serializeRoomState(room);
  },

  heartbeat(
    groupId: string,
    user: { id: string; name?: string | null; email?: string | null; image?: string | null },
    micOn?: boolean,
    camOn?: boolean,
    isSpeaking?: boolean
  ): RoomState {
    const room = getOrCreateRoom(groupId);
    const existing = room.participants.get(user.id);
    const now = Date.now();

    let role: 'presenter' | 'editor' | 'viewer' = 'viewer';
    if (room.presenterId === user.id) role = 'presenter';
    else if (room.editorId === user.id) role = 'editor';

    room.participants.set(user.id, {
      userId: user.id,
      name: user.name || user.email || 'Member',
      email: user.email || undefined,
      image: user.image || existing?.image,
      role,
      micOn: micOn !== undefined ? micOn : existing?.micOn ?? true,
      camOn: camOn !== undefined ? camOn : existing?.camOn ?? false,
      isSpeaking: isSpeaking !== undefined ? isSpeaking : existing?.isSpeaking ?? false,
      screenSharing: room.presenterId === user.id && room.presentationType !== 'none',
      presentationType: room.presenterId === user.id ? room.presentationType : 'none',
      joinedAt: existing?.joinedAt || new Date().toISOString(),
      lastSeen: now,
    });

    return serializeRoomState(room);
  },

  leaveRoom(groupId: string, userId: string): RoomState {
    const room = getOrCreateRoom(groupId);
    room.participants.delete(userId);
    room.signals.delete(userId);

    // If active presenter left, end presentation
    if (room.presenterId === userId) {
      room.presenterId = null;
      room.presenterName = null;
      room.presentationType = 'none';
      room.presentationTitle = null;
      room.editorId = null;
      room.editorName = null;
      room.startedAt = null;
      room.isRunning = false;
    } else if (room.editorId === userId) {
      room.editorId = null;
      room.editorName = null;
    }

    return serializeRoomState(room);
  },

  sendSignal(groupId: string, signalMsg: WebRTCSignalMessage): boolean {
    const room = getOrCreateRoom(groupId);
    let userQueue = room.signals.get(signalMsg.toUserId);
    if (!userQueue) {
      userQueue = [];
      room.signals.set(signalMsg.toUserId, userQueue);
    }
    userQueue.push(signalMsg);
    if (userQueue.length > 50) userQueue.shift();
    return true;
  },

  popSignals(groupId: string, userId: string): WebRTCSignalMessage[] {
    const room = getOrCreateRoom(groupId);
    const queue = room.signals.get(userId) || [];
    room.signals.set(userId, []);
    return queue;
  },

  updateCode(
    groupId: string,
    userId: string,
    code: string,
    language?: string
  ): { success: boolean; error?: string; state?: RoomState } {
    const room = getOrCreateRoom(groupId);
    const canEdit = userId === room.presenterId || (room.editorId && userId === room.editorId);
    if (!canEdit) {
      return { success: false, error: 'You do not have write permission in this room.' };
    }

    room.code = code;
    if (language) room.language = language;
    return { success: true, state: serializeRoomState(room) };
  },

  updateStdin(
    groupId: string,
    userId: string,
    stdin: string
  ): { success: boolean; error?: string; state?: RoomState } {
    const room = getOrCreateRoom(groupId);
    const canEdit = userId === room.presenterId || (room.editorId && userId === room.editorId);
    if (!canEdit) {
      return { success: false, error: 'You do not have permission to modify input.' };
    }

    room.stdin = stdin;
    return { success: true, state: serializeRoomState(room) };
  },

  grantEditAccess(
    groupId: string,
    presenterId: string,
    toUserId: string
  ): { success: boolean; error?: string; state?: RoomState } {
    const room = getOrCreateRoom(groupId);
    if (room.presenterId !== presenterId) {
      return { success: false, error: 'Only the presenter can grant edit access.' };
    }

    const targetUser = room.participants.get(toUserId);
    room.editorId = toUserId;
    room.editorName = targetUser?.name || 'Collaborator';

    return { success: true, state: serializeRoomState(room) };
  },

  revokeEditAccess(
    groupId: string,
    presenterId: string
  ): { success: boolean; error?: string; state?: RoomState } {
    const room = getOrCreateRoom(groupId);
    if (room.presenterId !== presenterId) {
      return { success: false, error: 'Only the presenter can revoke edit access.' };
    }

    room.editorId = null;
    room.editorName = null;

    return { success: true, state: serializeRoomState(room) };
  },

  setRunState(
    groupId: string,
    userId: string,
    isRunning: boolean,
    output?: RoomRunOutput | null
  ): { success: boolean; error?: string; state?: RoomState } {
    const room = getOrCreateRoom(groupId);
    // Any room participant can trigger a run — code already validated by the API
    const isParticipant = room.participants.has(userId) || userId === room.presenterId;
    if (!isParticipant) {
      return { success: false, error: 'You must be in the room to run code.' };
    }

    room.isRunning = isRunning;
    if (output !== undefined) {
      room.lastRunOutput = output;
    }

    return { success: true, state: serializeRoomState(room) };
  },

  addChatMessage(
    groupId: string,
    user: { id: string; name?: string | null; image?: string | null },
    text: string
  ): RoomChatMessage {
    const room = getOrCreateRoom(groupId);
    const msg: RoomChatMessage = {
      id: `rc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      roomId: room.roomId,
      userId: user.id,
      name: user.name || 'Member',
      image: user.image,
      text: text.trim(),
      ts: new Date().toISOString(),
    };

    room.chatMessages.push(msg);
    if (room.chatMessages.length > 100) {
      room.chatMessages.shift();
    }
    return msg;
  },

  getChatMessages(groupId: string): RoomChatMessage[] {
    const room = getOrCreateRoom(groupId);
    return room.chatMessages;
  },
};

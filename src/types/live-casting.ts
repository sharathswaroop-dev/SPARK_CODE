export type ParticipantRole = 'presenter' | 'editor' | 'viewer';

export type PresentationType =
  | 'none'
  | 'screen'
  | 'window'
  | 'browser-tab'
  | 'sparkcode-workspace'
  | 'code-editor';

export interface RoomParticipant {
  userId: string;
  name: string;
  email?: string;
  image?: string | null;
  role: ParticipantRole;
  micOn: boolean;
  camOn: boolean;
  isSpeaking?: boolean;
  screenSharing?: boolean;
  presentationType?: PresentationType;
  joinedAt: string;
  lastSeen: number;
}

export interface RoomRunOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number | null;
  isCompileError?: boolean;
  isTimeLimitExceeded?: boolean;
}

export interface RoomChatMessage {
  id: string;
  roomId: string;
  userId: string;
  name: string;
  image?: string | null;
  text: string;
  ts: string;
}

export interface RoomState {
  roomId: string;
  groupId: string;
  presenterId: string | null;
  presenterName: string | null;
  presentationType: PresentationType;
  presentationTitle: string | null;
  editorId: string | null;
  editorName: string | null;
  participants: RoomParticipant[];
  stdin: string;
  code: string;
  language: string;
  lastRunOutput: RoomRunOutput | null;
  isRunning: boolean;
  startedAt: string | null;
  unreadChatCount?: number;
}

export interface WebRTCSignalMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  signal: {
    type: 'offer' | 'answer' | 'candidate';
    sdp?: string;
    candidate?: RTCIceCandidateInit;
    streamType?: 'user-media' | 'screen-share';
  };
  ts: number;
}

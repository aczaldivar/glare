export type ChatMessage = {
  id: string;
  room: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
  clientNonce?: string;
};

export type PresenceMember = {
  id: string;
  name: string;
  color: string;
};

export type RealtimeProvider = "ably" | "local" | "unconfigured";

export type BotGuardMode = "off" | "turnstile" | "missing";

export type RealtimeConfig = {
  provider: RealtimeProvider;
  botGuard: BotGuardMode;
  verified: boolean;
  turnstileSiteKey: string | null;
};

export type BusEvent =
  | { type: "message"; message: ChatMessage }
  | { type: "presence"; members: PresenceMember[] }
  | { type: "history"; messages: ChatMessage[] };

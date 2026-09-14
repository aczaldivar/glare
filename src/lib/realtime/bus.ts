import { HISTORY_LIMIT, PRESENCE_TTL_MS } from "@/lib/constants";
import { pruneByRetention } from "@/lib/retention";
import type {
  BusEvent,
  ChatMessage,
  PresenceMember,
} from "@/lib/realtime/types";

type Listener = (event: BusEvent) => void;

type TrackedMember = PresenceMember & { lastSeen: number };

type RoomState = {
  messages: ChatMessage[];
  members: Map<string, TrackedMember>;
  listeners: Set<Listener>;
};

const g = globalThis as typeof globalThis & {
  __glareBus?: Map<string, RoomState>;
};

function rooms() {
  if (!g.__glareBus) {
    g.__glareBus = new Map();
  }
  return g.__glareBus;
}

function roomState(room: string): RoomState {
  const map = rooms();
  const existing = map.get(room);
  if (existing) return existing;
  const created: RoomState = {
    messages: [],
    members: new Map(),
    listeners: new Set(),
  };
  map.set(room, created);
  return created;
}

function pruneMembers(state: RoomState) {
  const now = Date.now();
  let changed = false;
  for (const [id, member] of state.members) {
    if (now - member.lastSeen > PRESENCE_TTL_MS) {
      state.members.delete(id);
      changed = true;
    }
  }
  return changed;
}

function emit(state: RoomState, event: BusEvent) {
  for (const listener of state.listeners) {
    listener(event);
  }
}

export function currentMembers(room: string): PresenceMember[] {
  const state = roomState(room);
  pruneMembers(state);
  return [...state.members.values()].map(({ id, name, color }) => ({
    id,
    name,
    color,
  }));
}

export function currentHistory(room: string): ChatMessage[] {
  const state = roomState(room);
  state.messages = pruneByRetention(state.messages).slice(-HISTORY_LIMIT);
  return [...state.messages];
}

export function publishLocalMessage(message: ChatMessage) {
  const state = roomState(message.room);
  state.messages = pruneByRetention([...state.messages, message]).slice(
    -HISTORY_LIMIT,
  );
  emit(state, { type: "message", message });
}

export function upsertPresence(room: string, member: PresenceMember) {
  const state = roomState(room);
  const pruned = pruneMembers(state);
  const previous = state.members.get(member.id);
  const next: TrackedMember = { ...member, lastSeen: Date.now() };
  state.members.set(member.id, next);
  const changed =
    pruned ||
    !previous ||
    previous.name !== member.name ||
    previous.color !== member.color;
  if (changed) {
    emit(state, { type: "presence", members: currentMembers(room) });
  }
}

export function leavePresence(room: string, memberId: string) {
  const state = roomState(room);
  pruneMembers(state);
  if (!state.members.delete(memberId)) return;
  emit(state, { type: "presence", members: currentMembers(room) });
}

export function subscribeRoom(room: string, listener: Listener) {
  const state = roomState(room);
  state.listeners.add(listener);
  return () => {
    state.listeners.delete(listener);
  };
}

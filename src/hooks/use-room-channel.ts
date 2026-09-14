"use client";

import { Realtime, type PresenceMessage, type RealtimeChannel } from "ably";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HISTORY_LIMIT,
  PRESENCE_HEARTBEAT_MS,
  ablyChannelName,
} from "@/lib/constants";
import { colorFromId, type Identity } from "@/lib/identity";
import type {
  ChatMessage,
  PresenceMember,
  RealtimeProvider,
} from "@/lib/realtime/types";

export type ConnectionState = "connecting" | "live" | "reconnecting" | "offline";

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort(
    (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id),
  );
}

function upsertMessage(list: ChatMessage[], incoming: ChatMessage) {
  const byId = list.findIndex((item) => item.id === incoming.id);
  if (byId >= 0) {
    const next = [...list];
    next[byId] = incoming;
    return sortMessages(next);
  }
  if (incoming.clientNonce) {
    const byNonce = list.findIndex(
      (item) => item.clientNonce === incoming.clientNonce,
    );
    if (byNonce >= 0) {
      const next = [...list];
      next[byNonce] = incoming;
      return sortMessages(next);
    }
  }
  return sortMessages([...list, incoming]);
}

function membersFromAbly(entries: PresenceMessage[]): PresenceMember[] {
  return entries
    .map((entry) => {
      const data = (entry.data ?? {}) as { name?: string; color?: string };
      const id = entry.clientId;
      if (!id) return null;
      return {
        id,
        name: data.name?.trim() || "Guest",
        color: data.color || colorFromId(id),
      };
    })
    .filter((member): member is PresenceMember => Boolean(member))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function unconfiguredNotice() {
  return "Realtime is not configured on this deploy. Add ABLY_API_KEY in Vercel to go live.";
}

export function useRoomChannel(room: string, identity: Identity | null) {
  const [provider, setProvider] = useState<RealtimeProvider | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const identityRef = useRef(identity);
  const ablyChannelRef = useRef<RealtimeChannel | null>(null);
  const localBeatRef = useRef<(() => void) | null>(null);
  const identityId = identity?.id ?? null;
  const identityName = identity?.name ?? null;

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/realtime/config")
      .then((res) => res.json())
      .then((data: { provider?: RealtimeProvider }) => {
        if (!cancelled) setProvider(data.provider ?? "unconfigured");
      })
      .catch(() => {
        if (!cancelled) setProvider("unconfigured");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!identityId || !provider || provider === "unconfigured") {
      return;
    }

    if (provider === "local") {
      const source = new EventSource(
        `/api/realtime/stream?room=${encodeURIComponent(room)}`,
      );
      source.onopen = () => setConnectionState("live");
      source.onerror = () => setConnectionState("reconnecting");
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type: string;
            message?: ChatMessage;
            messages?: ChatMessage[];
            members?: PresenceMember[];
          };
          if (payload.type === "history" && payload.messages) {
            setMessages(sortMessages(payload.messages));
          }
          if (payload.type === "message" && payload.message) {
            setMessages((current) => upsertMessage(current, payload.message!));
          }
          if (payload.type === "presence" && payload.members) {
            setMembers(
              [...payload.members].sort((a, b) => a.name.localeCompare(b.name)),
            );
          }
        } catch {
          // ignore malformed frames
        }
      };

      const beat = () => {
        const current = identityRef.current;
        if (!current) return;
        void fetch("/api/realtime/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room,
            id: current.id,
            name: current.name,
            action: "enter",
          }),
        });
      };

      localBeatRef.current = beat;
      beat();
      const heartbeat = window.setInterval(beat, PRESENCE_HEARTBEAT_MS);

      return () => {
        localBeatRef.current = null;
        window.clearInterval(heartbeat);
        source.close();
        const current = identityRef.current;
        if (current) {
          void fetch("/api/realtime/presence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              room,
              id: current.id,
              action: "leave",
            }),
            keepalive: true,
          });
        }
      };
    }

    let realtime: Realtime | null = null;
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    const start = async () => {
      realtime = new Realtime({
        authUrl: `/api/realtime/token?clientId=${encodeURIComponent(identityId)}`,
        clientId: identityId,
        closeOnUnload: true,
      });

      realtime.connection.on("connected", () => {
        if (!cancelled) setConnectionState("live");
      });
      realtime.connection.on("connecting", () => {
        if (!cancelled) setConnectionState("connecting");
      });
      realtime.connection.on("disconnected", () => {
        if (!cancelled) setConnectionState("reconnecting");
      });
      realtime.connection.on("suspended", () => {
        if (!cancelled) setConnectionState("reconnecting");
      });
      realtime.connection.on("failed", () => {
        if (!cancelled) {
          setConnectionState("offline");
          setLiveNotice("Could not reach realtime. Check the Ably API key.");
        }
      });

      channel = realtime.channels.get(ablyChannelName(room), {
        params: { rewind: String(HISTORY_LIMIT) },
      });
      ablyChannelRef.current = channel;

      channel.subscribe("message", (message) => {
        const data = message.data as ChatMessage | undefined;
        if (!data?.id || !data.text) return;
        setMessages((current) => upsertMessage(current, data));
      });

      const refreshPresence = async () => {
        if (!channel) return;
        const entries = await channel.presence.get();
        if (!cancelled) setMembers(membersFromAbly(entries));
      };

      channel.presence.subscribe(() => {
        void refreshPresence();
      });

      const current = identityRef.current;
      await channel.attach();
      await channel.presence.enter({
        name: current?.name ?? "Guest",
        color: colorFromId(identityId),
      });
      await refreshPresence();
    };

    void start();

    return () => {
      cancelled = true;
      ablyChannelRef.current = null;
      const activeChannel = channel;
      const client = realtime;
      channel = null;
      realtime = null;
      if (activeChannel) {
        void activeChannel.presence.leave();
        activeChannel.unsubscribe();
        void activeChannel.detach();
      }
      client?.close();
    };
  }, [identityId, provider, room]);

  useEffect(() => {
    if (!identityId || !identityName) return;
    localBeatRef.current?.();
    const channel = ablyChannelRef.current;
    if (channel) {
      void channel.presence.update({
        name: identityName,
        color: colorFromId(identityId),
      });
    }
  }, [identityId, identityName]);

  const send = useCallback(
    async (text: string) => {
      const current = identityRef.current;
      if (!current) throw new Error("Identity is not ready.");
      const clientNonce = crypto.randomUUID();
      const optimistic: ChatMessage = {
        id: clientNonce,
        room,
        authorId: current.id,
        authorName: current.name,
        text,
        createdAt: Date.now(),
        clientNonce,
      };
      setMessages((currentMessages) => upsertMessage(currentMessages, optimistic));

      const response = await fetch("/api/realtime/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          authorId: current.id,
          authorName: current.name,
          text,
          clientNonce,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: ChatMessage;
      };

      if (!response.ok) {
        setMessages((currentMessages) =>
          currentMessages.filter((item) => item.clientNonce !== clientNonce),
        );
        throw new Error(payload.error || "Could not send that message.");
      }

      if (payload.message) {
        setMessages((currentMessages) =>
          upsertMessage(currentMessages, payload.message!),
        );
      }
    },
    [room],
  );

  const connection: ConnectionState =
    provider === "unconfigured" ? "offline" : connectionState;
  const notice =
    provider === "unconfigured" ? unconfiguredNotice() : liveNotice;

  const self = useMemo(
    () =>
      identityId
        ? members.find((member) => member.id === identityId)
        : undefined,
    [identityId, members],
  );

  return {
    provider,
    messages,
    members,
    connection,
    notice,
    send,
    self,
  };
}

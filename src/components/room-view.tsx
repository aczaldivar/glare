"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { GlareMark } from "@/components/glare-mark";
import { RoomGate } from "@/components/room-gate";
import { SafetyActions } from "@/components/safety-actions";
import { SiteFooter } from "@/components/site-footer";
import { useIdentity } from "@/hooks/use-identity";
import { useLegalAck } from "@/hooks/use-legal-ack";
import { useLocalModeration } from "@/hooks/use-local-moderation";
import { useRoomChannel, type ConnectionState } from "@/hooks/use-room-channel";
import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from "@/lib/constants";
import { colorFromId, initialsFromName, type Identity } from "@/lib/identity";
import { SAFETY_BANNER } from "@/lib/legal";
import { isWithinRetention } from "@/lib/retention";
import { normalizeMessageText } from "@/lib/messages";
import type { ChatMessage, PresenceMember } from "@/lib/realtime/types";
import { roomDisplayName } from "@/lib/rooms";

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function connectionLabel(state: ConnectionState) {
  if (state === "live") return "Live";
  if (state === "reconnecting") return "Reconnecting";
  if (state === "offline") return "Offline";
  return "Connecting";
}

export function RoomView({ room }: { room: string }) {
  const legal = useLegalAck();

  if (!legal.ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        Warming the room…
      </div>
    );
  }

  if (!legal.acknowledged) {
    return <RoomGate room={room} onAccept={legal.acknowledge} />;
  }

  return <RoomLive room={room} />;
}

function RoomLive({ room }: { room: string }) {
  const { identity, ready, updateName } = useIdentity();
  const channel = useRoomChannel(room, identity);
  const moderation = useLocalModeration();
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const title = roomDisplayName(room);
  const remaining = MAX_MESSAGE_LENGTH - draft.length;

  const visibleMessages = useMemo(
    () =>
      channel.messages.filter(
        (message) =>
          isWithinRetention(message.createdAt) &&
          !moderation.blockedIds.has(message.authorId) &&
          !moderation.hiddenMessageIds.has(message.id),
      ),
    [channel.messages, moderation.blockedIds, moderation.hiddenMessageIds],
  );

  const people = useMemo(() => {
    const list = channel.members.length
      ? channel.members
      : identity
        ? [
            {
              id: identity.id,
              name: identity.name,
              color: colorFromId(identity.id),
            },
          ]
        : [];
    return list;
  }, [channel.members, identity]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [visibleMessages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [ready]);

  async function shareRoom() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this room link", url);
    }
  }

  async function onSend(event: FormEvent) {
    event.preventDefault();
    const text = normalizeMessageText(draft);
    if (!text || !identity) return;
    setSendError(null);
    setDraft("");
    try {
      await channel.send(text);
    } catch (error) {
      setDraft(text);
      setSendError(error instanceof Error ? error.message : "Could not send.");
    }
  }

  function onSaveName(event: FormEvent) {
    event.preventDefault();
    const result = updateName(nameDraft);
    if (result.ok) {
      setEditingName(false);
    }
  }

  if (!ready || !identity) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        Warming the room…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-[env(safe-area-inset-bottom)] pt-4 sm:px-6">
      <header className="panel mb-4 flex flex-col gap-4 rounded-[24px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0" aria-label="Back to Glare Room">
            <GlareMark compact />
          </Link>
          <button
            type="button"
            aria-expanded={peopleOpen}
            aria-controls="room-people"
            onClick={() => setPeopleOpen((open) => !open)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted sm:hidden"
          >
            <span className="live-dot size-1.5 rounded-full bg-live" />
            People in room
            <span className="text-ink/80">{people.length || 1}</span>
          </button>
        </div>
        <div className="min-w-0 flex-1 sm:text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted">
            Public room · /r/{room}
          </p>
          <h1 className="truncate font-display text-3xl italic text-ink sm:text-4xl">
            {title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NameChip
            identity={identity}
            editing={editingName}
            nameDraft={nameDraft}
            onNameDraft={setNameDraft}
            onStartEdit={() => {
              setNameDraft(identity.name);
              setEditingName(true);
            }}
            onSave={onSaveName}
          />
          <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted sm:inline-flex">
            <span
              className={`size-1.5 rounded-full ${
                channel.connection === "live" ? "live-dot bg-live" : "bg-ember"
              }`}
            />
            {connectionLabel(channel.connection)}
            <span className="text-ink/80">{people.length || 1}</span>
          </span>
          <button
            type="button"
            onClick={shareRoom}
            className="min-h-11 rounded-full bg-glare px-4 text-xs font-semibold tracking-wide text-[#2a1c0a] transition hover:bg-glare-hot"
          >
            {copied ? "Copied" : "Share link"}
          </button>
        </div>
      </header>

      <p className="mb-4 px-1 text-xs leading-5 text-ember">{SAFETY_BANNER}</p>

      <div className="grid min-h-0 flex-1 gap-4 pb-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          id="room-people"
          className={`panel rounded-[24px] p-4 ${peopleOpen ? "block" : "hidden"} lg:block`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            In the room
          </p>
          <ul className="mt-4 space-y-3">
            {people.map((member) => (
              <li key={member.id}>
                <PresenceRow
                  member={member}
                  isSelf={member.id === identity.id}
                  room={room}
                  identity={identity}
                  blocked={moderation.isBlocked(member.id)}
                  onBlock={() => moderation.blockUser(member.id)}
                  onUnblock={() => moderation.unblockUser(member.id)}
                />
              </li>
            ))}
          </ul>
          {moderation.blockedIds.size > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted">
              <p>
                {moderation.blockedIds.size} muted or blocked in this browser.
              </p>
              <button
                type="button"
                onClick={moderation.clearBlocks}
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                Unmute all
              </button>
            </div>
          ) : null}
        </aside>

        <section className="panel flex min-h-[70dvh] flex-col overflow-hidden rounded-[24px] lg:min-h-0">
          {channel.notice ? (
            <div className="border-b border-line bg-ember/10 px-4 py-3 text-sm text-ember sm:px-5">
              {channel.notice}
            </div>
          ) : null}

          <div
            ref={scrollerRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
            aria-live="polite"
          >
            {visibleMessages.length === 0 ? (
              <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center">
                <p className="font-display text-3xl italic text-ink">
                  The room is quiet.
                </p>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  Say something. Anyone with the link can walk in — no account
                  required.
                </p>
                {/* Ethics: light civility nudge for empty rooms. Refine copy later; no heavy filter. */}
                <p className="mt-3 max-w-sm text-xs text-muted">
                  Public room. Be decent with the people who walk in.
                </p>
                <button
                  type="button"
                  onClick={shareRoom}
                  className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm text-muted transition hover:border-glare/40 hover:text-ink"
                >
                  {copied ? "Copied" : "Share link"}
                </button>
              </div>
            ) : (
              visibleMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isSelf={message.authorId === identity.id}
                  delay={Math.min(index, 8) * 20}
                  room={room}
                  identity={identity}
                  blocked={moderation.isBlocked(message.authorId)}
                  onHideMessage={() => moderation.hideMessage(message.id)}
                  onBlock={() => moderation.blockUser(message.authorId)}
                  onUnblock={() => moderation.unblockUser(message.authorId)}
                />
              ))
            )}
          </div>

          <form onSubmit={onSend} className="border-t border-line p-3 sm:p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-line bg-black/25 p-2 focus-within:border-glare/40 focus-within:shadow-[0_0_0_4px_rgba(255,217,160,0.1)]">
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH));
                  if (sendError) setSendError(null);
                }}
                placeholder="Write to the room"
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={channel.connection === "offline"}
                className="h-11 min-h-11 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!normalizeMessageText(draft) || channel.connection === "offline"}
                className="inline-flex h-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-glare px-5 text-sm font-semibold text-[#2a1c0a] transition hover:bg-glare-hot disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted">
              <span>
                {sendError ??
                  (channel.connection === "offline"
                    ? channel.notice ??
                      "You're offline. Messages will send when the room is live again."
                    : "500-character cap · rate limited · report harm when you see it.")}
              </span>
              {remaining <= 50 ? (
                <span className={remaining <= 40 ? "text-ember" : ""}>
                  {remaining}
                </span>
              ) : (
                <span className="sr-only">{remaining} characters left</span>
              )}
            </div>
          </form>
        </section>
      </div>

      <SiteFooter compact />
    </div>
  );
}

function NameChip({
  identity,
  editing,
  nameDraft,
  onNameDraft,
  onStartEdit,
  onSave,
}: {
  identity: Identity;
  editing: boolean;
  nameDraft: string;
  onNameDraft: (value: string) => void;
  onStartEdit: () => void;
  onSave: (event: FormEvent) => void;
}) {
  if (editing) {
    return (
      <form onSubmit={onSave} className="flex min-w-0 items-center gap-2">
        <input
          value={nameDraft}
          onChange={(event) => onNameDraft(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          aria-label="Display name"
          className="h-11 min-h-11 min-w-0 max-w-40 rounded-full border border-line bg-black/30 px-3 text-sm outline-none focus:border-glare/50"
          autoFocus
        />
        <button
          type="submit"
          className="inline-flex h-11 min-h-11 min-w-11 items-center justify-center rounded-full bg-glare px-3 text-xs font-semibold text-[#2a1c0a]"
        >
          Save
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={onStartEdit}
      className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-line px-2 py-1 text-left transition hover:border-glare/40"
      aria-label={`Display name ${identity.name}. Click to rename.`}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[#1a1208]"
        style={{ background: colorFromId(identity.id) }}
      >
        {initialsFromName(identity.name)}
      </span>
      <span className="truncate pr-2 text-sm text-ink">{identity.name}</span>
    </button>
  );
}

function PresenceRow({
  member,
  isSelf,
  room,
  identity,
  blocked,
  onBlock,
  onUnblock,
}: {
  member: PresenceMember;
  isSelf: boolean;
  room: string;
  identity: Identity;
  blocked: boolean;
  onBlock: () => void;
  onUnblock: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl px-1 py-1">
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[#1a1208]"
        style={{ background: member.color }}
      >
        {initialsFromName(member.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink">
          {member.name}
          {isSelf ? <span className="ml-1 text-muted">(you)</span> : null}
        </p>
        {!isSelf ? (
          <div className="mt-1">
            <SafetyActions
              room={room}
              identity={identity}
              targetType="user"
              targetId={member.id}
              targetName={member.name}
              blocked={blocked}
              onBlock={onBlock}
              onUnblock={onUnblock}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isSelf,
  delay,
  room,
  identity,
  blocked,
  onHideMessage,
  onBlock,
  onUnblock,
}: {
  message: ChatMessage;
  isSelf: boolean;
  delay: number;
  room: string;
  identity: Identity;
  blocked: boolean;
  onHideMessage: () => void;
  onBlock: () => void;
  onUnblock: () => void;
}) {
  return (
    <div
      className={`rise-in flex ${isSelf ? "justify-end" : "justify-start"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`max-w-[min(100%,36rem)] rounded-3xl px-4 py-3 ${
          isSelf
            ? "bg-[linear-gradient(180deg,rgba(255,217,160,0.22),rgba(255,217,160,0.08))] text-glare-hot"
            : "bg-white/5 text-ink"
        }`}
      >
        <div className="flex items-baseline gap-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            {isSelf ? "You" : message.authorName}
          </p>
          <time className="font-mono text-[10px] text-muted/80">
            {formatTime(message.createdAt)}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.text}</p>
        {!isSelf ? (
          <div className="mt-2">
            <SafetyActions
              room={room}
              identity={identity}
              targetType="message"
              targetId={message.authorId}
              targetName={message.authorName}
              messageId={message.id}
              messageText={message.text}
              blocked={blocked}
              onHideMessage={onHideMessage}
              onBlock={onBlock}
              onUnblock={onUnblock}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

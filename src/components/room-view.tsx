"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { EmbeddedChat } from "@/components/embedded-chat";
import { GlareMark } from "@/components/glare-mark";
import { NameChip } from "@/components/name-chip";
import { RoomGate } from "@/components/room-gate";
import { SafetyActions } from "@/components/safety-actions";
import { SiteFooter } from "@/components/site-footer";
import { useIdentity } from "@/hooks/use-identity";
import { useLegalAck } from "@/hooks/use-legal-ack";
import { useLocalModeration } from "@/hooks/use-local-moderation";
import { useRoomChannel, type ConnectionState } from "@/hooks/use-room-channel";
import { colorFromId, initialsFromName, type Identity } from "@/lib/identity";
import { SAFETY_BANNER } from "@/lib/legal";
import type { PresenceMember } from "@/lib/realtime/types";
import { roomDisplayName } from "@/lib/rooms";

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
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [peopleOpen, setPeopleOpen] = useState(false);

  const title = roomDisplayName(room);

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

        <div className="flex min-h-[70dvh] flex-col lg:min-h-0">
          <EmbeddedChat
            room={room}
            identity={identity}
            messages={channel.messages}
            connection={channel.connection}
            notice={channel.notice}
            send={channel.send}
            onShare={shareRoom}
            copied={copied}
          />
        </div>
      </div>

      <SiteFooter compact />
    </div>
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

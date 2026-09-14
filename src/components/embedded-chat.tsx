"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SafetyActions } from "@/components/safety-actions";
import { useLocalModeration } from "@/hooks/use-local-moderation";
import type { ConnectionState } from "@/hooks/use-room-channel";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import type { Identity } from "@/lib/identity";
import { normalizeMessageText } from "@/lib/messages";
import { isWithinRetention } from "@/lib/retention";
import type { ChatMessage } from "@/lib/realtime/types";

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export function EmbeddedChat({
  room,
  identity,
  messages,
  connection,
  notice,
  send,
  quoteSeed = null,
  emptyTitle = "The room is quiet.",
  emptyBody = "Say something. Anyone with the link can walk in — no account required.",
  emptyHint = "Public room. Be decent with the people who walk in.",
  placeholder = "Write to the room",
  helperText = "500-character cap · rate limited · report harm when you see it.",
  softNudges = [],
  onShare,
  copied = false,
}: {
  room: string;
  identity: Identity;
  messages: ChatMessage[];
  connection: ConnectionState;
  notice: string | null;
  send: (text: string) => Promise<void>;
  quoteSeed?: { id: number; text: string } | null;
  emptyTitle?: string;
  emptyBody?: string;
  emptyHint?: string;
  placeholder?: string;
  helperText?: string;
  /** Ethics soft pack: light copy only, never a filter. */
  softNudges?: string[];
  onShare?: () => void;
  copied?: boolean;
}) {
  const moderation = useLocalModeration();
  const [draft, setDraft] = useState("");
  const [appliedQuoteId, setAppliedQuoteId] = useState<number | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_MESSAGE_LENGTH - draft.length;

  const visibleMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          isWithinRetention(message.createdAt) &&
          !moderation.blockedIds.has(message.authorId) &&
          !moderation.hiddenMessageIds.has(message.id),
      ),
    [messages, moderation.blockedIds, moderation.hiddenMessageIds],
  );

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [visibleMessages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!quoteSeed || quoteSeed.id === appliedQuoteId) return;
    /* Pixel: apply quote after click, not during render (hidden Chat skipped the first paint). */
    /* eslint-disable react-hooks/set-state-in-effect -- quoteSeed is a parent user action */
    setAppliedQuoteId(quoteSeed.id);
    setDraft(quoteSeed.text.slice(0, MAX_MESSAGE_LENGTH));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [quoteSeed, appliedQuoteId]);

  useEffect(() => {
    if (appliedQuoteId == null) return;
    inputRef.current?.focus();
  }, [appliedQuoteId]);

  async function onSend(event: FormEvent) {
    event.preventDefault();
    const text = normalizeMessageText(draft);
    if (!text) return;
    setSendError(null);
    setDraft("");
    try {
      await send(text);
    } catch (error) {
      setDraft(text);
      setSendError(error instanceof Error ? error.message : "Could not send.");
    }
  }

  return (
    <section className="panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px]">
      {notice ? (
        <div className="border-b border-line bg-ember/10 px-4 py-3 text-sm text-ember sm:px-5">
          {notice}
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
        aria-live="polite"
      >
        {visibleMessages.length === 0 ? (
          <div className="flex h-full min-h-[28vh] flex-col items-center justify-center text-center">
            <p className="font-display text-3xl italic text-ink">{emptyTitle}</p>
            <p className="mt-2 max-w-sm text-sm text-muted">{emptyBody}</p>
            {/* Ethics: light civility nudge. Refine copy later; no heavy filter. */}
            {emptyHint ? (
              <p className="mt-3 max-w-sm text-xs text-muted">{emptyHint}</p>
            ) : null}
            {softNudges.length > 0 ? (
              <ul className="mt-3 max-w-sm space-y-1 text-xs text-muted">
                {softNudges.map((nudge) => (
                  <li key={nudge}>{nudge}</li>
                ))}
              </ul>
            ) : null}
            {onShare ? (
              <button
                type="button"
                onClick={onShare}
                className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm text-muted transition hover:border-glare/40 hover:text-ink"
              >
                {copied ? "Copied" : "Share link"}
              </button>
            ) : null}
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

      {softNudges.length > 0 && visibleMessages.length > 0 ? (
        <p className="border-t border-line px-4 py-2 text-[11px] leading-5 text-muted sm:px-5">
          {softNudges.join(" · ")}
        </p>
      ) : null}

      <form onSubmit={onSend} className="border-t border-line p-3 sm:p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-black/25 p-2 focus-within:border-glare/40 focus-within:shadow-[0_0_0_4px_rgba(255,217,160,0.1)]">
          <label htmlFor="room-composer" className="sr-only">
            Message
          </label>
          <input
            id="room-composer"
            ref={inputRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH));
              if (sendError) setSendError(null);
            }}
            name="message"
            placeholder={placeholder}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={connection === "offline"}
            autoComplete="off"
            className="h-11 min-h-11 flex-1 bg-transparent px-3 text-sm text-ink placeholder:text-muted disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!normalizeMessageText(draft) || connection === "offline"}
            className="inline-flex h-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-glare px-5 text-sm font-semibold text-[#2a1c0a] transition hover:bg-glare-hot disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted">
          <span>
            {sendError ??
              (connection === "offline"
                ? notice ??
                  "You're offline. Messages will send when the room is live again."
                : helperText)}
          </span>
          {remaining <= 50 ? (
            <span className={remaining <= 40 ? "text-ember" : ""}>{remaining}</span>
          ) : (
            <span className="sr-only">{remaining} characters left</span>
          )}
        </div>
      </form>
    </section>
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

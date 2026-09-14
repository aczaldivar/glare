"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TranscriptCue } from "@/lib/podcast/types";

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function TranscriptPanel({
  cues,
  currentMs,
  follow,
  onFollow,
  onSeek,
  onQuote,
}: {
  cues: TranscriptCue[];
  currentMs: number;
  follow: boolean;
  onFollow: (next: boolean) => void;
  onSeek: (ms: number) => void;
  onQuote: (cue: TranscriptCue) => void;
}) {
  const [query, setQuery] = useState("");
  const activeRef = useRef<HTMLLIElement | null>(null);
  const ignoreScroll = useRef(false);

  const activeId = useMemo(() => {
    const match = cues.find(
      (cue) => currentMs >= cue.startMs && currentMs < cue.endMs,
    );
    return match?.id ?? cues[cues.length - 1]?.id ?? null;
  }, [cues, currentMs]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return cues;
    return cues.filter((cue) => cue.text.toLowerCase().includes(needle));
  }, [cues, query]);

  useEffect(() => {
    if (!follow) return;
    ignoreScroll.current = true;
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const timer = window.setTimeout(() => {
      ignoreScroll.current = false;
    }, 400);
    return () => window.clearTimeout(timer);
  }, [activeId, follow]);

  return (
    <section className="panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            Transcript
          </p>
          <p className="text-sm text-ink">Searchable · English</p>
        </div>
        <button
          type="button"
          onClick={() => onFollow(true)}
          className={`min-h-11 rounded-full border px-3 text-xs ${
            follow
              ? "border-glare/50 text-glare"
              : "border-line text-muted hover:text-ink"
          }`}
        >
          {follow ? "Following" : "Follow audio"}
        </button>
      </div>
      <div className="border-b border-line px-4 py-3">
        <label className="block">
          <span className="sr-only">Search transcript</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the transcript"
            className="h-11 w-full rounded-2xl border border-line bg-black/30 px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-glare/50"
          />
        </label>
      </div>
      <div
        className="flex-1 overflow-y-auto px-3 py-3"
        onScroll={() => {
          if (ignoreScroll.current) return;
          if (follow) onFollow(false);
        }}
      >
        {visible.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted">
            No lines match that search.
          </p>
        ) : (
          <ol className="space-y-2">
            {visible.map((cue) => {
              const active = cue.id === activeId;
              return (
                <li
                  key={cue.id}
                  ref={active ? activeRef : undefined}
                  className={`rounded-2xl px-3 py-3 ${
                    active ? "bg-glare/10" : "bg-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onFollow(true);
                        onSeek(cue.startMs);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-mono text-[10px] text-muted">
                        {formatClock(cue.startMs)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-ink">{cue.text}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuote(cue)}
                      className="mt-1 shrink-0 text-[11px] text-glare underline-offset-4 hover:underline"
                    >
                      Quote
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

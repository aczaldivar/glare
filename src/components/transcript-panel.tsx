"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { activeCueId as cueIdAtTime } from "@/lib/podcast/cues";
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

  const activeId = useMemo(
    () => cueIdAtTime(cues, currentMs),
    [cues, currentMs],
  );

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
            Searchable · English
          </p>
          <h2 className="text-sm text-ink">Transcript (same conversation)</h2>
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
        <label htmlFor="transcript-search" className="block">
          <span className="sr-only">Search transcript</span>
          <input
            id="transcript-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the transcript"
            className="h-11 w-full rounded-2xl border border-line bg-black/30 px-3 text-sm text-ink placeholder:text-muted focus:border-glare/50"
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
        {cues.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted">
            No transcript for this episode.
          </p>
        ) : visible.length === 0 ? (
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
                  aria-current={active ? "true" : undefined}
                  className={`rounded-r-2xl border-l-4 px-3 py-3 ${
                    active
                      ? "border-l-glare bg-glare/10"
                      : "border-l-transparent bg-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onFollow(true);
                        onSeek(cue.startMs);
                      }}
                      aria-label={`Seek to ${formatClock(cue.startMs)}`}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-mono text-[10px] text-muted">
                        {active ? "Now · " : null}
                        {formatClock(cue.startMs)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-ink">{cue.text}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuote(cue)}
                      aria-label="Quote this line in chat"
                      className="box-border inline-flex h-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-line px-3 text-[11px] text-glare hover:border-glare/50"
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

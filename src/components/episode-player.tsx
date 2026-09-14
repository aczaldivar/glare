"use client";

import { useEffect, useRef } from "react";
import type { PodcastEpisode } from "@/lib/podcast/types";

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function EpisodePlayer({
  episode,
  currentMs,
  playing,
  compact = false,
  onToggle,
  onSeek,
}: {
  episode: PodcastEpisode;
  currentMs: number;
  playing: boolean;
  compact?: boolean;
  onToggle: () => void;
  onSeek: (ms: number) => void;
}) {
  const barRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    barRef.current.value = String(currentMs);
  }, [currentMs]);

  return (
    <div
      className={`panel rounded-[24px] ${compact ? "px-3 py-3" : "px-4 py-4 sm:px-5"}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-11 min-h-11 min-w-14 shrink-0 items-center justify-center rounded-full bg-glare px-3 text-xs font-semibold text-[#2a1c0a]"
          aria-label={playing ? "Pause episode" : "Play episode"}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl italic text-ink sm:text-2xl">
            {episode.title}
          </p>
          {!compact ? (
            <p className="mt-1 truncate text-xs text-muted">{episode.description}</p>
          ) : (
            <p className="font-mono text-[11px] text-muted">
              {formatClock(currentMs)} / {formatClock(episode.durationMs)}
            </p>
          )}
        </div>
        {!compact ? (
          <p className="hidden shrink-0 font-mono text-xs text-muted sm:block">
            {formatClock(currentMs)} / {formatClock(episode.durationMs)}
          </p>
        ) : null}
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Episode progress</span>
        <input
          ref={barRef}
          type="range"
          min={0}
          max={episode.durationMs}
          step={250}
          defaultValue={0}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="h-2 w-full cursor-pointer accent-[#e8a15a]"
        />
      </label>
    </div>
  );
}

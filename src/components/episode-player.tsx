"use client";

import { useEffect, useRef } from "react";
import type { PodcastEpisode } from "@/lib/podcast/types";

export const PLAYBACK_RATES = [1, 1.25, 1.5] as const;
export const SKIP_MS = 15_000;

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatRate(rate: number) {
  return `${rate}×`;
}

export function EpisodePlayer({
  episode,
  currentMs,
  playing,
  compact = false,
  disabled = false,
  playbackRate = 1,
  onToggle,
  onSeek,
  onSkip,
  onCycleRate,
}: {
  episode: PodcastEpisode;
  currentMs: number;
  playing: boolean;
  compact?: boolean;
  disabled?: boolean;
  playbackRate?: number;
  onToggle: () => void;
  onSeek: (ms: number) => void;
  onSkip?: (deltaMs: number) => void;
  onCycleRate?: () => void;
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
          disabled={disabled}
          className="inline-flex h-11 min-h-11 min-w-14 shrink-0 items-center justify-center rounded-full bg-glare px-3 text-xs font-semibold text-[#2a1c0a] disabled:cursor-not-allowed disabled:opacity-40"
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
          aria-valuetext={`${formatClock(currentMs)} of ${formatClock(episode.durationMs)}`}
          disabled={disabled}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="h-2 w-full cursor-pointer accent-[#e8a15a] disabled:cursor-not-allowed"
        />
      </label>
      {onSkip || onCycleRate ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {onSkip ? (
            <>
              <button
                type="button"
                onClick={() => onSkip(-SKIP_MS)}
                disabled={disabled}
                className="inline-flex h-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-line px-3 text-xs text-muted disabled:opacity-40"
                aria-label="Back 15 seconds"
              >
                −15
              </button>
              <button
                type="button"
                onClick={() => onSkip(SKIP_MS)}
                disabled={disabled}
                className="inline-flex h-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-line px-3 text-xs text-muted disabled:opacity-40"
                aria-label="Forward 15 seconds"
              >
                +15
              </button>
            </>
          ) : null}
          {onCycleRate ? (
            <button
              type="button"
              onClick={onCycleRate}
              disabled={disabled}
              className="inline-flex h-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-line px-3 text-xs text-muted disabled:opacity-40"
              aria-label={`Playback speed ${formatRate(playbackRate)}. Click to change.`}
            >
              {formatRate(playbackRate)}
            </button>
          ) : null}
        </div>
      ) : null}
      {disabled ? (
        <p className="mt-2 text-xs text-muted">
          Playback is for curated in-repo files. Official embeds are catalog-only
          until a player is wired.
        </p>
      ) : null}
    </div>
  );
}

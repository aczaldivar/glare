import type { TranscriptCue } from "./types";

/** Map playback time to the cue that should be highlighted. */
export function activeCueId(cues: TranscriptCue[], currentMs: number) {
  if (cues.length === 0) return null;
  const match = cues.find(
    (cue) => currentMs >= cue.startMs && currentMs < cue.endMs,
  );
  if (match) return match.id;
  if (currentMs >= cues[cues.length - 1].endMs) {
    return cues[cues.length - 1].id;
  }
  return cues[0].id;
}

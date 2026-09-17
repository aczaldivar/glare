import assert from "node:assert/strict";
import { test } from "node:test";
import { activeCueId } from "./cues";
import { OPEN_TAB_EP1 } from "./open-tab-ep1";
import type { TranscriptCue } from "./types";

const cues: TranscriptCue[] = [
  { id: "a", startMs: 0, endMs: 1_000, text: "one" },
  { id: "b", startMs: 1_000, endMs: 2_000, text: "two" },
  { id: "c", startMs: 2_000, endMs: 3_000, text: "three" },
];

test("activeCueId follows timeupdate into the current cue", () => {
  assert.equal(activeCueId(cues, 0), "a");
  assert.equal(activeCueId(cues, 999), "a");
  assert.equal(activeCueId(cues, 1_000), "b");
  assert.equal(activeCueId(cues, 2_500), "c");
});

test("activeCueId stays on the last cue at and past duration", () => {
  assert.equal(activeCueId(cues, 3_000), "c");
  assert.equal(activeCueId(cues, 9_000), "c");
});

test("activeCueId is null when there is no transcript", () => {
  assert.equal(activeCueId([], 0), null);
});

test("open tab cues are contiguous so highlight never falls back mid-episode", () => {
  const cues = OPEN_TAB_EP1.transcript;
  assert.equal(cues.length, 23);
  for (let i = 0; i < cues.length - 1; i++) {
    assert.equal(
      cues[i].endMs,
      cues[i + 1].startMs,
      `${cues[i].id} endMs must equal ${cues[i + 1].id} startMs`,
    );
  }
});

test("open tab timeupdate maps begin/mid/end playback into the spoken cue", () => {
  const cues = OPEN_TAB_EP1.transcript;
  // Beginning: first spoken line, then the 8.05s handoff into c2.
  assert.equal(activeCueId(cues, 0), "c1");
  assert.equal(activeCueId(cues, 100), "c1");
  assert.equal(activeCueId(cues, 8_049), "c1");
  assert.equal(activeCueId(cues, 8_050), "c2");
  // Middle: sticky-signals beat (c12) around 1:27.
  assert.equal(activeCueId(cues, 87_787), "c12");
  assert.equal(activeCueId(cues, 97_099), "c12");
  assert.equal(activeCueId(cues, 97_100), "c13");
  // End: last line stays highlighted through the close.
  assert.equal(activeCueId(cues, 175_787), "c23");
  assert.equal(activeCueId(cues, 180_725), "c23");
  assert.equal(activeCueId(cues, OPEN_TAB_EP1.durationMs), "c23");
});

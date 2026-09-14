import assert from "node:assert/strict";
import { test } from "node:test";
import { activeCueId } from "./cues";
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

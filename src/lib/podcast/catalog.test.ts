import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { getPodcastEpisode } from "./catalog";
import { sanitizeTranscriptText } from "./sanitize";
import { isCuratedAudioPath } from "./types";

test("demo podcast episode is a curated in-repo file, not an upload", () => {
  const episode = getPodcastEpisode("lobby-ep1");
  assert.ok(episode);
  assert.equal(episode?.language, "en");
  assert.equal(episode?.media.kind, "file");
  assert.equal(episode?.audioUrl, "/audio/demo-episode.mp3");
  assert.ok((episode?.transcript.length ?? 0) > 0);
  assert.ok(
    episode?.transcript.every((cue) => cue.text && !cue.text.includes("<script")),
  );
});

test("curated audio paths must stay under /audio/", () => {
  assert.equal(isCuratedAudioPath("/audio/demo-episode.mp3"), true);
  assert.equal(isCuratedAudioPath("/audio/../secret.mp3"), false);
  assert.equal(isCuratedAudioPath("https://example.com/track.mp3"), false);
  assert.equal(isCuratedAudioPath("/uploads/user.mp3"), false);
});

test("demo audio file is shipped in public/audio", () => {
  assert.equal(
    existsSync(join(process.cwd(), "public/audio/demo-episode.mp3")),
    true,
  );
});

test("content warnings are sanitized as plain text", () => {
  assert.equal(
    sanitizeTranscriptText('Flash <b>strobe</b> <script>x</script>'),
    "Flash strobe",
  );
});

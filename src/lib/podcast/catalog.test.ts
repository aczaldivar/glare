import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { getPodcastEpisode, prepareCatalogEpisode } from "./catalog";
import { DEMO_EPISODE } from "./demo-episode";
import { OPEN_TAB_EP1 } from "./open-tab-ep1";
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
  assert.equal(isCuratedAudioPath("/audio/open-tab-ep1.mp3"), true);
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

test("open tab ep1 is a curated in-repo file with Counsel cues", () => {
  const episode = getPodcastEpisode("news-ep1");
  assert.ok(episode);
  assert.equal(episode?.roomSlug, "news-ep1");
  assert.equal(episode?.title, "Open Tab — Ep. 1: What Stuck");
  assert.equal(episode?.language, "en");
  assert.equal(episode?.media.kind, "file");
  assert.equal(episode?.audioUrl, "/audio/open-tab-ep1.mp3");
  assert.equal(episode?.media.src, "/audio/open-tab-ep1.mp3");
  assert.equal(episode?.durationMs, 180_800);
  assert.equal(episode?.contentWarning, undefined);
  assert.deepEqual(episode?.transcript, OPEN_TAB_EP1.transcript);
});

test("open tab audio file is shipped in public/audio", () => {
  assert.equal(
    existsSync(join(process.cwd(), "public/audio/open-tab-ep1.mp3")),
    true,
  );
});

test("demo lobby-ep1 remains a separate catalog entry", () => {
  const demo = getPodcastEpisode("lobby-ep1");
  const news = getPodcastEpisode("news-ep1");
  assert.ok(demo);
  assert.ok(news);
  assert.equal(demo?.audioUrl, "/audio/demo-episode.mp3");
  assert.equal(news?.audioUrl, "/audio/open-tab-ep1.mp3");
  assert.notEqual(demo?.roomSlug, news?.roomSlug);
  assert.equal(demo?.title, DEMO_EPISODE.title);
});

test("content warnings are sanitized as plain text", () => {
  assert.equal(
    sanitizeTranscriptText("Flash <b>strobe</b> <script>x</script>"),
    "Flash strobe",
  );
  const prepared = prepareCatalogEpisode({
    ...DEMO_EPISODE,
    contentWarning: "Strobe <b>lights</b>",
  });
  assert.equal(prepared?.contentWarning, "Strobe lights");
});

test("official https embeds with an in-repo transcript are allowed", () => {
  const prepared = prepareCatalogEpisode({
    ...DEMO_EPISODE,
    roomSlug: "embed-demo",
    media: {
      kind: "official-embed",
      provider: "example",
      src: "https://example.com/embed/1",
    },
    audioUrl: "https://example.com/embed/1",
  });
  assert.ok(prepared);
  assert.equal(prepared?.media.kind, "official-embed");
  assert.equal(prepared?.audioUrl, "https://example.com/embed/1");
});

test("http embeds, upload paths, and empty transcripts are rejected", () => {
  assert.equal(
    prepareCatalogEpisode({
      ...DEMO_EPISODE,
      media: {
        kind: "official-embed",
        provider: "x",
        src: "http://example.com/e",
      },
      audioUrl: "http://example.com/e",
    }),
    null,
  );
  assert.equal(
    prepareCatalogEpisode({
      ...DEMO_EPISODE,
      media: { kind: "file", src: "/uploads/user.mp3" },
      audioUrl: "/uploads/user.mp3",
    }),
    null,
  );
  assert.equal(
    prepareCatalogEpisode({
      ...DEMO_EPISODE,
      transcript: [],
    }),
    null,
  );
});

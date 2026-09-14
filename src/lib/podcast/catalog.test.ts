import { getPodcastEpisode } from "./catalog";
import { test } from "node:test";
import assert from "node:assert/strict";

test("demo podcast episode is in the catalog as lobby-ep1", () => {
  const episode = getPodcastEpisode("lobby-ep1");
  assert.ok(episode);
  assert.equal(episode?.language, "en");
  assert.equal(episode?.audioUrl.startsWith("/audio/"), true);
  assert.ok((episode?.transcript.length ?? 0) > 0);
  assert.ok(episode?.transcript.every((cue) => cue.text && !cue.text.includes("<script")));
});

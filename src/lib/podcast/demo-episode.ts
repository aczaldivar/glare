import type { PodcastEpisode } from "./types";

/**
 * Original English demo copy. Not a real show. Synthetic audio lives at
 * public/audio/demo-episode.mp3 (generated tones, royalty-free).
 */
export const DEMO_EPISODE: PodcastEpisode = {
  roomSlug: "lobby-ep1",
  title: "Walk In — Glare Room demo",
  description:
    "A short English demo of a podcast room: listen, read the transcript, and talk about the episode in live chat.",
  audioUrl: "/audio/demo-episode.mp3",
  durationMs: 72_000,
  language: "en",
  transcript: [
    {
      id: "c1",
      startMs: 0,
      endMs: 6_000,
      text: "Welcome to Walk In, a Glare Room demo. This is not a real podcast. It is a sample episode so you can try the room.",
    },
    {
      id: "c2",
      startMs: 6_000,
      endMs: 12_000,
      text: "A podcast room pairs audio with a full transcript. The transcript is first-class. Chat is where you discuss it.",
    },
    {
      id: "c3",
      startMs: 12_000,
      endMs: 18_000,
      text: "Anyone with the link can walk in. There are no accounts. Rooms are public, so do not treat this as a private messenger.",
    },
    {
      id: "c4",
      startMs: 18_000,
      endMs: 24_000,
      text: "If you cite a line from the episode, quote it from the transcript. Do not paste markup or dump the whole script.",
    },
    {
      id: "c5",
      startMs: 24_000,
      endMs: 30_000,
      text: "Glare Room is for ages thirteen and up. We show that notice. We do not verify age.",
    },
    {
      id: "c6",
      startMs: 30_000,
      endMs: 36_000,
      text: "No illegal content. Harassment, exploitation, and abuse are not allowed. We may hide messages or remove rooms.",
    },
    {
      id: "c7",
      startMs: 36_000,
      endMs: 42_000,
      text: "This demo is English-only. v1 does not take user audio or transcript uploads. Episodes are curated in the catalog.",
    },
    {
      id: "c8",
      startMs: 42_000,
      endMs: 48_000,
      text: "Click a transcript line to seek the player. Use Quote to drop that line into chat so people know what you mean.",
    },
    {
      id: "c9",
      startMs: 48_000,
      endMs: 54_000,
      text: "On a phone, the mini player stays up top. Switch between Transcript and Chat. The transcript is the default tab.",
    },
    {
      id: "c10",
      startMs: 54_000,
      endMs: 60_000,
      text: "On a wide screen, the player stays sticky. Transcript and chat sit side by side so you can read and talk at once.",
    },
    {
      id: "c11",
      startMs: 60_000,
      endMs: 66_000,
      text: "Share the room URL if you want someone else in the discussion. They will see the same episode and the live thread.",
    },
    {
      id: "c12",
      startMs: 66_000,
      endMs: 72_000,
      text: "That is the demo. Be decent with the people who walk in. Thanks for listening to Walk In.",
    },
  ],
};

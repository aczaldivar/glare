import type { PodcastEpisode } from "./types";

/**
 * Counsel APPROVE 2026-09-16 — Open Tab Ep. 1 for room `news-ep1`
 * (bar `news_culture`). Curated Glare original; not user-submitted.
 * Audio lives at public/audio/open-tab-ep1.mp3.
 * Cue startMs/endMs come from the Counsel packet and are contiguous
 * (endMs[i] === startMs[i+1]) so timeupdate highlight/follow-scroll
 * tracks the spoken line the same way as lobby-ep1. Spot-checked
 * against the MP3 at beginning, middle, and end. Demo `lobby-ep1`
 * remains a separate catalog entry.
 */
export const OPEN_TAB_EP1: PodcastEpisode = {
  roomSlug: "news-ep1",
  title: "Open Tab — Ep. 1: What Stuck",
  description:
    "A short culture beat on what actually stuck this week — not what merely trended. Listen, read the transcript, and talk about it in live chat.",
  media: { kind: "file", src: "/audio/open-tab-ep1.mp3" },
  audioUrl: "/audio/open-tab-ep1.mp3",
  durationMs: 180_800,
  language: "en",
  transcript: [
    {
      id: "c1",
      startMs: 100,
      endMs: 8050,
      text: "Welcome to Open Tab. This is a short Glare Room original — a culture beat you can talk about live in chat while you listen.",
    },
    {
      id: "c2",
      startMs: 8050,
      endMs: 16150,
      text: "Today’s question is simple on purpose: what piece of culture actually stuck with you this week? Not what trended for an hour.",
    },
    {
      id: "c3",
      startMs: 16150,
      endMs: 19000,
      text: "Not the thumbnail you forgot by lunch.",
    },
    {
      id: "c4",
      startMs: 19000,
      endMs: 28700,
      text: "The song, clip, essay, joke, show moment, or game scene that stayed in your head after you put the phone down. That distinction matters.",
    },
    {
      id: "c5",
      startMs: 28700,
      endMs: 37912,
      text: "A lot of the internet is built to make you react once and move on. Rooms like this are built for the second thought — the thing that still feels true tomorrow.",
    },
    {
      id: "c6",
      startMs: 37912,
      endMs: 46937,
      text: "Culture that sticks usually does one of three jobs. First, it names a feeling you already had, but cleaner than you could say it yourself.",
    },
    {
      id: "c7",
      startMs: 46937,
      endMs: 51525,
      text: "Second, it surprises you without humiliating anyone for sport.",
    },
    {
      id: "c8",
      startMs: 51525,
      endMs: 59562,
      text: "Third, it gives you a clean line you can quote to a friend without needing a twenty-minute setup. You know the opposite feeling too.",
    },
    {
      id: "c9",
      startMs: 59562,
      endMs: 68787,
      text: "The hot take that is loud at noon and gone by dinner. The pile-on that feels like community until you notice nobody is actually saying anything new.",
    },
    {
      id: "c10",
      startMs: 68787,
      endMs: 77962,
      text: "That noise can be entertaining. It is a weak foundation for a conversation you want to keep. Think about your own week for a second.",
    },
    {
      id: "c11",
      startMs: 77962,
      endMs: 87787,
      text: "Was there a chorus you replayed on purpose? A scene you described to someone in the kitchen? A paragraph you screenshotted not to perform, but to keep?",
    },
    {
      id: "c12",
      startMs: 87787,
      endMs: 97100,
      text: "Those are sticky signals. They are often quieter than the viral chart, and more useful in a room. So here is how to use this room.",
    },
    {
      id: "c13",
      startMs: 97100,
      endMs: 102237,
      text: "Name one thing that stuck for you this week. One line is enough.",
    },
    {
      id: "c14",
      startMs: 102237,
      endMs: 108725,
      text: "If you want, add why it stuck — a feeling, a line, a craft detail, a memory it unlocked.",
    },
    {
      id: "c15",
      startMs: 108725,
      endMs: 117362,
      text: "If someone else’s pick is not your taste, say so without the pile-on. Argue the idea. Leave the person standing.",
    },
    {
      id: "c16",
      startMs: 117362,
      endMs: 126275,
      text: "If you cite a line from this episode, use the transcript Quote button so people can see what you mean. Short quotes for commentary are welcome.",
    },
    {
      id: "c17",
      startMs: 126275,
      endMs: 135237,
      text: "Do not paste the whole transcript into the room. Do not treat this chat like a private messenger. Anyone with the link can walk in.",
    },
    {
      id: "c18",
      startMs: 135237,
      endMs: 142337,
      text: "A soft note on tone. Disagreement is part of culture talk. Harassment is not.",
    },
    {
      id: "c19",
      startMs: 142337,
      endMs: 149962,
      text: "Glare Room is for ages thirteen and up. We show that notice. We do not verify age.",
    },
    {
      id: "c20",
      startMs: 149962,
      endMs: 156662,
      text: "Mute, block, or report if you need space. Be the kind of guest you’d want sitting next to you.",
    },
    {
      id: "c21",
      startMs: 156662,
      endMs: 166450,
      text: "If nothing “big” stuck this week, that counts too. Say what almost stuck, or what you wish had stuck, or what you keep returning to from an older week.",
    },
    {
      id: "c22",
      startMs: 166450,
      endMs: 175787,
      text: "The point is not to win the internet. The point is to leave a usable take for the next person who walks in. That is Open Tab for today.",
    },
    {
      id: "c23",
      startMs: 175787,
      endMs: 180725,
      text: "Leave the tab open. Tell us what stuck — and why it stayed.",
    },
  ],
};

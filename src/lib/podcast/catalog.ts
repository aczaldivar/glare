import { DEMO_EPISODE } from "./demo-episode";
import { sanitizeTranscriptText } from "./sanitize";
import type { PodcastEpisode } from "./types";

const RAW_CATALOG: PodcastEpisode[] = [DEMO_EPISODE];

function sanitizeEpisode(episode: PodcastEpisode): PodcastEpisode {
  return {
    ...episode,
    title: sanitizeTranscriptText(episode.title),
    description: sanitizeTranscriptText(episode.description),
    contentWarning: episode.contentWarning
      ? sanitizeTranscriptText(episode.contentWarning)
      : undefined,
    transcript: episode.transcript.map((cue) => ({
      ...cue,
      text: sanitizeTranscriptText(cue.text),
    })),
  };
}

const CATALOG = RAW_CATALOG.map(sanitizeEpisode);

export function listPodcastEpisodes() {
  return CATALOG;
}

export function getPodcastEpisode(roomSlug: string) {
  return CATALOG.find((episode) => episode.roomSlug === roomSlug) ?? null;
}

export function isPodcastRoom(roomSlug: string) {
  return Boolean(getPodcastEpisode(roomSlug));
}

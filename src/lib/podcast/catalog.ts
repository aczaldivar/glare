import { DEMO_EPISODE } from "./demo-episode";
import { sanitizeTranscriptText } from "./sanitize";
import {
  curatedFileSrc,
  isCuratedAudioPath,
  type PodcastEpisode,
} from "./types";

/**
 * Counsel v1: curated catalog only. No upload API, no user-submitted
 * audio or transcripts. Entries must be in-repo /audio files or an
 * official embed. Prefer shipping the file in-repo (see DEMO_EPISODE).
 */
const RAW_CATALOG: PodcastEpisode[] = [DEMO_EPISODE];

function isAllowedMedia(episode: PodcastEpisode) {
  if (episode.media.kind === "file") {
    return isCuratedAudioPath(episode.media.src);
  }
  if (episode.media.kind === "official-embed") {
    try {
      const url = new URL(episode.media.src);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }
  return false;
}

function sanitizeEpisode(episode: PodcastEpisode): PodcastEpisode | null {
  if (!isAllowedMedia(episode)) return null;
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

const CATALOG = RAW_CATALOG.map(sanitizeEpisode).filter(
  (episode): episode is PodcastEpisode => Boolean(episode),
);

export function listPodcastEpisodes() {
  return CATALOG;
}

export function getPodcastEpisode(roomSlug: string) {
  return CATALOG.find((episode) => episode.roomSlug === roomSlug) ?? null;
}

export function isPodcastRoom(roomSlug: string) {
  return Boolean(getPodcastEpisode(roomSlug));
}

export { curatedFileSrc };

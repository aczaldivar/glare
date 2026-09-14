/**
 * v1 Counsel constraints:
 * - Rights-clear curated files in /audio/, or official embeds only
 * - No user audio/transcript uploads
 * - Prefer in-repo demo files over embeds
 */
export type CuratedFileMedia = {
  kind: "file";
  src: string;
};

export type OfficialEmbedMedia = {
  kind: "official-embed";
  provider: string;
  src: string;
};

export type PodcastMedia = CuratedFileMedia | OfficialEmbedMedia;

export type TranscriptCue = {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
};

export type PodcastEpisode = {
  roomSlug: string;
  title: string;
  description: string;
  media: PodcastMedia;
  durationMs: number;
  language: "en";
  contentWarning?: string;
  transcript: TranscriptCue[];
};

export function isCuratedAudioPath(src: string) {
  return (
    src.startsWith("/audio/") &&
    !src.includes("..") &&
    !src.includes("//") &&
    !src.includes("\\")
  );
}

/** v1 playback is same-origin curated files. Official embeds are catalog-only until wired. */
export function curatedFileSrc(episode: PodcastEpisode) {
  if (episode.media.kind !== "file") return null;
  if (!isCuratedAudioPath(episode.media.src)) return null;
  return episode.media.src;
}

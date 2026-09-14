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
  audioUrl: string;
  durationMs: number;
  language: "en";
  contentWarning?: string;
  transcript: TranscriptCue[];
};

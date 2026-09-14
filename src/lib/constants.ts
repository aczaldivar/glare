export const APP_NAME = "Glare Room";
export const APP_SHORT_NAME = "Glareroom";
export const DEFAULT_SITE_URL = "https://glareroom.vercel.app";

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_NAME_LENGTH = 24;
export const MIN_NAME_LENGTH = 1;
export const MIN_ROOM_LENGTH = 2;
export const MAX_ROOM_LENGTH = 32;

export const RATE_LIMIT_WINDOW_MS = 10_000;
export const RATE_LIMIT_MAX_MESSAGES = 8;
export const MIN_MESSAGE_INTERVAL_MS = 400;

export const HISTORY_LIMIT = 80;
export const PRESENCE_TTL_MS = 45_000;
export const PRESENCE_HEARTBEAT_MS = 15_000;

export const SUGGESTED_ROOMS = [
  { slug: "lobby", label: "Lobby", blurb: "The front door" },
  { slug: "afterhours", label: "Afterhours", blurb: "Late light" },
  { slug: "studio", label: "Studio", blurb: "Work in public" },
  { slug: "rooftop", label: "Rooftop", blurb: "Open air" },
] as const;

export const RESERVED_ROOM_SLUGS = new Set([
  "api",
  "r",
  "www",
  "admin",
  "static",
  "assets",
  "health",
  "favicon",
  "robots",
  "sitemap",
  "_next",
  "next",
  "null",
  "undefined",
]);

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DEFAULT_SITE_URL;
}

export function ablyChannelName(room: string) {
  return `glare:room:${room}`;
}

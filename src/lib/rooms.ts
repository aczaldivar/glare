import {
  MAX_ROOM_LENGTH,
  MIN_ROOM_LENGTH,
  RESERVED_ROOM_SLUGS,
} from "@/lib/constants";

export function slugifyRoom(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_ROOM_LENGTH)
    .replace(/-+$/g, "");
}

export function isValidRoomSlug(slug: string): boolean {
  if (slug.length < MIN_ROOM_LENGTH || slug.length > MAX_ROOM_LENGTH) {
    return false;
  }
  if (RESERVED_ROOM_SLUGS.has(slug)) return false;
  if (slug.includes("--")) return false;
  return /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(slug);
}

export function roomPath(slug: string) {
  return `/r/${slug}`;
}

export function roomDisplayName(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

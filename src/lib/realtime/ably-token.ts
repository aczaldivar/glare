import type { TokenParams } from "ably";
import { ablyChannelName, ABLY_TOKEN_TTL_MS } from "@/lib/constants";
import { isValidRoomSlug } from "@/lib/rooms";

export function parseTokenRoom(raw: string | null | undefined) {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  if (slug.includes("*") || slug.includes(":") || slug.includes("/")) return null;
  if (!isValidRoomSlug(slug)) return null;
  return slug;
}

export function ablyClientTokenParams(room: string, clientId: string): TokenParams {
  const channel = ablyChannelName(room);
  return {
    clientId,
    ttl: ABLY_TOKEN_TTL_MS,
    capability: {
      [channel]: ["subscribe", "presence"],
    },
  };
}

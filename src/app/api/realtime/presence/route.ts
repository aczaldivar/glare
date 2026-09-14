import { NextRequest } from "next/server";
import { colorFromId, validateDisplayName } from "@/lib/identity";
import { isUuid } from "@/lib/messages";
import {
  currentMembers,
  leavePresence,
  upsertPresence,
} from "@/lib/realtime/bus";
import { getRealtimeProvider } from "@/lib/realtime/provider";
import { isValidRoomSlug, slugifyRoom } from "@/lib/rooms";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (getRealtimeProvider() !== "local") {
    return Response.json(
      { error: "Local presence is only available in single-process mode." },
      { status: 501 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { room, id, name, action } = body as Record<string, unknown>;
  const slug = typeof room === "string" ? slugifyRoom(room) : "";
  if (!isValidRoomSlug(slug)) {
    return Response.json({ error: "Invalid room." }, { status: 400 });
  }
  if (typeof id !== "string" || !isUuid(id)) {
    return Response.json({ error: "A valid id is required." }, { status: 400 });
  }

  if (action === "leave") {
    leavePresence(slug, id);
    return Response.json({ members: currentMembers(slug) });
  }

  const nameResult =
    typeof name === "string"
      ? validateDisplayName(name)
      : { ok: false as const, error: "A display name is required." };
  if (!nameResult.ok) {
    return Response.json({ error: nameResult.error }, { status: 400 });
  }

  upsertPresence(slug, {
    id,
    name: nameResult.name,
    color: colorFromId(id),
  });

  return Response.json({ members: currentMembers(slug) });
}

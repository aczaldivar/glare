import { NextRequest } from "next/server";
import { rejectIfEntryDenied, rejectNonBrowserWrite } from "@/lib/bot-guard";
import { validateDisplayName } from "@/lib/identity";
import { isUuid, validateMessageText } from "@/lib/messages";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";
import { publishMessage } from "@/lib/realtime/publish";
import { isValidRoomSlug, slugifyRoom } from "@/lib/rooms";
import type { ChatMessage } from "@/lib/realtime/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const blocked = rejectNonBrowserWrite(request);
  if (blocked) return blocked;
  const denied = rejectIfEntryDenied(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { room, authorId, authorName, text, clientNonce } = body as Record<
    string,
    unknown
  >;

  const slug = typeof room === "string" ? slugifyRoom(room) : "";
  if (!isValidRoomSlug(slug)) {
    return Response.json({ error: "That room name is not allowed." }, { status: 400 });
  }

  if (typeof authorId !== "string" || !isUuid(authorId)) {
    return Response.json({ error: "A valid author id is required." }, { status: 400 });
  }

  const nameResult =
    typeof authorName === "string"
      ? validateDisplayName(authorName)
      : { ok: false as const, error: "A display name is required." };
  if (!nameResult.ok) {
    return Response.json({ error: nameResult.error }, { status: 400 });
  }

  if (typeof text !== "string") {
    return Response.json({ error: "Message text is required." }, { status: 400 });
  }
  const textResult = validateMessageText(text);
  if (!textResult.ok) {
    return Response.json({ error: textResult.error }, { status: 400 });
  }

  const nonce =
    typeof clientNonce === "string" && isUuid(clientNonce)
      ? clientNonce
      : undefined;

  const limited = await hitRateLimit(`${clientIp(request)}:${slug}`);
  if (!limited.ok) {
    return Response.json(
      { error: "Easy — wait a beat before sending another." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000) || 1),
        },
      },
    );
  }

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    room: slug,
    authorId,
    authorName: nameResult.name,
    text: textResult.text,
    createdAt: Date.now(),
    clientNonce: nonce,
  };

  try {
    await publishMessage(message);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Publish failed.";
    return Response.json({ error: detail }, { status: 503 });
  }

  return Response.json({ message });
}

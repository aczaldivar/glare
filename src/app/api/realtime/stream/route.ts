import { NextRequest } from "next/server";
import {
  currentHistory,
  currentMembers,
  subscribeRoom,
} from "@/lib/realtime/bus";
import { getRealtimeProvider } from "@/lib/realtime/provider";
import { isValidRoomSlug, slugifyRoom } from "@/lib/rooms";
import type { BusEvent } from "@/lib/realtime/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (getRealtimeProvider() !== "local") {
    return Response.json(
      { error: "Local realtime is only available in single-process mode." },
      { status: 501 },
    );
  }

  const room = slugifyRoom(request.nextUrl.searchParams.get("room") ?? "");
  if (!isValidRoomSlug(room)) {
    return Response.json({ error: "Invalid room." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let ping: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: BusEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        } catch {
          // stream already closed
        }
      };

      send({ type: "history", messages: currentHistory(room) });
      send({ type: "presence", members: currentMembers(room) });
      unsubscribe = subscribeRoom(room, send);
      ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // stream already closed
        }
      }, 15000);
    },
    cancel() {
      if (ping) clearInterval(ping);
      unsubscribe();
    },
  });

  request.signal.addEventListener("abort", () => {
    if (ping) clearInterval(ping);
    unsubscribe();
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

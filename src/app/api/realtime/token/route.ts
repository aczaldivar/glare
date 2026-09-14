import { NextRequest } from "next/server";
import {
  TOKEN_RATE_LIMIT_MAX,
  TOKEN_RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";
import { isUuid } from "@/lib/messages";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";
import { getAblyRest } from "@/lib/realtime/ably-server";
import { ablyClientTokenParams, parseTokenRoom } from "@/lib/realtime/ably-token";
import { getRealtimeProvider } from "@/lib/realtime/provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limited = await consumeRateLimit(`token:${clientIp(request)}`, {
    windowMs: TOKEN_RATE_LIMIT_WINDOW_MS,
    max: TOKEN_RATE_LIMIT_MAX,
  });
  if (!limited.ok) {
    return Response.json(
      { error: "Too many token requests. Wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000) || 1),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (getRealtimeProvider() !== "ably") {
    return Response.json(
      { error: "Ably is not configured." },
      { status: 501, headers: { "Cache-Control": "no-store" } },
    );
  }

  const clientId = request.nextUrl.searchParams.get("clientId")?.trim() ?? "";
  if (!isUuid(clientId)) {
    return Response.json(
      { error: "A valid clientId is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const room = parseTokenRoom(request.nextUrl.searchParams.get("room"));
  if (!room) {
    return Response.json(
      { error: "A valid room is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rest = getAblyRest();
  const tokenRequest = await rest.auth.createTokenRequest(
    ablyClientTokenParams(room, clientId),
  );

  return Response.json(tokenRequest, {
    headers: { "Cache-Control": "no-store" },
  });
}

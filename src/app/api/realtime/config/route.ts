import { NextRequest } from "next/server";
import {
  cookieValue,
  getBotGuardMode,
  HUMAN_SESSION_COOKIE,
  turnstileSiteKey,
  verifyHumanSession,
} from "@/lib/bot-guard";
import { getRealtimeProvider } from "@/lib/realtime/provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const botGuard = getBotGuardMode();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
  const verified =
    botGuard === "turnstile" &&
    verifyHumanSession(cookieValue(HUMAN_SESSION_COOKIE, request.headers.get("cookie")), {
      secret,
    });

  return Response.json(
    {
      provider: getRealtimeProvider(),
      botGuard,
      verified,
      turnstileSiteKey: turnstileSiteKey(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

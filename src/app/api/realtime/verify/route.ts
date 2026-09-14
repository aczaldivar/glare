import { NextRequest } from "next/server";
import {
  evaluateEntryGuard,
  getBotGuardMode,
  honeypotFilled,
  HUMAN_CHECK_REQUIRED_MESSAGE,
  humanSessionCookieHeader,
  mintHumanSession,
  MISSING_TURNSTILE_MESSAGE,
  rejectNonBrowserWrite,
  verifyTurnstileToken,
} from "@/lib/bot-guard";
import {
  HONEYPOT_FIELD,
  HUMAN_SESSION_TTL_MS,
  VERIFY_RATE_LIMIT_MAX,
  VERIFY_RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  const blocked = rejectNonBrowserWrite(request);
  if (blocked) return blocked;

  const limited = await consumeRateLimit(`verify:${clientIp(request)}`, {
    windowMs: VERIFY_RATE_LIMIT_WINDOW_MS,
    max: VERIFY_RATE_LIMIT_MAX,
  });
  if (!limited.ok) {
    return Response.json(
      { error: "Too many checks. Wait a moment and try again." },
      {
        status: 429,
        headers: {
          ...noStore,
          "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000) || 1),
        },
      },
    );
  }

  const mode = getBotGuardMode();
  if (mode === "missing") {
    return Response.json(
      { error: MISSING_TURNSTILE_MESSAGE },
      { status: 501, headers: noStore },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400, headers: noStore });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: noStore });
  }

  const payload = body as Record<string, unknown>;
  if (honeypotFilled(payload[HONEYPOT_FIELD])) {
    return Response.json({ error: "Could not enter." }, { status: 400, headers: noStore });
  }

  if (mode === "off") {
    return Response.json({ ok: true, verified: false }, { headers: noStore });
  }

  const existing = evaluateEntryGuard(request);
  if (existing.ok && existing.refreshToken) {
    return Response.json(
      { ok: true, verified: true },
      {
        headers: {
          ...noStore,
          "Set-Cookie": humanSessionCookieHeader(existing.refreshToken, {
            maxAgeMs: HUMAN_SESSION_TTL_MS,
          }),
        },
      },
    );
  }

  const token = typeof payload.token === "string" ? payload.token.trim() : "";
  const checked = await verifyTurnstileToken(token, { ip: clientIp(request) });
  if (!checked.ok) {
    if (checked.unavailable) {
      return Response.json(
        { error: "Could not complete the check. Try again." },
        { status: 503, headers: noStore },
      );
    }
    return Response.json(
      { error: HUMAN_CHECK_REQUIRED_MESSAGE },
      { status: 403, headers: noStore },
    );
  }

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";
  const session = mintHumanSession({ secret });
  return Response.json(
    { ok: true, verified: true },
    {
      headers: {
        ...noStore,
        "Set-Cookie": humanSessionCookieHeader(session, { maxAgeMs: HUMAN_SESSION_TTL_MS }),
      },
    },
  );
}

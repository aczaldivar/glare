import { createHmac, timingSafeEqual } from "node:crypto";
import {
  HUMAN_SESSION_COOKIE,
  HUMAN_SESSION_TTL_MS,
  TURNSTILE_MAX_TOKEN_LENGTH,
  TURNSTILE_SITEVERIFY_URL,
} from "@/lib/constants";
import { honeypotFilled } from "@/lib/honeypot";
import type { BotGuardMode } from "@/lib/realtime/types";

export type { BotGuardMode };

export type BotGuardEnv = {
  VERCEL?: string | undefined;
  TURNSTILE_SECRET_KEY?: string | undefined;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string | undefined;
  [key: string]: string | undefined;
};

export type EntryGuardResult =
  | { ok: true; refreshToken?: string }
  | { ok: false; status: number; error: string };

export { HUMAN_SESSION_COOKIE, honeypotFilled };

export const MISSING_TURNSTILE_MESSAGE =
  "Turnstile is not configured on this deploy. Add TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY.";

export const HUMAN_CHECK_REQUIRED_MESSAGE =
  "Complete the check to enter the room.";

export const NON_BROWSER_WRITE_MESSAGE =
  "This request must come from the app.";

export function botGuardModeFrom(env: BotGuardEnv): BotGuardMode {
  const site = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const secret = env.TURNSTILE_SECRET_KEY?.trim();
  if (site && secret) return "turnstile";
  if (env.VERCEL?.trim()) return "missing";
  return "off";
}

export function getBotGuardMode(): BotGuardMode {
  return botGuardModeFrom(process.env as BotGuardEnv);
}

export function turnstileSiteKeyFrom(env: BotGuardEnv): string | null {
  if (botGuardModeFrom(env) !== "turnstile") return null;
  return env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export function turnstileSiteKey(): string | null {
  return turnstileSiteKeyFrom(process.env as BotGuardEnv);
}

function originHost(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.host;
  } catch {
    return null;
  }
}

export function sameOriginWriteAllowed(request: Request): boolean {
  const host = request.headers.get("host")?.trim();
  if (!host) return false;

  const originHeader = request.headers.get("origin")?.trim();
  if (originHeader) {
    if (originHeader === "null") return false;
    const origin = originHost(originHeader);
    if (!origin || origin !== host) return false;
  } else {
    const referer = request.headers.get("referer")?.trim();
    if (!referer) return false;
    const refererHost = originHost(referer);
    if (!refererHost || refererHost !== host) return false;
  }

  const site = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (site === "cross-site") return false;
  return true;
}

type SessionPayload = {
  v: 1;
  iat: number;
  exp: number;
};

function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function mintHumanSession({
  now = Date.now(),
  ttlMs = HUMAN_SESSION_TTL_MS,
  secret,
}: {
  now?: number;
  ttlMs?: number;
  secret: string;
}): string {
  const payload: SessionPayload = { v: 1, iat: now, exp: now + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function verifyHumanSession(
  token: string | null | undefined,
  {
    now = Date.now(),
    secret,
  }: {
    now?: number;
    secret: string;
  },
): boolean {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!body || !signature) return false;
  if (!signaturesMatch(signature, sign(body, secret))) return false;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return false;
  }
  if (payload?.v !== 1) return false;
  if (!Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)) return false;
  if (payload.exp <= now) return false;
  if (payload.iat > now + 5_000) return false;
  return true;
}

export function cookieValue(name: string, header: string | null | undefined): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) === name) {
      return trimmed.slice(eq + 1);
    }
  }
  return undefined;
}

export function humanSessionCookieHeader(
  value: string,
  {
    maxAgeMs = HUMAN_SESSION_TTL_MS,
    secure = Boolean(process.env.VERCEL),
  }: {
    maxAgeMs?: number;
    secure?: boolean;
  } = {},
): string {
  const parts = [
    `${HUMAN_SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(1, Math.floor(maxAgeMs / 1000))}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function evaluateEntryGuard(
  request: Request,
  {
    now = Date.now(),
    mode = getBotGuardMode(),
    secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "",
  }: {
    now?: number;
    mode?: BotGuardMode;
    secret?: string;
  } = {},
): EntryGuardResult {
  if (mode === "off") return { ok: true };
  if (mode === "missing") {
    return { ok: false, status: 501, error: MISSING_TURNSTILE_MESSAGE };
  }
  const token = cookieValue(HUMAN_SESSION_COOKIE, request.headers.get("cookie"));
  if (!verifyHumanSession(token, { now, secret })) {
    return { ok: false, status: 403, error: HUMAN_CHECK_REQUIRED_MESSAGE };
  }
  return { ok: true, refreshToken: mintHumanSession({ now, secret }) };
}

export function rejectNonBrowserWrite(request: Request): Response | null {
  if (sameOriginWriteAllowed(request)) return null;
  return Response.json(
    { error: NON_BROWSER_WRITE_MESSAGE },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

export function rejectIfEntryDenied(
  request: Request,
  options?: Parameters<typeof evaluateEntryGuard>[1],
): Response | null {
  const result = evaluateEntryGuard(request, options);
  if (result.ok) return null;
  return Response.json(
    { error: result.error },
    { status: result.status, headers: { "Cache-Control": "no-store" } },
  );
}

type SiteverifyResponse = {
  success?: boolean;
};

export async function verifyTurnstileToken(
  token: string,
  {
    ip,
    secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "",
    fetchImpl = fetch,
  }: {
    ip?: string;
    secret?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<{ ok: true } | { ok: false; unavailable?: boolean }> {
  if (!secret) return { ok: false };
  if (!token || token.length > TURNSTILE_MAX_TOKEN_LENGTH) return { ok: false };

  try {
    const response = await fetchImpl(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        ...(ip && ip !== "local" ? { remoteip: ip } : {}),
      }),
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, unavailable: true };
    const payload = (await response.json()) as SiteverifyResponse;
    if (payload.success === true) return { ok: true };
    return { ok: false };
  } catch {
    return { ok: false, unavailable: true };
  }
}

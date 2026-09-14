import assert from "node:assert/strict";
import { test } from "node:test";
import {
  botGuardModeFrom,
  cookieValue,
  evaluateEntryGuard,
  honeypotFilled,
  HUMAN_SESSION_COOKIE,
  humanSessionCookieHeader,
  mintHumanSession,
  sameOriginWriteAllowed,
  turnstileSiteKeyFrom,
  verifyHumanSession,
  verifyTurnstileToken,
} from "./bot-guard";

test("bot guard is off locally without Turnstile keys", () => {
  assert.equal(botGuardModeFrom({}), "off");
  assert.equal(
    botGuardModeFrom({
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site",
    }),
    "off",
  );
  assert.equal(turnstileSiteKeyFrom({}), null);
});

test("bot guard requires both Turnstile keys when they are set", () => {
  const env = {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
    TURNSTILE_SECRET_KEY: "secret-key",
  };
  assert.equal(botGuardModeFrom(env), "turnstile");
  assert.equal(turnstileSiteKeyFrom(env), "site-key");
});

test("bot guard fails closed on Vercel when Turnstile keys are missing", () => {
  assert.equal(botGuardModeFrom({ VERCEL: "1" }), "missing");
  assert.equal(
    botGuardModeFrom({
      VERCEL: "1",
      TURNSTILE_SECRET_KEY: "only-secret",
    }),
    "missing",
  );
});

test("honeypotFilled is false for empty values and true when a bot typed something", () => {
  assert.equal(honeypotFilled(undefined), false);
  assert.equal(honeypotFilled(null), false);
  assert.equal(honeypotFilled(""), false);
  assert.equal(honeypotFilled("   "), false);
  assert.equal(honeypotFilled("https://spam.example"), true);
  assert.equal(honeypotFilled(1), true);
});

test("sameOriginWriteAllowed accepts same-host Origin and rejects odd callers", () => {
  const host = "glareroom.vercel.app";

  assert.equal(
    sameOriginWriteAllowed(
      new Request("https://glareroom.vercel.app/api/realtime/messages", {
        method: "POST",
        headers: {
          host,
          origin: "https://glareroom.vercel.app",
          "sec-fetch-site": "same-origin",
        },
      }),
    ),
    true,
  );

  assert.equal(
    sameOriginWriteAllowed(
      new Request("https://glareroom.vercel.app/api/realtime/messages", {
        method: "POST",
        headers: {
          host,
          referer: "https://glareroom.vercel.app/r/lobby",
        },
      }),
    ),
    true,
  );

  assert.equal(
    sameOriginWriteAllowed(
      new Request("https://glareroom.vercel.app/api/realtime/messages", {
        method: "POST",
        headers: { host },
      }),
    ),
    false,
  );

  assert.equal(
    sameOriginWriteAllowed(
      new Request("https://glareroom.vercel.app/api/realtime/messages", {
        method: "POST",
        headers: {
          host,
          origin: "https://evil.example",
        },
      }),
    ),
    false,
  );

  assert.equal(
    sameOriginWriteAllowed(
      new Request("https://glareroom.vercel.app/api/realtime/messages", {
        method: "POST",
        headers: {
          host,
          origin: "null",
        },
      }),
    ),
    false,
  );

  assert.equal(
    sameOriginWriteAllowed(
      new Request("https://glareroom.vercel.app/api/realtime/messages", {
        method: "POST",
        headers: {
          host,
          origin: "https://glareroom.vercel.app",
          "sec-fetch-site": "cross-site",
        },
      }),
    ),
    false,
  );
});

test("human session cookie round-trips and rejects tampering or expiry", () => {
  const secret = "test-secret-value";
  const now = 1_700_000_000_000;
  const token = mintHumanSession({ now, secret, ttlMs: 60_000 });

  assert.equal(verifyHumanSession(token, { now, secret }), true);
  assert.equal(verifyHumanSession(token, { now: now + 59_000, secret }), true);
  assert.equal(verifyHumanSession(token, { now: now + 60_000, secret }), false);
  assert.equal(verifyHumanSession(token, { now, secret: "other-secret" }), false);
  assert.equal(verifyHumanSession(`${token}x`, { now, secret }), false);
  assert.equal(verifyHumanSession("not-a-token", { now, secret }), false);
  assert.equal(verifyHumanSession("", { now, secret }), false);

  const [body] = token.split(".");
  const tampered = mintHumanSession({ now, secret: "other-secret" });
  const swapped = `${body}.${tampered.split(".")[1]}`;
  assert.equal(verifyHumanSession(swapped, { now, secret }), false);
});

test("evaluateEntryGuard allows local off mode and requires a valid session for Turnstile", () => {
  const request = new Request("http://localhost:3000/api/realtime/token");
  assert.equal(evaluateEntryGuard(request, { mode: "off" }).ok, true);

  const missing = evaluateEntryGuard(request, { mode: "missing" });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.status, 501);

  const secret = "session-secret";
  const now = 1_800_000_000_000;
  const denied = evaluateEntryGuard(request, { mode: "turnstile", secret, now });
  assert.equal(denied.ok, false);
  if (!denied.ok) assert.equal(denied.status, 403);

  const cookie = mintHumanSession({ now, secret });
  const allowed = evaluateEntryGuard(
    new Request("http://localhost:3000/api/realtime/token", {
      headers: { cookie: `${HUMAN_SESSION_COOKIE}=${cookie}` },
    }),
    { mode: "turnstile", secret, now },
  );
  assert.equal(allowed.ok, true);
  if (allowed.ok) assert.equal(typeof allowed.refreshToken, "string");
});

test("cookieValue reads the named cookie among others", () => {
  assert.equal(
    cookieValue(HUMAN_SESSION_COOKIE, `other=1; ${HUMAN_SESSION_COOKIE}=abc; theme=dark`),
    "abc",
  );
  assert.equal(cookieValue(HUMAN_SESSION_COOKIE, "other=1"), undefined);
});

test("human session Set-Cookie is httpOnly, Lax, and not Secure by default", () => {
  const header = humanSessionCookieHeader("token-value", { secure: false, maxAgeMs: 60_000 });
  assert.match(header, new RegExp(`^${HUMAN_SESSION_COOKIE}=token-value;`));
  assert.match(header, /HttpOnly/);
  assert.match(header, /SameSite=Lax/);
  assert.match(header, /Max-Age=60/);
  assert.doesNotMatch(header, /Secure/);
  assert.match(humanSessionCookieHeader("token-value", { secure: true }), /Secure/);
});

test("verifyTurnstileToken accepts a successful siteverify payload and rejects the rest", async () => {
  const okFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ success: true }), { status: 200 });
  const badFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ success: false }), { status: 200 });
  const downFetch: typeof fetch = async () =>
    new Response("nope", { status: 502 });

  assert.equal(
    (await verifyTurnstileToken("token", { secret: "s", fetchImpl: okFetch })).ok,
    true,
  );
  assert.equal(
    (await verifyTurnstileToken("token", { secret: "s", fetchImpl: badFetch })).ok,
    false,
  );
  const down = await verifyTurnstileToken("token", { secret: "s", fetchImpl: downFetch });
  assert.equal(down.ok, false);
  if (!down.ok) assert.equal(down.unavailable, true);
  assert.equal((await verifyTurnstileToken("", { secret: "s", fetchImpl: okFetch })).ok, false);
  assert.equal((await verifyTurnstileToken("token", { secret: "", fetchImpl: okFetch })).ok, false);
});

/**
 * Rate limits are in-memory by default (per Node/serverless isolate).
 * On Vercel that is weak: each invocation can have a cold isolate, so
 * clients can bypass the cap by spreading across instances.
 *
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for a shared
 * limiter. If those are set and Redis errors, this fails closed.
 */
import {
  MIN_MESSAGE_INTERVAL_MS,
  RATE_LIMIT_MAX_MESSAGES,
  RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  minIntervalMs?: number;
};

type Bucket = {
  hits: number[];
  lastHitAt: number;
};

const g = globalThis as typeof globalThis & {
  __glareRateLimit?: Map<string, Bucket>;
};

function memoryStore() {
  if (!g.__glareRateLimit) {
    g.__glareRateLimit = new Map();
  }
  return g.__glareRateLimit;
}

function upstashConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

async function upstashPipeline(commands: (string | number)[][]) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    throw new Error("Upstash is not configured.");
  }
  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Upstash pipeline failed (${response.status}).`);
  }
  const payload = (await response.json()) as { result?: unknown }[];
  return payload.map((item) => item.result);
}

function hitMemory(
  key: string,
  { windowMs, max, minIntervalMs = 0 }: RateLimitOptions,
  now: number,
): RateLimitResult {
  const buckets = memoryStore();
  const bucket = buckets.get(key) ?? { hits: [], lastHitAt: 0 };

  if (minIntervalMs > 0 && now - bucket.lastHitAt < minIntervalMs) {
    return {
      ok: false,
      retryAfterMs: minIntervalMs - (now - bucket.lastHitAt),
    };
  }

  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0] ?? now;
    return {
      ok: false,
      retryAfterMs: Math.max(200, windowMs - (now - oldest)),
    };
  }

  bucket.hits.push(now);
  bucket.lastHitAt = now;
  buckets.set(key, bucket);
  return { ok: true };
}

async function hitUpstash(
  key: string,
  { windowMs, max, minIntervalMs = 0 }: RateLimitOptions,
): Promise<RateLimitResult> {
  if (minIntervalMs > 0) {
    const gap = await upstashPipeline([
      ["SET", `${key}:gap`, "1", "PX", minIntervalMs, "NX"],
      ["PTTL", `${key}:gap`],
    ]);
    if (gap[0] === null) {
      const ttl = Number(gap[1] ?? minIntervalMs);
      return { ok: false, retryAfterMs: Math.max(200, ttl) };
    }
  }

  const counted = await upstashPipeline([
    ["INCR", key],
    ["PTTL", key],
  ]);
  const count = Number(counted[0]);
  let ttl = Number(counted[1]);
  if (!Number.isFinite(ttl) || ttl < 0) {
    await upstashPipeline([["PEXPIRE", key, windowMs]]);
    ttl = windowMs;
  }
  if (count > max) {
    return { ok: false, retryAfterMs: Math.max(200, ttl) };
  }
  return { ok: true };
}

export async function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
  now = Date.now(),
): Promise<RateLimitResult> {
  if (upstashConfigured()) {
    try {
      return await hitUpstash(key, options);
    } catch {
      return { ok: false, retryAfterMs: 2_000 };
    }
  }
  return hitMemory(key, options, now);
}

export async function hitRateLimit(
  key: string,
  now = Date.now(),
): Promise<RateLimitResult> {
  return consumeRateLimit(
    key,
    {
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX_MESSAGES,
      minIntervalMs: MIN_MESSAGE_INTERVAL_MS,
    },
    now,
  );
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export function usesSharedRateLimitStore() {
  return upstashConfigured();
}

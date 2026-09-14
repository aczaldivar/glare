import {
  MIN_MESSAGE_INTERVAL_MS,
  RATE_LIMIT_MAX_MESSAGES,
  RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";

type Bucket = {
  hits: number[];
  lastHitAt: number;
};

const g = globalThis as typeof globalThis & {
  __glareRateLimit?: Map<string, Bucket>;
};

function store() {
  if (!g.__glareRateLimit) {
    g.__glareRateLimit = new Map();
  }
  return g.__glareRateLimit;
}

export function hitRateLimit(key: string): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const buckets = store();
  const bucket = buckets.get(key) ?? { hits: [], lastHitAt: 0 };

  if (now - bucket.lastHitAt < MIN_MESSAGE_INTERVAL_MS) {
    return {
      ok: false,
      retryAfterMs: MIN_MESSAGE_INTERVAL_MS - (now - bucket.lastHitAt),
    };
  }

  bucket.hits = bucket.hits.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (bucket.hits.length >= RATE_LIMIT_MAX_MESSAGES) {
    const oldest = bucket.hits[0] ?? now;
    return {
      ok: false,
      retryAfterMs: Math.max(200, RATE_LIMIT_WINDOW_MS - (now - oldest)),
    };
  }

  bucket.hits.push(now);
  bucket.lastHitAt = now;
  buckets.set(key, bucket);
  return { ok: true };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

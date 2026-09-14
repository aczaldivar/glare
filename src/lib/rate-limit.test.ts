import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeRateLimit } from "./rate-limit";

test("consumeRateLimit allows a burst then blocks inside the window", async () => {
  const key = `test:${Date.now()}:${Math.random()}`;
  const now = 1_000_000;
  const opts = { windowMs: 10_000, max: 3 };

  assert.equal((await consumeRateLimit(key, opts, now)).ok, true);
  assert.equal((await consumeRateLimit(key, opts, now + 10)).ok, true);
  assert.equal((await consumeRateLimit(key, opts, now + 20)).ok, true);
  const blocked = await consumeRateLimit(key, opts, now + 30);
  assert.equal(blocked.ok, false);
});

test("consumeRateLimit enforces a minimum interval when asked", async () => {
  const key = `gap:${Date.now()}:${Math.random()}`;
  const now = 5_000_000;
  const opts = { windowMs: 10_000, max: 8, minIntervalMs: 400 };

  assert.equal((await consumeRateLimit(key, opts, now)).ok, true);
  const blocked = await consumeRateLimit(key, opts, now + 100);
  assert.equal(blocked.ok, false);
  assert.equal((await consumeRateLimit(key, opts, now + 400)).ok, true);
});

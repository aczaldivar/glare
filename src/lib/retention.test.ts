import assert from "node:assert/strict";
import { test } from "node:test";
import { MESSAGE_RETENTION_MS } from "./constants";
import { isWithinRetention, pruneByRetention } from "./retention";

test("isWithinRetention keeps recent items and drops those past ~30 days", () => {
  const now = Date.UTC(2026, 8, 14);
  assert.equal(isWithinRetention(now, now), true);
  assert.equal(isWithinRetention(now - MESSAGE_RETENTION_MS + 1, now), true);
  assert.equal(isWithinRetention(now - MESSAGE_RETENTION_MS - 1, now), false);
});

test("pruneByRetention filters a mixed list", () => {
  const now = 1_000_000;
  const kept = pruneByRetention(
    [
      { createdAt: now - 10 },
      { createdAt: now - MESSAGE_RETENTION_MS - 50 },
    ],
    now,
  );
  assert.equal(kept.length, 1);
  assert.equal(kept[0].createdAt, now - 10);
});

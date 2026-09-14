import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeMessageText, validateMessageText } from "./messages";

test("normalizeMessageText collapses whitespace and strips control chars", () => {
  assert.equal(normalizeMessageText("  hello   room\n"), "hello room");
  assert.equal(normalizeMessageText("ok\u0007there"), "okthere");
});

test("validateMessageText enforces empty and length rules", () => {
  assert.equal(validateMessageText("   ").ok, false);
  assert.equal(validateMessageText("hello").ok, true);
  assert.equal(validateMessageText("x".repeat(501)).ok, false);
});

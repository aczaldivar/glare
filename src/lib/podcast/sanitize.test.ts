import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeTranscriptText } from "./sanitize";

test("sanitizeTranscriptText strips tags and keeps plain text", () => {
  assert.equal(
    sanitizeTranscriptText('Hello <script>alert(1)</script> <b>world</b>'),
    "Hello world",
  );
  assert.equal(sanitizeTranscriptText("  a &amp; b  "), "a & b");
});

test("sanitizeTranscriptText does not keep raw markup as structure", () => {
  const cleaned = sanitizeTranscriptText('<img src=x onerror="alert(1)">hi');
  assert.equal(cleaned.includes("<img"), false);
  assert.equal(cleaned, "hi");
});

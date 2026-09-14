import assert from "node:assert/strict";
import { test } from "node:test";
import { honeypotFilled } from "./honeypot";

test("honeypotFilled treats blank as empty and any typed value as filled", () => {
  assert.equal(honeypotFilled(undefined), false);
  assert.equal(honeypotFilled(""), false);
  assert.equal(honeypotFilled("\t  \n"), false);
  assert.equal(honeypotFilled("bot"), true);
  assert.equal(honeypotFilled(["x"]), true);
});

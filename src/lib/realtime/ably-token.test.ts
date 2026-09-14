import { ablyChannelName } from "@/lib/constants";
import { ablyClientTokenParams, parseTokenRoom } from "./ably-token";
import { test } from "node:test";
import assert from "node:assert/strict";

test("parseTokenRoom accepts a real room and rejects wildcards", () => {
  assert.equal(parseTokenRoom("lobby"), "lobby");
  assert.equal(parseTokenRoom("After Hours"), null);
  assert.equal(parseTokenRoom("*"), null);
  assert.equal(parseTokenRoom("glare:room:*"), null);
  assert.equal(parseTokenRoom(""), null);
});

test("ablyClientTokenParams scopes subscribe+presence to one room channel", () => {
  const params = ablyClientTokenParams("lobby", "11111111-1111-1111-1111-111111111111");
  const channel = ablyChannelName("lobby");
  assert.equal(params.ttl, 10 * 60 * 1000);
  assert.equal(typeof params.capability, "object");
  const capability = params.capability as Record<string, string[]>;
  assert.deepEqual(Object.keys(capability), [channel]);
  assert.ok(!Object.keys(capability).some((name) => name.includes("*")));
  assert.deepEqual(capability[channel], ["subscribe", "presence"]);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidRoomSlug, roomDisplayName, slugifyRoom } from "./rooms";

test("slugifyRoom normalizes names into shareable slugs", () => {
  assert.equal(slugifyRoom("After Hours"), "after-hours");
  assert.equal(slugifyRoom("  Lobby  "), "lobby");
  assert.equal(slugifyRoom("Rooftop!!!"), "rooftop");
  assert.equal(slugifyRoom("Studio's Light"), "studios-light");
});

test("isValidRoomSlug accepts public room names", () => {
  assert.equal(isValidRoomSlug("lobby"), true);
  assert.equal(isValidRoomSlug("afterhours"), true);
  assert.equal(isValidRoomSlug("hi"), true);
  assert.equal(isValidRoomSlug("a"), false);
  assert.equal(isValidRoomSlug("api"), false);
  assert.equal(isValidRoomSlug("terms"), false);
  assert.equal(isValidRoomSlug("privacy"), false);
  assert.equal(isValidRoomSlug("guidelines"), false);
  assert.equal(isValidRoomSlug("-lobby"), false);
  assert.equal(isValidRoomSlug("after--hours"), false);
});

test("roomDisplayName title-cases slugs", () => {
  assert.equal(roomDisplayName("after-hours"), "After Hours");
});

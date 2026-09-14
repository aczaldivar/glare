import assert from "node:assert/strict";
import { test } from "node:test";
import { contentSecurityPolicy, securityHeaders } from "./security-headers";

test("security headers include frame, nosniff, referrer, and CSP", () => {
  const headers = Object.fromEntries(
    securityHeaders().map((item) => [item.key, item.value]),
  );
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(headers["Content-Security-Policy"] ?? "", /frame-ancestors 'none'/);
});

test("CSP allows Ably websocket/rest hosts and same-origin app traffic", () => {
  const csp = contentSecurityPolicy();
  assert.match(csp, /connect-src 'self'/);
  assert.match(csp, /wss:\/\/\*\.ably\.io/);
  assert.match(csp, /https:\/\/\*\.ably-realtime\.com/);
  assert.match(csp, /default-src 'self'/);
});

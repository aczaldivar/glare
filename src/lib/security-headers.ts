export function contentSecurityPolicy() {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://challenges.cloudflare.com",
    "font-src 'self' data:",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "frame-src 'self' https://challenges.cloudflare.com",
    "connect-src 'self' https://challenges.cloudflare.com https://*.ably.io wss://*.ably.io https://*.ably.net wss://*.ably.net https://*.ably-realtime.com wss://*.ably-realtime.com",
  ].join("; ");
}

export function securityHeaders(): { key: string; value: string }[] {
  return [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  ];
}

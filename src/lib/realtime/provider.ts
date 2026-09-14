import type { RealtimeProvider } from "@/lib/realtime/types";

export function getRealtimeProvider(): RealtimeProvider {
  if (process.env.ABLY_API_KEY?.trim()) return "ably";
  if (process.env.VERCEL) return "unconfigured";
  return "local";
}

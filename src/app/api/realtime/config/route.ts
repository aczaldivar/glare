import { getRealtimeProvider } from "@/lib/realtime/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ provider: getRealtimeProvider() });
}

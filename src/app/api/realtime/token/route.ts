import { NextRequest } from "next/server";
import { ablyChannelName } from "@/lib/constants";
import { isUuid } from "@/lib/messages";
import { getAblyRest } from "@/lib/realtime/ably-server";
import { getRealtimeProvider } from "@/lib/realtime/provider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (getRealtimeProvider() !== "ably") {
    return Response.json(
      { error: "Ably is not configured." },
      { status: 501 },
    );
  }

  const clientId = request.nextUrl.searchParams.get("clientId")?.trim() ?? "";
  if (!isUuid(clientId)) {
    return Response.json({ error: "A valid clientId is required." }, { status: 400 });
  }

  const rest = getAblyRest();
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId,
    ttl: 60 * 60 * 1000,
    capability: {
      [ablyChannelName("*")]: ["subscribe", "presence"],
    },
  });

  return Response.json(tokenRequest);
}

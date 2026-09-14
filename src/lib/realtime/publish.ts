import { ablyChannelName } from "@/lib/constants";
import { publishLocalMessage } from "@/lib/realtime/bus";
import { getAblyRest } from "@/lib/realtime/ably-server";
import { getRealtimeProvider } from "@/lib/realtime/provider";
import type { ChatMessage } from "@/lib/realtime/types";

export async function publishMessage(message: ChatMessage) {
  const provider = getRealtimeProvider();
  if (provider === "ably") {
    const rest = getAblyRest();
    const channel = rest.channels.get(ablyChannelName(message.room));
    await channel.publish("message", message);
    return;
  }
  if (provider === "local") {
    publishLocalMessage(message);
    return;
  }
  throw new Error(
    "Realtime is not configured. Add ABLY_API_KEY to enable production chat.",
  );
}

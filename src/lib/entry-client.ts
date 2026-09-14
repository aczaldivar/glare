import { HONEYPOT_FIELD } from "@/lib/constants";

export async function requestHumanSession(input: {
  honeypot: string;
  turnstileToken: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/realtime/verify", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: input.turnstileToken,
        [HONEYPOT_FIELD]: input.honeypot,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || "Could not enter." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not enter." };
  }
}

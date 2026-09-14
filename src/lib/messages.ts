import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function normalizeMessageText(input: string): string {
  return input.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();
}

export function validateMessageText(input: string): {
  ok: true;
  text: string;
} | { ok: false; error: string } {
  const text = normalizeMessageText(input);
  if (!text) {
    return { ok: false, error: "Message cannot be empty." };
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Keep it under ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }
  return { ok: true, text };
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

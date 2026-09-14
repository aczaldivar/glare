import { HONEYPOT_FIELD } from "@/lib/constants";

export { HONEYPOT_FIELD };

export function honeypotFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value !== "string") return true;
  return value.trim().length > 0;
}

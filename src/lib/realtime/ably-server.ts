import * as Ably from "ably";

const g = globalThis as typeof globalThis & {
  __glareAblyRest?: Ably.Rest;
};

export function getAblyRest(): Ably.Rest {
  const key = process.env.ABLY_API_KEY?.trim();
  if (!key) {
    throw new Error("ABLY_API_KEY is not set.");
  }
  if (!g.__glareAblyRest) {
    g.__glareAblyRest = new Ably.Rest({ key });
  }
  return g.__glareAblyRest;
}

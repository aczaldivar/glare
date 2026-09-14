import { MESSAGE_RETENTION_MS } from "@/lib/constants";

// ~30 day product target. v1 has no durable message DB, so this only
// prunes in-memory history/reports. A scheduled deletion job should reuse
// MESSAGE_RETENTION_DAYS once storage exists. See README.

export function isWithinRetention(createdAt: number, now = Date.now()) {
  return now - createdAt <= MESSAGE_RETENTION_MS;
}

export function pruneByRetention<T extends { createdAt: number }>(
  items: T[],
  now = Date.now(),
) {
  return items.filter((item) => isWithinRetention(item.createdAt, now));
}

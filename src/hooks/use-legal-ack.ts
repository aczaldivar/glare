"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  LEGAL_ACK_EVENT,
  LEGAL_ACK_STORAGE_KEY,
  LEGAL_ACK_VERSION,
} from "@/lib/legal";

type AckRecord = {
  version: number;
  at: string;
};

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LEGAL_ACK_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LEGAL_ACK_EVENT, onStoreChange);
  };
}

function emptySubscribe() {
  return () => {};
}

function getSnapshot() {
  return window.localStorage.getItem(LEGAL_ACK_STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function parseAck(raw: string | null): AckRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AckRecord;
    if (parsed?.version !== LEGAL_ACK_VERSION || typeof parsed.at !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useLegalAck() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const record = useMemo(() => parseAck(raw), [raw]);

  const acknowledge = useCallback(() => {
    const next: AckRecord = {
      version: LEGAL_ACK_VERSION,
      at: new Date().toISOString(),
    };
    window.localStorage.setItem(LEGAL_ACK_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(LEGAL_ACK_EVENT));
  }, []);

  return {
    ready: hydrated,
    acknowledged: hydrated && Boolean(record),
    acknowledgedAt: record?.at ?? null,
    acknowledge,
  };
}

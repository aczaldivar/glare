"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  BLOCKS_EVENT,
  BLOCKS_STORAGE_KEY,
  HIDDEN_MESSAGES_EVENT,
  HIDDEN_MESSAGES_STORAGE_KEY,
} from "@/lib/legal";

function subscribeBlocks(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(BLOCKS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(BLOCKS_EVENT, onStoreChange);
  };
}

function subscribeHidden(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(HIDDEN_MESSAGES_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(HIDDEN_MESSAGES_EVENT, onStoreChange);
  };
}

function getBlockedSnapshot() {
  return window.localStorage.getItem(BLOCKS_STORAGE_KEY);
}

function getHiddenSnapshot() {
  return window.localStorage.getItem(HIDDEN_MESSAGES_STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeList(key: string, eventName: string, values: string[]) {
  window.localStorage.setItem(key, JSON.stringify([...new Set(values)]));
  window.dispatchEvent(new Event(eventName));
}

export function useLocalModeration() {
  const blockedRaw = useSyncExternalStore(
    subscribeBlocks,
    getBlockedSnapshot,
    getServerSnapshot,
  );
  const hiddenRaw = useSyncExternalStore(
    subscribeHidden,
    getHiddenSnapshot,
    getServerSnapshot,
  );

  const blockedIds = useMemo(() => new Set(parseList(blockedRaw)), [blockedRaw]);
  const hiddenMessageIds = useMemo(
    () => new Set(parseList(hiddenRaw)),
    [hiddenRaw],
  );

  const blockUser = useCallback((id: string) => {
    writeList(BLOCKS_STORAGE_KEY, BLOCKS_EVENT, [
      ...parseList(window.localStorage.getItem(BLOCKS_STORAGE_KEY)),
      id,
    ]);
  }, []);

  const unblockUser = useCallback((id: string) => {
    writeList(
      BLOCKS_STORAGE_KEY,
      BLOCKS_EVENT,
      parseList(window.localStorage.getItem(BLOCKS_STORAGE_KEY)).filter(
        (item) => item !== id,
      ),
    );
  }, []);

  const hideMessage = useCallback((id: string) => {
    writeList(HIDDEN_MESSAGES_STORAGE_KEY, HIDDEN_MESSAGES_EVENT, [
      ...parseList(window.localStorage.getItem(HIDDEN_MESSAGES_STORAGE_KEY)),
      id,
    ]);
  }, []);

  return {
    blockedIds,
    hiddenMessageIds,
    blockUser,
    unblockUser,
    hideMessage,
    isBlocked: (id: string) => blockedIds.has(id),
    isMessageHidden: (id: string) => hiddenMessageIds.has(id),
  };
}

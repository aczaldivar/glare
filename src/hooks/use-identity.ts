"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  createIdentity,
  normalizeDisplayName,
  validateDisplayName,
  type Identity,
} from "@/lib/identity";

const STORAGE_KEY = "glare.identity.v1";
const IDENTITY_EVENT = "glare-identity";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(IDENTITY_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(IDENTITY_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function parseIdentity(raw: string | null): Identity | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Identity;
    if (typeof parsed?.id !== "string" || typeof parsed?.name !== "string") {
      return null;
    }
    return {
      id: parsed.id,
      name: normalizeDisplayName(parsed.name) || parsed.name,
    };
  } catch {
    return null;
  }
}

function writeIdentity(next: Identity) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(IDENTITY_EVENT));
}

export function useIdentity() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const identity = useMemo(() => parseIdentity(raw), [raw]);

  useEffect(() => {
    if (parseIdentity(window.localStorage.getItem(STORAGE_KEY))) return;
    writeIdentity(createIdentity());
  }, []);

  const updateName = useCallback(
    (nextName: string) => {
      const result = validateDisplayName(nextName);
      if (!result.ok) return result;
      writeIdentity({
        id: identity?.id ?? crypto.randomUUID(),
        name: result.name,
      });
      return result;
    },
    [identity?.id],
  );

  return { identity, ready: Boolean(identity), updateName };
}
